"""Shopping list models."""

from typing import List
from pydantic import BaseModel


class RecipeSource(BaseModel):
    """Recipe source for shopping item."""
    recipe_name: str
    quantity: float
    count: int


class CombinedShoppingItem(BaseModel):
    """Combined shopping item from multiple recipes."""
    name: str
    total_quantity: float
    unit: str
    checked: bool = False
    price_per_unit: float = 0.0
    total_price: float = 0.0
    sources: List[RecipeSource] = []


class RecipeSummary(BaseModel):
    """Recipe summary for shopping list."""
    recipe_uri: str
    recipe_name: str
    recipe_image: str = ""
    count: int = 1
    date_added: str


class ShoppingListResponse(BaseModel):
    """Shopping list response."""
    combined_items: List[CombinedShoppingItem]
    total_cost: float
    total_items: int
    recipes: List[RecipeSummary]


class AddRecipeRequest(BaseModel):
    """Request to add recipe to shopping list."""
    recipe_uri: str
    session_id: str


class UpdateItemRequest(BaseModel):
    """Request to update shopping item."""
    checked: bool


class AddManualItemRequest(BaseModel):
    """Request to add manual item to shopping list."""
    item_name: str
    quantity: float
    unit: str
