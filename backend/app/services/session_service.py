"""Service for managing user sessions."""

import uuid
from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

from app.models.recipe import EdamamRecipe
from app.models.user import MergedPreferences
from app.models.chat import ChatMessage


class Session(BaseModel):
    """Session model for storing search results and chat history."""

    session_id: str
    user_ids: List[int]
    merged_preferences: MergedPreferences
    all_recipes: List[EdamamRecipe]
    selected_recipes: List[EdamamRecipe]
    chat_history: List[ChatMessage] = []
    created_at: str


class SessionService:
    """Service for managing sessions in memory."""

    def __init__(self):
        self.sessions: Dict[str, Session] = {}

    def create_session(
        self,
        user_ids: List[int],
        merged_preferences: MergedPreferences,
        all_recipes: List[EdamamRecipe],
        selected_recipes: List[EdamamRecipe],
    ) -> str:
        """Create a new session and return the session ID."""
        session_id = str(uuid.uuid4())

        session = Session(
            session_id=session_id,
            user_ids=user_ids,
            merged_preferences=merged_preferences,
            all_recipes=all_recipes,
            selected_recipes=selected_recipes,
            chat_history=[],
            created_at=datetime.now().isoformat(),
        )

        self.sessions[session_id] = session
        return session_id

    def get_session(self, session_id: str) -> Optional[Session]:
        """Get a session by ID."""
        return self.sessions.get(session_id)

    def session_exists(self, session_id: str) -> bool:
        """Check if a session exists."""
        return session_id in self.sessions

    def update_chat_history(
        self, session_id: str, user_message: str, assistant_response: str
    ) -> None:
        """Add messages to chat history."""
        session = self.get_session(session_id)
        if session:
            session.chat_history.append(
                ChatMessage(role="user", content=user_message)
            )
            session.chat_history.append(
                ChatMessage(role="assistant", content=assistant_response)
            )

    def update_selected_recipes(
        self, session_id: str, new_recipes: List[EdamamRecipe]
    ) -> None:
        """Update the selected recipes for a session."""
        session = self.get_session(session_id)
        if session:
            session.selected_recipes = new_recipes

    def get_all_recipes(self, session_id: str) -> Optional[List[EdamamRecipe]]:
        """Get all recipes from a session."""
        session = self.get_session(session_id)
        if session:
            return session.all_recipes
        return None

    def get_selected_recipes(self, session_id: str) -> Optional[List[EdamamRecipe]]:
        """Get selected recipes from a session."""
        session = self.get_session(session_id)
        if session:
            return session.selected_recipes
        return None


# Global instance
session_service = SessionService()
