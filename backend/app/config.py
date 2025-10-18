"""Configuration management for the application."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings:
    """Application settings loaded from environment variables."""

    # Edamam API Configuration
    EDAMAM_APP_ID: str = os.getenv("EDAMAM_APP_ID", "")
    EDAMAM_APP_KEY: str = os.getenv("EDAMAM_APP_KEY", "")
    EDAMAM_BASE_URL: str = "https://api.edamam.com/api/recipes/v2"

    # OpenAI API Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = "gpt-4o-mini"

    # Application Configuration
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Database Configuration
    DATABASE_DIR: Path = Path(__file__).parent.parent / "databases"
    USERS_DB_PATH: Path = DATABASE_DIR / "users.json"

    # API Configuration
    MAX_RECIPES_FETCH: int = 30  # Max recipes to fetch from Edamam
    MIN_RECIPES_SELECT: int = 5  # Min recipes agent should select
    MAX_RECIPES_SELECT: int = 10  # Max recipes agent should select

    def validate(self) -> None:
        """Validate that required configuration is present."""
        if not self.EDAMAM_APP_ID:
            raise ValueError("EDAMAM_APP_ID is not set in environment")
        if not self.EDAMAM_APP_KEY:
            raise ValueError("EDAMAM_APP_KEY is not set in environment")
        if not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not set in environment")
        if not self.USERS_DB_PATH.exists():
            raise ValueError(f"Users database not found at {self.USERS_DB_PATH}")


# Global settings instance
settings = Settings()
