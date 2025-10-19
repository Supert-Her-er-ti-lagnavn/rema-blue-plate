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
    yield_servings: int = 4  # Number of servings (renamed to avoid Python keyword)
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
    selected_recipes: List[EdamamRecipe]
    search_results: List[EdamamRecipe]
    merged_preferences: dict


class AllRecipesResponse(BaseModel):
    """Response model for getting all recipes from a session."""

    recipes: List[EdamamRecipe]
    selected_recipe_uris: List[str]
