"""Pydantic models for users and preferences."""

from typing import List, Optional
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
    shopping_list: List = []


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
    custom_preferences: List[str]


class UsersDatabase(BaseModel):
    """Root model for users.json database."""

    users: List[User]


class UserLoginRequest(BaseModel):
    """Request model for user login."""

    email: EmailStr


class UserRegisterRequest(BaseModel):
    """Request model for user registration."""

    email: EmailStr
    name: str
    dietLabels: List[str] = []
    customPreferences: List[str] = []


class UserUpdateRequest(BaseModel):
    """Request model for updating user profile."""

    name: Optional[str] = None
    dietLabels: Optional[List[str]] = None
    customPreferences: Optional[List[str]] = None
    family: Optional[List[int]] = None
