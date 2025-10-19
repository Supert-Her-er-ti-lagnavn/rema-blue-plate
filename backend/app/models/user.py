"""Pydantic models for users and preferences."""

from typing import List
from pydantic import BaseModel, EmailStr


class User(BaseModel):
    """User model representing a user in the system."""

    id: int
    name: str
    email: EmailStr
    family: List[int]
    dietLabels: List[str]
    customPreferences: List[str]
    fridge: List[str] = []


class FamilyMember(BaseModel):
    """Simplified family member model for display."""

    id: int
    name: str


class FridgeUpdate(BaseModel):
    """Request model for updating fridge items."""

    items: List[str]


class MergedPreferences(BaseModel):
    """Combined dietary preferences from multiple users."""

    user_ids: List[int]
    diet_labels: List[str]
    excluded_ingredients: List[str]
    fridge_items: List[str]


class UsersDatabase(BaseModel):
    """Root model for users.json database."""

    users: List[User]
