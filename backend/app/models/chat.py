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

    session_id: str
    message: str


class ChatResponse(BaseModel):
    """Response model for chat interaction."""

    recipes: List[EdamamRecipe]
    response: str
    action_taken: str  # "filtered", "re_searched", "no_change"
