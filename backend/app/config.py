from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/product_graph"
    cors_origins: list[str] = ["http://localhost:3000"]

    model_config = {"env_prefix": "PGR_"}


settings = Settings()
