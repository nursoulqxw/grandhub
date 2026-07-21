"""add recommendation preferences and interactions

Revision ID: c3d1e7a9f4b2
Revises: 8a52c5dcc2de
"""
from alembic import op
import sqlalchemy as sa


revision = "c3d1e7a9f4b2"
down_revision = "8a52c5dcc2de"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("preferred_types", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("countries", sa.Text(), nullable=True))
    op.add_column("users", sa.Column("degree_level", sa.String(), nullable=True))
    op.add_column("users", sa.Column("remote_only", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.add_column("users", sa.Column("paid_only", sa.Boolean(), nullable=False, server_default=sa.false()))

    op.create_table(
        "user_interactions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("item_type", sa.Enum("grant", "internship", "scholarship", name="itemtype"), nullable=False),
        sa.Column("interaction_type", sa.Enum("view", "save", "apply", "hide", name="interactiontype"), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.uid"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_user_interactions_id", "user_interactions", ["id"])
    op.create_index("ix_user_interactions_user_id", "user_interactions", ["user_id"])
    op.create_index("ix_user_interactions_item_id", "user_interactions", ["item_id"])
    op.create_index("ix_user_interactions_item_type", "user_interactions", ["item_type"])
    op.create_index("ix_user_interactions_interaction_type", "user_interactions", ["interaction_type"])


def downgrade() -> None:
    op.drop_index("ix_user_interactions_interaction_type", table_name="user_interactions")
    op.drop_index("ix_user_interactions_item_type", table_name="user_interactions")
    op.drop_index("ix_user_interactions_item_id", table_name="user_interactions")
    op.drop_index("ix_user_interactions_user_id", table_name="user_interactions")
    op.drop_index("ix_user_interactions_id", table_name="user_interactions")
    op.drop_table("user_interactions")
    op.drop_column("users", "paid_only")
    op.drop_column("users", "remote_only")
    op.drop_column("users", "degree_level")
    op.drop_column("users", "countries")
    op.drop_column("users", "preferred_types")
