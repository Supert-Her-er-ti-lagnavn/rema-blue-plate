"""Tools for the LangGraph agent to interact with services."""

from typing import List, Optional
from langchain.tools import tool


@tool
async def search_edamam_recipes(
    health_labels: Optional[List[str]] = None,
    excluded: Optional[List[str]] = None,
    query: Optional[str] = None,
    cuisine_type: Optional[List[str]] = None,
    meal_type: Optional[List[str]] = None,
    dish_type: Optional[List[str]] = None,
    diet: Optional[List[str]] = None,
    ingr: Optional[str] = None,
    time: Optional[str] = None,
    max_results: int = 30,
) -> List[dict]:
    """
    Search for recipes using the Edamam Recipe API.

    You have full control over all search parameters to find the best recipes.

    PARAMETER USAGE GUIDE (from Edamam API documentation):

    q (query):
        Query text for general search (e.g., "chicken", "pasta", "fish").
        Use this when user asks for specific ingredients or dish names.
        Examples: "fish", "chicken curry", "chocolate cake"

    mealType:
        Array of meal types. Options: "breakfast", "lunch", "dinner", "snack", "teatime"
        Use when user specifies meal context (e.g., "breakfast ideas", "dinner recipe")
        Examples: ["dinner"], ["breakfast", "snack"]

    dishType:
        Array of dish categories. Options include: "main course", "side dish", "soup",
        "salad", "bread", "dessert", "drinks", "starter", "condiments and sauces"
        Use when user specifies dish category (e.g., "dessert", "main course")
        Examples: ["main course"], ["dessert"]

    cuisineType:
        Array of cuisine types. Options include: "american", "asian", "british", "caribbean",
        "central europe", "chinese", "eastern europe", "french", "greek", "indian", "italian",
        "japanese", "korean", "kosher", "mediterranean", "mexican", "middle eastern", "nordic"
        Use when user specifies cuisine preference (e.g., "italian pasta", "asian food")
        Examples: ["italian"], ["asian", "chinese"]

    ingr:
        Ingredient count filter. Format: "MIN+", "MIN-MAX", or "MAX"
        MIN and MAX are integers.
        Use when user wants simple/complex recipes.
        Examples: "5-8" (5-8 ingredients), "10+" (10 or more), "5" (max 5)

    health:
        Array of health labels from user dietary preferences.
        Options: "vegan", "vegetarian", "paleo", "dairy-free", "gluten-free", "peanut-free",
        "tree-nut-free", "soy-free", "fish-free", "shellfish-free", "pork-free", "kosher", etc.
        These come from user profile diet settings.
        Examples: ["vegan", "dairy-free"], ["gluten-free"]

    time:
        Time range in minutes. Format: "MIN+", "MIN-MAX", or "MAX"
        MIN and MAX are integers (minutes).
        Use when user wants quick/slow recipes.
        Examples: "30" (max 30 min), "20-40" (20-40 min range), "60+" (60+ min)

    excluded:
        Array of ingredients to exclude from user preferences.
        These come from user customPreferences (allergies/dislikes).
        Examples: ["nuts", "fish"], ["broccoli", "mushrooms"]

    Args:
        health_labels: Health labels from user dietary preferences
        excluded: Ingredients to exclude from user allergies/dislikes
        query: General search query text
        cuisine_type: List of cuisine types
        meal_type: List of meal types
        dish_type: List of dish types
        diet: List of diet labels (e.g., ["balanced", "high-protein", "low-carb"])
        ingr: Ingredient count filter (format: "5-8", "10+", "5")
        time: Time range in minutes (format: "30", "20-40", "60+")
        max_results: Maximum number of results (default 30)

    Returns:
        List of recipe dictionaries with full details (ingredients, nutrition, etc.)

    Examples:
        - search_edamam_recipes(query="fish", health_labels=["dairy-free"], meal_type=["dinner"])
        - search_edamam_recipes(cuisine_type=["italian"], dish_type=["main course"], time="30")
        - search_edamam_recipes(query="pasta", excluded=["nuts"], ingr="5-8")
        - search_edamam_recipes(meal_type=["breakfast"], time="20", dish_type=["bread"])
    """
    from app.services.edamam_service import edamam_service

    print(f"[search_edamam_recipes] Called with parameters:")
    print(f"  - query: {query}")
    print(f"  - health_labels: {health_labels}")
    print(f"  - diet: {diet}")
    print(f"  - excluded: {excluded}")
    print(f"  - cuisine_type: {cuisine_type}")
    print(f"  - meal_type: {meal_type}")
    print(f"  - dish_type: {dish_type}")
    print(f"  - ingr: {ingr}")
    print(f"  - time: {time}")
    print(f"  - max_results: {max_results}")

    recipes = await edamam_service.search_recipes(
        health_labels=health_labels or [],
        excluded=excluded or [],
        query=query,
        cuisine_type=cuisine_type,
        meal_type=meal_type,
        dish_type=dish_type,
        diet=diet,
        ingr=ingr,
        time=time,
        max_results=max_results,
    )

    print(f"[search_edamam_recipes] Returned {len(recipes)} recipes")
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
