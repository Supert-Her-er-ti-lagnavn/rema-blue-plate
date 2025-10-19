"""API endpoint for chat interaction with the agent."""

from typing import List
from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.models.recipe import EdamamRecipe
from app.services.session_service import session_service
from app.services.user_service import user_service
from agent.agent import chat_graph, graph

router = APIRouter()


def _format_family_info(user_ids: List[int], user_message: str = None) -> str:
    """Format family member preferences for agent prompt."""
    family_info_parts = ["You are helping plan meals for:"]

    for user_id in user_ids:
        user = user_service.get_user(user_id)
        if user:
            diet_str = ", ".join(user.dietLabels) if user.dietLabels else "no restrictions"
            custom_str = ", ".join(user.customPreferences) if user.customPreferences else ""

            if custom_str:
                family_info_parts.append(f"- {user.name} ({diet_str}): \"{custom_str}\"")
            else:
                family_info_parts.append(f"- {user.name} ({diet_str})")

    family_info = "\n".join(family_info_parts)

    if user_message:
        family_info += f"\n\nUser's request: \"{user_message}\""

    return family_info


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the agent to refine recipe selections OR create initial search.

    The agent can:
    - Create initial recipe search if no session exists (user_ids required)
    - Filter existing recipes based on user feedback
    - Re-search Edamam with modified parameters
    - Explain recipe selections

    Maintains conversation history within the session.
    """
    if not request.session_id or not session_service.session_exists(request.session_id):
        if not request.user_ids or len(request.user_ids) == 0:
            raise HTTPException(
                status_code=400,
                detail="No session found. Please provide user_ids to create a new search."
            )

        # Create new session with initial search
        merged_prefs = user_service.merge_preferences(request.user_ids)
        family_members_info = _format_family_info(request.user_ids, request.message)

        initial_state = {
            "user_ids": request.user_ids,
            "diet_labels": merged_prefs.diet_labels,
            "excluded_ingredients": merged_prefs.excluded_ingredients,
            "fridge_items": merged_prefs.fridge_items,
            "custom_preferences": merged_prefs.custom_preferences,
            "family_members_info": family_members_info,
            "all_recipes": [],
            "selected_recipes": [],
            "chat_history": [],
            "current_message": None,
            "action": "initial_search",
            "agent_response": None,
        }

        try:
            result = await graph.ainvoke(initial_state)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error searching for recipes: {str(e)}"
            )

        selected_recipes_dict = result.get("selected_recipes", [])
        all_recipes_dict = result.get("all_recipes", [])

        if not selected_recipes_dict:
            detail = (
                "No recipes found matching the preferences." if not all_recipes_dict
                else f"Found {len(all_recipes_dict)} recipes but couldn't select any."
            )
            raise HTTPException(status_code=404, detail=detail)

        # Convert to Pydantic models
        selected_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]
        all_recipes = [EdamamRecipe(**r) for r in all_recipes_dict]

        session_id = session_service.create_session(
            user_ids=request.user_ids,
            all_recipes=all_recipes,
            selected_recipes=selected_recipes,
            merged_preferences=merged_prefs,
        )

        # Check if user request might conflict with dietary restrictions
        conflict_warning = ""
        if request.message:
            user_msg_lower = request.message.lower()
            # Check for potential conflicts
            if any(keyword in user_msg_lower for keyword in ["fish", "meat", "chicken", "beef", "pork", "seafood", "shrimp"]):
                if "vegan" in merged_prefs.diet_labels or "vegetarian" in merged_prefs.diet_labels:
                    conflict_warning = " Note: Your request may conflict with vegetarian/vegan dietary preferences in the family."
            if any(keyword in user_msg_lower for keyword in ["dairy", "cheese", "milk", "butter", "cream"]):
                if "dairy-free" in merged_prefs.diet_labels:
                    conflict_warning = " Note: Your request may conflict with dairy-free dietary restrictions."
            if any(keyword in user_msg_lower for keyword in ["gluten", "bread", "pasta", "wheat"]):
                if "gluten-free" in merged_prefs.diet_labels:
                    conflict_warning = " Note: Your request may conflict with gluten-free dietary restrictions."

        agent_response = f"I found {len(selected_recipes)} recipes that match your request!{conflict_warning}"
        session_service.update_chat_history(session_id, request.message, agent_response)

        return ChatResponse(
            recipes=selected_recipes,
            response=agent_response,
            action_taken="initial_search",
            session_id=session_id,
        )

    # Existing session - refine recipes
    session = session_service.get_session(request.session_id)
    family_members_info = _format_family_info(session.user_ids)

    all_recipes_dict = [r.model_dump() for r in session.all_recipes]
    selected_recipes_dict = [r.model_dump() for r in session.selected_recipes]
    chat_history_dict = [msg.model_dump() for msg in session.chat_history]

    chat_state = {
        "user_ids": session.user_ids,
        "diet_labels": session.merged_preferences.diet_labels,
        "excluded_ingredients": session.merged_preferences.excluded_ingredients,
        "fridge_items": session.merged_preferences.fridge_items,
        "custom_preferences": session.merged_preferences.custom_preferences,
        "family_members_info": family_members_info,
        "all_recipes": all_recipes_dict,
        "selected_recipes": selected_recipes_dict,
        "chat_history": chat_history_dict,
        "current_message": request.message,
        "action": "refine",
        "agent_response": None,
    }

    result = await chat_graph.ainvoke(chat_state)

    action_taken = result.get("action", "no_change")
    agent_response = result.get("agent_response", "I understand your request.")

    selected_recipes_dict = result.get("selected_recipes", [])
    all_recipes_dict = result.get("all_recipes", [])

    final_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]
    all_recipes = [EdamamRecipe(**r) for r in all_recipes_dict]

    if all_recipes:
        session.all_recipes = all_recipes
    session.selected_recipes = final_recipes

    session_service.update_chat_history(request.session_id, request.message, agent_response)
    session_service.update_selected_recipes(request.session_id, final_recipes)

    return ChatResponse(
        recipes=final_recipes, response=agent_response, action_taken=action_taken
    )
