"""API endpoints for shopping list management."""

from fastapi import APIRouter, HTTPException

from app.models.shopping import (
    ShoppingListResponse,
    AddRecipeRequest,
    UpdateItemRequest,
    AddManualItemRequest,
)
from app.services.shopping_service import shopping_service

router = APIRouter()


@router.get("/{user_id}", response_model=ShoppingListResponse)
async def get_shopping_list(user_id: int):
    """Get shopping list for a user."""
    try:
        return shopping_service.get_shopping_list(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/recipes", response_model=ShoppingListResponse)
async def add_recipe(user_id: int, request: AddRecipeRequest):
    """Add a recipe to the shopping list."""
    try:
        return shopping_service.add_recipe(
            user_id, request.recipe_uri, request.session_id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/recipes/{recipe_uri:path}", response_model=ShoppingListResponse)
async def remove_recipe(user_id: int, recipe_uri: str):
    """Remove a recipe from the shopping list."""
    try:
        return shopping_service.remove_recipe(user_id, recipe_uri)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{user_id}/items/{item_name:path}", response_model=ShoppingListResponse)
async def toggle_item_checked(user_id: int, item_name: str, request: UpdateItemRequest):
    """Toggle item checked status."""
    try:
        return shopping_service.toggle_item_checked(
            user_id, item_name, request.checked
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/items", response_model=ShoppingListResponse)
async def add_manual_item(user_id: int, request: AddManualItemRequest):
    """Add a manual item to the shopping list."""
    try:
        return shopping_service.add_manual_item(
            user_id, request.item_name, request.quantity, request.unit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/items/{item_name:path}", response_model=ShoppingListResponse)
async def delete_item(user_id: int, item_name: str):
    """Delete an item from the shopping list."""
    try:
        return shopping_service.delete_item(user_id, item_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{user_id}/move-to-fridge")
async def move_to_fridge(user_id: int):
    """Move checked items to fridge."""
    try:
        return shopping_service.move_to_fridge(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}", response_model=ShoppingListResponse)
async def clear_shopping_list(user_id: int):
    """Clear the shopping list."""
    try:
        return shopping_service.clear_shopping_list(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
