"""Pydantic models for chat interactions with the agent."""

from typing import List
from pydantic import BaseModel
from app.models.recipe import EdamamRecipe


class ChatMessage(BaseModel):
    """Individual chat message."""

    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    """Request model for chatting with the agent."""

    session_id: str | None = None  # Optional: if None + user_ids provided, create new session
    message: str
    user_ids: List[int] | None = None  # Optional: for creating session on first message


class ChatResponse(BaseModel):
    """Response model for chat interaction."""

    recipes: List[EdamamRecipe]
    response: str
    action_taken: str  # "filtered", "re_searched", "no_change", "initial_search"
    session_id: str | None = None  # Included when new session is created
