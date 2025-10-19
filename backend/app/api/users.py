"""API endpoints for user-related operations."""

from typing import List
from fastapi import APIRouter, HTTPException
from app.models.user import FamilyMember, FridgeUpdate
from app.services.user_service import user_service

router = APIRouter()


@router.get("/{user_id}/family", response_model=List[FamilyMember])
async def get_family_members(user_id: int):
    """
    Get family members for a user.

    Returns a list of family member names and IDs that the user can choose
    to cook with.
    """
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    family_members = user_service.get_family_members(user_id)
    return family_members


@router.get("/{user_id}/fridge", response_model=List[str])
async def get_fridge(user_id: int):
    """
    Get fridge items for a user.

    Returns the list of ingredients the user currently has in their fridge.
    """
    user = user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User {user_id} not found")

    fridge_items = user_service.get_fridge(user_id)
    return fridge_items


@router.put("/{user_id}/fridge", response_model=List[str])
async def update_fridge(user_id: int, update: FridgeUpdate):
    """
    Update fridge items for a user.

    Replace the user's fridge contents with the provided list of items.
    """
    try:
        updated_items = user_service.update_fridge(user_id, update.items)
        return updated_items
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
