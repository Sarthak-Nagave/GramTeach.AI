"""init schema

Revision ID: abcd1234
Revises: 
Create Date: 2025-12-06
"""

from alembic import op
import sqlalchemy as sa

revision = 'abcd1234'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'lessons',
        sa.Column('processed_scenes', sa.Text(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column('lessons', 'processed_scenes')
