from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.db.main import get_session
from app.auth.dependencies import get_current_user, RoleChecker
from app.auth.models import User
from app.schemes.recommendation import RecommendationCreate, RecommendationRead
from app.schemes.user_interaction import UserInteractionCreate, UserInteractionRead
from app.services.recommendationService import RecommendationService
from app.models.user_interaction import InteractionType, UserInteraction

router = APIRouter()

check_admin = RoleChecker(["admin"])
check_user = RoleChecker(["user"])

recommendation_service = RecommendationService()

INTERACTION_BASE_WEIGHTS = {
    InteractionType.view: 1.0,
    InteractionType.save: 2.0,
    InteractionType.apply: 3.0,
    InteractionType.hide: 1.0,
}

@router.get("/")
async def get_user_recommendations(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    recommendations = await recommendation_service.get_recommendations_for_user(current_user.uid, session)
    return {
        "user_id": str(current_user.uid),
        "recommendations": recommendations
    }

@router.post("/", response_model=List[RecommendationRead], status_code=201)
async def create(
    recommendations: List[RecommendationCreate],
    session: AsyncSession = Depends(get_session),
    _: bool = Depends(check_admin)  # dev: use check_user; prod: use check_admin
):
    return await recommendation_service.create_recommendations(recommendations, session)


@router.post("/recompute", response_model=List[RecommendationRead], status_code=200)
async def recompute(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    """
    Пересчитывает ML-рекомендации (TF-IDF по полю User.interests) для
    текущего пользователя и заменяет его предыдущие ML-рекомендации.
    """
    return await recommendation_service.recompute_for_user(current_user, session)


@router.post("/interactions", response_model=UserInteractionRead, status_code=201)
async def create_interaction(
    interaction: UserInteractionCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    event = UserInteraction(
        user_id=current_user.uid,
        item_id=interaction.item_id,
        item_type=interaction.item_type,
        interaction_type=interaction.interaction_type,
        weight=INTERACTION_BASE_WEIGHTS[interaction.interaction_type],
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event

@router.delete("/{rec_id}", status_code=204)
async def delete(
    rec_id: UUID,
    session: AsyncSession = Depends(get_session),
    _: bool = Depends(check_admin)
):
    try:
        await recommendation_service.delete_recommendation(rec_id, session)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
