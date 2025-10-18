from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db

router = APIRouter()

# In-memory shopping list for development
shopping_list_storage = []

@router.get("/list")
async def get_shopping_list():
    """Get current shopping list"""
    return {
        "id": 1,
        "user_id": 1,
        "items": shopping_list_storage,
        "total_cost": sum(item.get("price", 0) for item in shopping_list_storage),
        "total_items": len(shopping_list_storage)
    }

@router.post("/list/add")
async def add_to_shopping_list(item: dict):
    """Add item to shopping list"""
    new_item = {
        "id": len(shopping_list_storage) + 1,
        "ingredient_name": item.get("ingredient_name"),
        "amount": item.get("amount"),
        "price": item.get("price", 0),
        "is_collected": False,
        "meal_source": item.get("meal_source", "")
    }
    shopping_list_storage.append(new_item)
    return {"message": "Item added to shopping list", "item": new_item}

@router.post("/list/add-meal")
async def add_meal_to_shopping_list(meal: dict):
    """Add all ingredients from a meal to shopping list"""
    added_items = []
    for ingredient in meal.get("ingredients", []):
        new_item = {
            "id": len(shopping_list_storage) + len(added_items) + 1,
            "ingredient_name": ingredient.get("name"),
            "amount": ingredient.get("amount"),
            "price": ingredient.get("price", 0),
            "is_collected": False,
            "meal_source": meal.get("title", "")
        }
        shopping_list_storage.append(new_item)
        added_items.append(new_item)
    
    return {
        "message": f"Added {len(added_items)} items from {meal.get('title', 'meal')}",
        "items": added_items
    }

@router.put("/list/item/{item_id}")
async def update_shopping_item(item_id: int, updates: dict):
    """Update shopping list item (e.g., mark as collected)"""
    for item in shopping_list_storage:
        if item["id"] == item_id:
            item.update(updates)
            return {"message": "Item updated", "item": item}
    
    raise HTTPException(status_code=404, detail="Item not found")

@router.delete("/list/item/{item_id}")
async def remove_from_shopping_list(item_id: int):
    """Remove item from shopping list"""
    global shopping_list_storage
    shopping_list_storage = [item for item in shopping_list_storage if item["id"] != item_id]
    return {"message": "Item removed from shopping list"}

@router.delete("/list/clear")
async def clear_shopping_list():
    """Clear entire shopping list"""
    global shopping_list_storage
    shopping_list_storage.clear()
    return {"message": "Shopping list cleared"}

@router.get("/navigation")
async def get_store_navigation():
    """Get store navigation data for shopping mode"""
    return {
        "current_location": "entrance",
        "available_directions": ["north", "east", "west"],
        "nearby_sections": ["produce", "dairy", "meat"],
        "estimated_shopping_time": "15 minutes",
        "items_remaining": len([item for item in shopping_list_storage if not item.get("is_collected", False)])
    }