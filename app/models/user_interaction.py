from datetime import datetime
from enum import Enum
from uuid import UUID, uuid4

import sqlalchemy.dialects.postgresql as pg
from sqlmodel import Column, Field, SQLModel

from app.models.recommendation import ItemType


class InteractionType(str, Enum):
    view = "view"
    save = "save"
    apply = "apply"
    hide = "hide"


class UserInteraction(SQLModel, table=True):
    __tablename__ = "user_interactions"

    id: UUID = Field(default_factory=uuid4, primary_key=True, index=True)
    user_id: UUID = Field(foreign_key="users.uid", index=True)
    item_id: int = Field(index=True)
    item_type: ItemType = Field(index=True)
    interaction_type: InteractionType = Field(index=True)
    weight: float = Field(default=1.0)
    created_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.now))
