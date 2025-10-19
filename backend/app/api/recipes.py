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
    Search for recipes using AI agent.

    The agent receives family member preferences, searches Edamam API directly,
    and selects 9+ diverse recipes with smart variety (70%) + random discovery (30%).

    Returns the selected recipes and a session ID for chat refinement.
    """
    # Merge preferences from all users
    merged_prefs = user_service.merge_preferences(request.user_ids)

    # Format family member preferences for agent prompt
    family_info_parts = []
    family_info_parts.append("You are helping plan meals for:")

    for user_id in request.user_ids:
        user = user_service.get_user(user_id)
        if user:
            # Format: "- Name (diet labels): custom preferences"
            diet_str = ", ".join(user.dietLabels) if user.dietLabels else "no restrictions"
            custom_str = ", ".join(user.customPreferences) if user.customPreferences else ""

            if custom_str:
                family_info_parts.append(f"- {user.name} ({diet_str}): \"{custom_str}\"")
            else:
                family_info_parts.append(f"- {user.name} ({diet_str})")

    family_members_info = "\n".join(family_info_parts)

    # Agent will search Edamam API - pass empty recipes list
    initial_state = {
        "user_ids": request.user_ids,
        "diet_labels": merged_prefs.diet_labels,
        "excluded_ingredients": merged_prefs.excluded_ingredients,
        "fridge_items": merged_prefs.fridge_items,
        "custom_preferences": merged_prefs.custom_preferences,
        "family_members_info": family_members_info,
        "all_recipes": [],  # Agent will populate this
        "selected_recipes": [],
        "chat_history": [],
        "current_message": None,
        "action": "initial_search",
        "agent_response": None,
    }

    # Run the agent graph (agent searches and selects)
    result = await graph.ainvoke(initial_state)

    selected_recipes_dict = result.get("selected_recipes", [])
    all_recipes_dict = result.get("all_recipes", [])

    if not selected_recipes_dict:
        raise HTTPException(
            status_code=404,
            detail="No recipes found matching the dietary preferences",
        )

    # Convert to Pydantic models
    selected_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]
    all_recipes = [EdamamRecipe(**r) for r in all_recipes_dict]

    # Create session
    session_id = session_service.create_session(
        user_ids=request.user_ids,
        merged_preferences=merged_prefs,
        all_recipes=all_recipes,
        selected_recipes=selected_recipes,
    )

    return RecipeSearchResponse(
        session_id=session_id,
        selected_recipes=selected_recipes,
        search_results=all_recipes,
        merged_preferences=merged_prefs.model_dump(),
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
