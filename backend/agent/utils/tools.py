"""Tools for the LangGraph agent to interact with services."""

from typing import List, Optional
from langchain.tools import tool


@tool
async def search_edamam_recipes(
    health_labels: Optional[List[str]] = None,
    excluded: Optional[List[str]] = None,
    query: Optional[str] = None,
    max_results: int = 30,
) -> List[dict]:
    """
    Search for recipes using the Edamam Recipe API.

    This tool allows you to search for recipes based on health restrictions,
    excluded ingredients, and general search queries. You have full control
    over search parameters to find the best recipes for the users.

    Args:
        health_labels: List of health labels like ["vegan", "dairy-free", "gluten-free"]
        excluded: List of ingredients to exclude (e.g., ["fish", "nuts"])
        query: General search query (e.g., "pasta", "chicken curry", "quick meals")
        max_results: Maximum number of results (default 30)

    Returns:
        List of recipe dictionaries with full details (ingredients, nutrition, etc.)

    Examples:
        - search_edamam_recipes(health_labels=["vegan"], query="pasta")
        - search_edamam_recipes(excluded=["fish", "shellfish"], max_results=30)
        - search_edamam_recipes(health_labels=["gluten-free"], query="dessert")
    """
    from app.services.edamam_service import edamam_service

    recipes = await edamam_service.search_recipes(
        health_labels=health_labels or [],
        excluded=excluded or [],
        query=query,
        max_results=max_results,
    )

    # Convert to dict for agent consumption
    return [recipe.model_dump() for recipe in recipes]


@tool
def get_user_preferences(user_ids: List[int]) -> dict:
    """
    Get merged dietary preferences for a list of users.

    Args:
        user_ids: List of user IDs

    Returns:
        Dictionary with diet_labels and excluded_ingredients
    """
    from app.services.user_service import user_service

    prefs = user_service.merge_preferences(user_ids)
    return prefs.model_dump()


# Export all tools
tools = [search_edamam_recipes, get_user_preferences]
