import uuid

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.auth.models import User
from app.models.grant import Grant
from app.models.internship import Internship
from app.models.recommendation import ItemType
from app.models.scholarship import Scholarship
from app.models.user_interaction import InteractionType, UserInteraction
from app.services.recommendationService import RecommendationService


async def _seed_catalog(session: AsyncSession) -> None:
    session.add_all([
        Grant(
            title="AI Research Grant", description="Funding for artificial intelligence machine learning research labs",
            source_url="https://example.com/ai", provider="NSF", country="United States",
        ),
        Grant(
            title="Climate Innovation Grant", description="Funding for climate technology and clean energy projects",
            source_url="https://example.com/climate", provider="Climate Fund", country="Netherlands",
        ),
        Scholarship(
            title="European Master Scholarship", description="Graduate data science scholarship in Europe",
            source_url="https://example.com/master", provider="EU University", country="Germany", level="master",
        ),
        Internship(
            title="Remote Backend Engineering Internship", description="Remote paid Python API backend internship",
            source_url="https://example.com/backend", provider="Tech Studio", country="Kazakhstan", region="Remote", paid=True,
        ),
        Internship(
            title="Unpaid Museum Internship", description="On-site museum operations internship",
            source_url="https://example.com/museum", provider="Museum", country="Italy", region="Rome", paid=False,
        ),
    ])
    await session.commit()


def _user(**overrides) -> User:
    data = dict(
        uid=uuid.uuid4(), username="bench", email=f"{uuid.uuid4()}@test.com",
        first_name="Bench", last_name="User", role="user", is_verified=True,
        password_hash="not-used", interests="machine learning data science research",
    )
    data.update(overrides)
    return User(**data)


async def _top_titles(user: User, session: AsyncSession) -> list[str]:
    session.add(user)
    await session.commit()
    recs = await RecommendationService().recompute_for_user(user, session)
    models = {"grant": Grant, "scholarship": Scholarship, "internship": Internship}
    return [(await session.get(models[rec.item_type], rec.item_id)).title for rec in recs]


async def test_remote_paid_preference_promotes_matching_internship(session: AsyncSession):
    await _seed_catalog(session)

    titles = await _top_titles(
        _user(
            interests="backend Python remote internship", preferred_types="internship",
            countries="Kazakhstan", remote_only=True, paid_only=True,
        ),
        session,
    )

    assert titles[0] == "Remote Backend Engineering Internship"


async def test_hidden_item_is_excluded_from_recomputed_results(session: AsyncSession):
    await _seed_catalog(session)
    user = _user(interests="backend Python remote internship", preferred_types="internship")
    titles = await _top_titles(user, session)
    assert "Remote Backend Engineering Internship" in titles

    backend = (
        await session.exec(select(Internship).where(Internship.title == "Remote Backend Engineering Internship"))
    ).one()
    session.add(UserInteraction(
        user_id=user.uid, item_id=backend.id, item_type=ItemType.internship,
        interaction_type=InteractionType.hide, weight=1.0,
    ))
    await session.commit()

    recs = await RecommendationService().recompute_for_user(user, session)
    assert all(not (rec.item_type == "internship" and rec.item_id == backend.id) for rec in recs)
