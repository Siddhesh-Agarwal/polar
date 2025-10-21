"""add min_seats and max_seats to seat based pricing

Revision ID: add_min_max_seats_to_seat_pricing
Revises: add_order_support_to_customer_seats
Create Date: 2025-10-21 01:00:00.000000

"""

import sqlalchemy as sa
from alembic import op

# Polar Custom Imports

# revision identifiers, used by Alembic.
revision = "add_min_max_seats_to_seat_pricing"
down_revision = "add_order_support_to_customer_seats"
branch_labels: tuple[str] | None = None
depends_on: tuple[str] | None = None


def upgrade() -> None:
    # Add min_seats and max_seats columns to product_prices table
    op.add_column(
        "product_prices",
        sa.Column("min_seats", sa.Integer(), nullable=True),
    )
    op.add_column(
        "product_prices",
        sa.Column("max_seats", sa.Integer(), nullable=True),
    )


def downgrade() -> None:
    # Drop min_seats and max_seats columns
    op.drop_column("product_prices", "max_seats")
    op.drop_column("product_prices", "min_seats")
