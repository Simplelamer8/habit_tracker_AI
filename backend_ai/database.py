from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

engine = create_async_engine(
    "postgresql://postgres:qwerty@localhost:5432/vector_db"
)

new_session = async_sessionmaker(engine, expire_on_commit=False)