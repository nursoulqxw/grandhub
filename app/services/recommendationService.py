from uuid import UUID
from typing import Any, List
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.auth.models import User
from app.models.recommendation import Recommendation
from app.models.grant import Grant
from app.models.internship import Internship
from app.models.scholarship import Scholarship
from app.models.user_interaction import InteractionType, UserInteraction
from app.schemes.recommendation import RecommendationCreate
from app.ml.recommender import (
    HYBRID_SOURCE_MODEL,
    LSA_SOURCE_MODEL,
    SOURCE_MODEL,
    ScoredItem,
    rank_items_by_interest_lsa,
)

type_map = {
    "grant": Grant,
    "internship": Internship,
    "scholarship": Scholarship
}

INTERACTION_WEIGHTS = {
    InteractionType.view: 0.02,
    InteractionType.save: 0.12,
    InteractionType.apply: 0.20,
    InteractionType.hide: -0.45,
}


def _split_csv(value: str | None) -> set[str]:
    return {part.strip().lower() for part in (value or "").split(",") if part.strip()}


def _deadline_score(deadline) -> float:
    if not deadline:
        return 0.04
    now = datetime.now(timezone.utc)
    if deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    days_left = (deadline - now).days
    if days_left < 0:
        return -0.35
    if days_left <= 7:
        return 0.06
    if days_left <= 90:
        return 0.12
    return 0.08


def _matches_degree(item: Any, degree_level: str | None) -> bool:
    return bool(
        degree_level
        and getattr(item, "level", None)
        and degree_level.lower() in item.level.lower()
    )


def _matches_remote(item: Any) -> bool:
    text = " ".join(
        str(getattr(item, field, "") or "")
        for field in ("region", "title", "description")
    ).lower()
    return "remote" in text or "online" in text


class RecommendationService:
    async def get_recommendations_for_user(self, user_id: UUID, session: AsyncSession) -> List[dict]:
        statement = select(Recommendation).where(Recommendation.user_id == user_id)
        result = await session.execute(statement)
        recommendations = result.scalars().all()

        grouped_ids: dict[str,List[int]] = {"grant":[],"internship":[],"scholarship":[]}
        for rec in recommendations:
            if rec.item_type in grouped_ids:
                grouped_ids[rec.item_type].append(rec.item_id)

        loaded_items: dict[str, dict[int, Any]] = {}

        for item_type, ids in grouped_ids.items():
            model = type_map.get(item_type)
            if model and ids:
                statement = select(model).where(model.id.in_(ids))
                res = await session.execute(statement)
                items = res.scalars().all()
                loaded_items[item_type] = {item.id: item for item in items}

        items = []
        for rec in recommendations:
            item = loaded_items.get(rec.item_type, {}).get(rec.item_id)
            if item:
                items.append({
                    "type": rec.item_type,
                    "item_id": rec.item_id,
                    "score": rec.score,
                    "source_model": rec.source_model,
                    "data": item
                })

        return items



    async def create_recommendations(
        self,
        data: List[RecommendationCreate],
        session: AsyncSession
    ) -> List[Recommendation]:
        objs = [Recommendation(**rec.model_dump()) for rec in data]
        session.add_all(objs)
        await session.commit()
        for obj in objs:
            await session.refresh(obj)
        return objs


    async def delete_recommendation(self, rec_id: UUID, session: AsyncSession) -> None:
        result = await session.exec(select(Recommendation).where(Recommendation.id == rec_id))
        rec = result.one_or_none()

        if not rec:
            raise Exception("Recommendation not found")

        await session.delete(rec)
        await session.commit()

    async def recompute_for_user(
        self, user: User, session: AsyncSession, top_n_per_type: int = 5
    ) -> List[Recommendation]:
        """
        Совмещает semantic score с указанными предпочтениями и действиями
        пользователя. Старые версии модели заменяются без накопления дублей.
        """
        preferred_types = _split_csv(user.preferred_types)
        countries = _split_csv(user.countries)
        interactions = (
            await session.exec(select(UserInteraction).where(UserInteraction.user_id == user.uid))
        ).all()
        interaction_scores: dict[tuple[str, int], float] = {}
        hidden_items: set[tuple[str, int]] = set()
        for event in interactions:
            key = (event.item_type.value, event.item_id)
            interaction_scores[key] = interaction_scores.get(key, 0.0) + INTERACTION_WEIGHTS[event.interaction_type]
            if event.interaction_type == InteractionType.hide:
                hidden_items.add(key)

        ranked: list[ScoredItem] = []
        for item_type, model in type_map.items():
            objs = (await session.exec(select(model))).all()
            items = [
                (item_type, obj.id, f"{obj.title} {obj.description}") for obj in objs
            ]
            semantic_scores = {
                scored.item_id: scored.score
                for scored in rank_items_by_interest_lsa(
                    user.interests or "", items, top_n=max(top_n_per_type * 4, top_n_per_type)
                )
            }
            for obj in objs:
                key = (item_type, obj.id)
                if key in hidden_items:
                    continue

                score = 0.62 * semantic_scores.get(obj.id, 0.0)
                score += 0.10 if item_type in preferred_types else 0.0
                score += 0.10 if countries and (getattr(obj, "country", "") or "").lower() in countries else 0.0
                score += 0.08 if _matches_degree(obj, user.degree_level) else 0.0
                score += 0.06 if user.remote_only and _matches_remote(obj) else 0.0
                score += 0.06 if user.paid_only and item_type == "internship" and getattr(obj, "paid", None) else 0.0
                score += _deadline_score(getattr(obj, "deadline", None))
                score += interaction_scores.get(key, 0.0)
                if score >= 0.05:
                    ranked.append(ScoredItem(item_type=item_type, item_id=obj.id, score=score))

        ranked.sort(key=lambda item: item.score, reverse=True)
        ranked = ranked[: top_n_per_type * len(type_map)]

        old_stmt = select(Recommendation).where(
            Recommendation.user_id == user.uid,
            Recommendation.source_model.in_([SOURCE_MODEL, LSA_SOURCE_MODEL, HYBRID_SOURCE_MODEL]),
        )
        old_recs = (await session.exec(old_stmt)).all()
        for old in old_recs:
            await session.delete(old)

        new_recs = [
            Recommendation(
                user_id=user.uid,
                item_id=scored.item_id,
                item_type=scored.item_type,
                score=scored.score,
                source_model=HYBRID_SOURCE_MODEL,
            )
            for scored in ranked
        ]
        session.add_all(new_recs)
        await session.commit()
        for rec in new_recs:
            await session.refresh(rec)
        return new_recs
