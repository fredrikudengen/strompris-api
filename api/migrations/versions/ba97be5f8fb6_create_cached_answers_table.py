"""create cached_answers table

Revision ID: ba97be5f8fb6
Revises: 29b511c6a543
Create Date: 2026-04-08 14:15:47.464882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ba97be5f8fb6'
down_revision: Union[str, Sequence[str], None] = '29b511c6a543'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('cached_answers',
    sa.Column('question', sa.String(), nullable=False),
    sa.Column('answer', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('region', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('question', 'region'),
    )

def downgrade() -> None:
    op.drop_table('cached_answers')
    # ### end Alembic commands ###
