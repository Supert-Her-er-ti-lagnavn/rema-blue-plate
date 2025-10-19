"""API endpoints for user-related operations."""

from typing import List
from fastapi import APIRouter, HTTPException
from app.models.user import (
    User,
    FamilyMember,
    FridgeUpdate,
    UserLoginRequest,
    UserRegisterRequest,
    UserUpdateRequest,
)
from app.services.user_service import user_service

router = APIRouter()


@router.post("/login", response_model=User)
async def login(request: UserLoginRequest):
    """
    Login user by email.

    Returns user object if email exists, 404 if not found.
    """
    user = user_service.get_user_by_email(request.email)
    if not user:
        raise HTTPException(
            status_code=404, detail=f"User with email {request.email} not found"
        )
    return user


@router.post("/register", response_model=User)
async def register(request: UserRegisterRequest):
    """
    Register a new user.

    Returns created user object, 400 if email already exists.
    """
    try:
        user = user_service.create_user(request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{user_id}", response_model=User)
async def update_user(user_id: int, request: UserUpdateRequest):
    """
    Update user profile.

    Updates name, diet labels, custom preferences, or family members.
    """
    try:
        user = user_service.update_user(user_id, request)
        return user
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


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


@router.post("/{user_id}/family/{member_email}", response_model=List[FamilyMember])
async def add_family_member(user_id: int, member_email: str):
    """
    Add a family member by email.

    Returns updated list of family members.
    """
    try:
        family_members = user_service.add_family_member(user_id, member_email)
        return family_members
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{user_id}/family/{member_id}", response_model=List[FamilyMember])
async def remove_family_member(user_id: int, member_id: int):
    """
    Remove a family member.

    Returns updated list of family members.
    """
    try:
        family_members = user_service.remove_family_member(user_id, member_id)
        return family_members
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


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
