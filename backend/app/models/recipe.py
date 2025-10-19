"""Pydantic models for recipes from Edamam API."""

from typing import List, Optional
from pydantic import BaseModel, HttpUrl


class EdamamRecipe(BaseModel):
    """Recipe model from Edamam API."""

    uri: str
    label: str
    image: HttpUrl
    source: str
    url: HttpUrl
    ingredientLines: List[str]
    calories: float
    totalTime: float
    cuisineType: List[str] = []
    mealType: List[str] = []
    dishType: List[str] = []
    healthLabels: List[str] = []


class RecipeSearchRequest(BaseModel):
    """Request model for recipe search."""

    user_ids: List[int]


class RecipeSearchResponse(BaseModel):
    """Response model for recipe search."""

    session_id: str
    recipes: List[EdamamRecipe]
    total_found: int


class AllRecipesResponse(BaseModel):
    """Response model for getting all recipes from a session."""

    recipes: List[EdamamRecipe]
    selected_recipe_uris: List[str]
