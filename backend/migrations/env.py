"""
migrations/env.py

Alembic environment — connects all SQLAlchemy models so
autogenerate can detect schema changes.

To create a new migration:
    uv run alembic revision --autogenerate -m "describe_change"

To apply migrations:
    uv run alembic upgrade head
"""

import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# ── Load app config ───────────────────────────────────────────────────────────
from app.config import get_settings
from app.database import Base

# ── Import ALL models so Alembic can detect them ─────────────────────────────
# Every new model file MUST be imported here or Alembic won't see it.
from app.models.user          import User           # noqa: F401
from app.models.transaction   import Transaction    # noqa: F401
from app.models.savings_goal  import SavingsGoal    # noqa: F401
from app.models.chat_session  import ChatSession, ChatMessage  # noqa: F401
from app.models.community_post import CommunityPost # noqa: F401
from app.models.badge         import Badge          # noqa: F401
from app.models.user_badge    import UserBadge      # noqa: F401

settings = get_settings()

# ── Alembic config ────────────────────────────────────────────────────────────
config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


# ── Offline mode ──────────────────────────────────────────────────────────────
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


# ── Online mode (async) ───────────────────────────────────────────────────────
def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
