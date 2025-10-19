"""API endpoints for recipe search and retrieval."""

from fastapi import APIRouter, HTTPException
from app.models.recipe import (
    RecipeSearchRequest,
    RecipeSearchResponse,
    AllRecipesResponse,
    EdamamRecipe,
)
from app.services.user_service import user_service
from app.services.edamam_service import edamam_service
from app.services.session_service import session_service
from agent.agent import graph
from app.config import settings

router = APIRouter()


@router.post("/search", response_model=RecipeSearchResponse)
async def search_recipes(request: RecipeSearchRequest):
    """
    Search for recipes based on user dietary preferences.

    Takes a list of user IDs, merges their dietary preferences and exclusions,
    searches Edamam API for 30 recipes, then uses the AI agent to select
    5-10 diverse recipes.

    Returns the selected recipes and a session ID for accessing all results.
    """
    # Merge preferences from all users
    merged_prefs = user_service.merge_preferences(request.user_ids)

    # Search Edamam API
    try:
        all_recipes = await edamam_service.search_recipes(
            health_labels=merged_prefs.diet_labels,
            excluded=merged_prefs.excluded_ingredients,
            max_results=settings.MAX_RECIPES_FETCH,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error searching Edamam API: {str(e)}"
        )

    if not all_recipes:
        raise HTTPException(
            status_code=404,
            detail="No recipes found matching the dietary preferences",
        )

    # Convert recipes to dict for agent
    all_recipes_dict = [recipe.model_dump() for recipe in all_recipes]

    # Use agent to select diverse recipes
    initial_state = {
        "user_ids": request.user_ids,
        "diet_labels": merged_prefs.diet_labels,
        "excluded_ingredients": merged_prefs.excluded_ingredients,
        "fridge_items": merged_prefs.fridge_items,
        "all_recipes": all_recipes_dict,
        "selected_recipes": [],
        "chat_history": [],
        "current_message": None,
        "action": "initial_search",
        "agent_response": None,
    }

    # Run the agent graph
    result = graph.invoke(initial_state)
    selected_recipes_dict = result["selected_recipes"]

    # Convert back to Pydantic models
    selected_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]

    # Create session
    session_id = session_service.create_session(
        user_ids=request.user_ids,
        merged_preferences=merged_prefs,
        all_recipes=all_recipes,
        selected_recipes=selected_recipes,
    )

    return RecipeSearchResponse(
        session_id=session_id,
        recipes=selected_recipes,
        total_found=len(all_recipes),
    )


@router.get("/all/{session_id}", response_model=AllRecipesResponse)
async def get_all_recipes(session_id: str):
    """
    Get all recipes from a search session.

    Returns all 30 recipes that were found in the original search,
    along with the URIs of the recipes that were initially selected.
    """
    if not session_service.session_exists(session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get URIs of selected recipes
    selected_uris = [r.uri for r in session.selected_recipes]

    return AllRecipesResponse(
        recipes=session.all_recipes, selected_recipe_uris=selected_uris
    )
