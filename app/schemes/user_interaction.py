from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.recommendation import ItemType
from app.models.user_interaction import InteractionType


class UserInteractionCreate(BaseModel):
    item_id: int
    item_type: ItemType
    interaction_type: InteractionType


class UserInteractionRead(UserInteractionCreate):
    id: UUID
    user_id: UUID
    weight: float
    created_at: datetime
