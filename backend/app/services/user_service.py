"""Service for managing users and their preferences."""

import json
from typing import List, Optional
from pathlib import Path

from app.models.user import (
    User,
    FamilyMember,
    MergedPreferences,
    UsersDatabase,
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

    def get_user(self, user_id: int) -> Optional[User]:
        """Get a user by ID."""
        for user in self.db.users:
            if user.id == user_id:
                return user
        return None

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

        for user_id in user_ids:
            user = self.get_user(user_id)
            if user:
                # Add diet labels
                all_diet_labels.update(user.dietLabels)
                # Add custom preferences (already in English)
                all_excluded.update(user.customPreferences)
                # Add fridge items
                all_fridge_items.update(user.fridge)

        return MergedPreferences(
            user_ids=user_ids,
            diet_labels=list(all_diet_labels),
            excluded_ingredients=list(all_excluded),
            fridge_items=list(all_fridge_items),
        )


# Global instance
user_service = UserService()
