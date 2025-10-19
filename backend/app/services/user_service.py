"""Service for managing users and their preferences."""

import json
from typing import List, Optional
from pathlib import Path

from app.models.user import (
    User,
    FamilyMember,
    MergedPreferences,
    UsersDatabase,
    UserRegisterRequest,
    UserUpdateRequest,
)
from app.config import settings


class UserService:
    """Service for user-related operations."""

    def __init__(self):
        self.db_path = settings.USERS_DB_PATH
        self._load_users()

    def _load_users(self) -> None:
        """Load users from JSON database."""
        with open(self.db_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self.db = UsersDatabase(**data)

    def _save_users(self) -> None:
        """Save users to JSON database."""
        with open(self.db_path, "w", encoding="utf-8") as f:
            json.dump(self.db.model_dump(), f, indent=2, ensure_ascii=False)

    def save_users(self) -> None:
        """Public method to save users to JSON database."""
        self._save_users()

    def get_user(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        for user in self.db.users:
            if user.id == user_id:
                return user
        return None

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email."""
        for user in self.db.users:
            if user.email.lower() == email.lower():
                return user
        return None

    def create_user(self, request: UserRegisterRequest) -> User:
        """Create a new user."""
        # Check if email already exists
        if self.get_user_by_email(request.email):
            raise ValueError(f"User with email {request.email} already exists")

        # Generate new user ID
        max_id = max((user.id for user in self.db.users), default=0)
        new_id = max_id + 1

        # Create new user
        new_user = User(
            id=new_id,
            name=request.name,
            email=request.email,
            family=[],
            dietLabels=request.dietLabels,
            customPreferences=request.customPreferences,
            fridge=[],
            shopping_list={},
        )

        # Add to database
        self.db.users.append(new_user)
        self._save_users()

        return new_user

    def update_user(self, user_id: int, request: UserUpdateRequest) -> User:
        """Update user profile."""
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        # Update fields if provided
        if request.name is not None:
            user.name = request.name
        if request.dietLabels is not None:
            user.dietLabels = request.dietLabels
        if request.customPreferences is not None:
            user.customPreferences = request.customPreferences
        if request.family is not None:
            user.family = request.family

        # Update in database
        for db_user in self.db.users:
            if db_user.id == user_id:
                db_user.name = user.name
                db_user.dietLabels = user.dietLabels
                db_user.customPreferences = user.customPreferences
                db_user.family = user.family
                break

        self._save_users()
        return user

    def get_family_members(self, user_id: int) -> List[FamilyMember]:
        """Get family members for a user."""
        user = self.get_user(user_id)
        if not user:
            return []

        family_members = []
        for family_id in user.family:
            family_user = self.get_user(family_id)
            if family_user:
                family_members.append(
                    FamilyMember(id=family_user.id, name=family_user.name)
                )
        return family_members

    def add_family_member(self, user_id: int, member_email: str) -> List[FamilyMember]:
        """Add a family member by email."""
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        # Find the member by email
        member = self.get_user_by_email(member_email)
        if not member:
            raise ValueError(f"User with email {member_email} not found")

        # Don't add yourself
        if member.id == user_id:
            raise ValueError("Cannot add yourself as a family member")

        # Don't add if already in family
        if member.id in user.family:
            raise ValueError(f"{member.name} is already in your family")

        # Add to family
        user.family.append(member.id)

        # Update in database
        for db_user in self.db.users:
            if db_user.id == user_id:
                db_user.family = user.family
                break

        self._save_users()
        return self.get_family_members(user_id)

    def remove_family_member(self, user_id: int, member_id: int) -> List[FamilyMember]:
        """Remove a family member."""
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        # Remove from family
        if member_id in user.family:
            user.family.remove(member_id)

            # Update in database
            for db_user in self.db.users:
                if db_user.id == user_id:
                    db_user.family = user.family
                    break

            self._save_users()

        return self.get_family_members(user_id)

    def get_fridge(self, user_id: int) -> List[str]:
        """Get fridge items for a user."""
        user = self.get_user(user_id)
        if not user:
            return []
        return user.fridge

    def update_fridge(self, user_id: int, items: List[str]) -> List[str]:
        """Update fridge items for a user."""
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found")

        # Update the user's fridge
        for db_user in self.db.users:
            if db_user.id == user_id:
                db_user.fridge = items
                break

        # Save to database
        self._save_users()

        return items

    def merge_preferences(self, user_ids: List[int]) -> MergedPreferences:
        """
        Merge dietary preferences from multiple users.

        Combines all diet labels and custom preferences from the specified users.
        """
        all_diet_labels = set()
        all_excluded = set()
        all_fridge_items = set()
        all_custom_preferences = set()

        for user_id in user_ids:
            user = self.get_user(user_id)
            if user:
                # Add diet labels
                all_diet_labels.update(user.dietLabels)
                # Add custom preferences
                all_custom_preferences.update(user.customPreferences)
                # Add fridge items
                all_fridge_items.update(user.fridge)

        return MergedPreferences(
            user_ids=user_ids,
            diet_labels=list(all_diet_labels),
            excluded_ingredients=list(all_excluded),
            fridge_items=list(all_fridge_items),
            custom_preferences=list(all_custom_preferences),
        )


# Global instance
user_service = UserService()
