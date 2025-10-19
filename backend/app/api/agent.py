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
    Chat with the agent to refine recipe selections OR create initial search.

    The agent can:
    - Create initial recipe search if no session exists (user_ids required)
    - Filter existing recipes based on user feedback
    - Re-search Edamam with modified parameters
    - Explain recipe selections

    Maintains conversation history within the session.
    """
    # If no session exists, create one if user_ids provided
    if not request.session_id or not session_service.session_exists(request.session_id):
        if not request.user_ids or len(request.user_ids) == 0:
            raise HTTPException(
                status_code=400,
                detail="No session found. Please provide user_ids to create a new search."
            )

        # Create new session by running initial search with user's message as context
        from agent.agent import graph

        # Merge preferences from all users
        merged_prefs = user_service.merge_preferences(request.user_ids)

        # Format family member preferences for agent prompt
        family_info_parts = []
        family_info_parts.append("You are helping plan meals for:")

        for user_id in request.user_ids:
            user = user_service.get_user(user_id)
            if user:
                diet_str = ", ".join(user.dietLabels) if user.dietLabels else "no restrictions"
                custom_str = ", ".join(user.customPreferences) if user.customPreferences else ""

                if custom_str:
                    family_info_parts.append(f"- {user.name} ({diet_str}): \"{custom_str}\"")
                else:
                    family_info_parts.append(f"- {user.name} ({diet_str})")

        family_members_info = "\n".join(family_info_parts)

        # Add user's message as context for the search
        if request.message:
            family_members_info += f"\n\nUser's request: \"{request.message}\""

        # Run initial search with user message as context
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
            print(f"Error invoking graph: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(
                status_code=500,
                detail=f"Error searching for recipes: {str(e)}"
            )

        selected_recipes_dict = result.get("selected_recipes", [])
        all_recipes_dict = result.get("all_recipes", [])

        print(f"Agent returned {len(all_recipes_dict)} total recipes, {len(selected_recipes_dict)} selected")

        if not selected_recipes_dict:
            # Provide more helpful error message
            if not all_recipes_dict:
                detail = "No recipes found matching the preferences. The API search returned no results."
            else:
                detail = f"Agent found {len(all_recipes_dict)} recipes but couldn't select any. Please try different preferences."
            raise HTTPException(
                status_code=404,
                detail=detail
            )

        # Convert to Pydantic models
        selected_recipes = [EdamamRecipe(**r) for r in selected_recipes_dict]
        all_recipes = [EdamamRecipe(**r) for r in all_recipes_dict]

        # Create session
        session_id = session_service.create_session(
            user_ids=request.user_ids,
            all_recipes=all_recipes,
            selected_recipes=selected_recipes,
            merged_preferences=merged_prefs,
        )

        # Add initial exchange to chat history
        agent_response = f"I found {len(selected_recipes)} recipes that match your preferences!"
        session_service.update_chat_history(session_id, request.message, agent_response)

        return ChatResponse(
            recipes=selected_recipes,
            response=agent_response,
            action_taken="initial_search",
            session_id=session_id,
        )

    # Session exists - continue with chat refinement
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
