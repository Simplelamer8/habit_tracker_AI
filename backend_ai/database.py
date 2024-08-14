from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(
    "postgresql://postgres_user:habiPmmnpAf8mPWrrfacbSvo8MJzX9RB@dpg-cqqf2hogph6c738ak080-a.frankfurt-postgres.render.com/habit_tracker_ai"
)

new_session = async_sessionmaker(engine, expire_on_commit=False)
