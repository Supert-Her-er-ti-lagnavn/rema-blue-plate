"""API endpoint for chat interaction with the agent."""

from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.models.recipe import EdamamRecipe
from app.services.session_service import session_service
from app.services.user_service import user_service
from agent.agent import chat_graph

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Chat with the agent to refine recipe selections.

    The agent can:
    - Filter existing recipes based on user feedback
    - Re-search Edamam with modified parameters
    - Explain recipe selections

    Maintains conversation history within the session.
    """
    # Check if session exists
    if not session_service.session_exists(request.session_id):
        raise HTTPException(status_code=404, detail="Session not found")

    session = session_service.get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Format family member preferences for agent prompt (DYNAMIC, NOT HARDCODED)
    family_info_parts = []
    family_info_parts.append("You are helping plan meals for:")

    for user_id in session.user_ids:
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

    # Prepare state for chat agent
    all_recipes_dict = [r.model_dump() for r in session.all_recipes]
    selected_recipes_dict = [r.model_dump() for r in session.selected_recipes]
    chat_history_dict = [msg.model_dump() for msg in session.chat_history]

    chat_state = {
        "user_ids": session.user_ids,
        "diet_labels": session.merged_preferences.diet_labels,
        "excluded_ingredients": session.merged_preferences.excluded_ingredients,
        "fridge_items": session.merged_preferences.fridge_items,
        "custom_preferences": session.merged_preferences.custom_preferences,
        "family_members_info": family_members_info,  # NEW: Dynamically formatted family info
        "all_recipes": all_recipes_dict,
        "selected_recipes": selected_recipes_dict,
        "chat_history": chat_history_dict,
        "current_message": request.message,
        "action": "refine",
        "agent_response": None,
    }

    # Run chat agent (now async)
    result = await chat_graph.ainvoke(chat_state)

    action_taken = result.get("action", "no_change")
    agent_response = result.get("agent_response", "I understand your request.")

    # Extract updated recipes from agent result
    # If agent re-searched, result will contain new all_recipes and selected_recipes
    selected_recipes_dict = result.get("selected_recipes", [])
    all_recipes_dict = result.get("all_recipes", [])

    # Convert to Pydantic models
    final_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]
    all_recipes = [EdamamRecipe(**r) for r in all_recipes_dict]

    # Update session with new recipes (if agent re-searched, these will be new)
    if all_recipes:
        session.all_recipes = all_recipes
    session.selected_recipes = final_recipes

    # Update session with new chat history
    session_service.update_chat_history(
        request.session_id, request.message, agent_response
    )
    session_service.update_selected_recipes(request.session_id, final_recipes)

    return ChatResponse(
        recipes=final_recipes, response=agent_response, action_taken=action_taken
    )
