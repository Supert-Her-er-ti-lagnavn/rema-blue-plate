"""API endpoint for chat interaction with the agent."""

from fastapi import APIRouter, HTTPException
from app.models.chat import ChatRequest, ChatResponse
from app.models.recipe import EdamamRecipe
from app.services.session_service import session_service
from app.services.edamam_service import edamam_service
from agent.agent import chat_graph
from app.config import settings

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

    # Prepare state for chat agent
    all_recipes_dict = [r.model_dump() for r in session.all_recipes]
    selected_recipes_dict = [r.model_dump() for r in session.selected_recipes]
    chat_history_dict = [msg.model_dump() for msg in session.chat_history]

    chat_state = {
        "user_ids": session.user_ids,
        "diet_labels": session.merged_preferences.diet_labels,
        "excluded_ingredients": session.merged_preferences.excluded_ingredients,
        "fridge_items": session.merged_preferences.fridge_items,
        "all_recipes": all_recipes_dict,
        "selected_recipes": selected_recipes_dict,
        "chat_history": chat_history_dict,
        "current_message": request.message,
        "action": "refine",
        "agent_response": None,
    }

    # Run chat agent
    result = chat_graph.invoke(chat_state)

    action_taken = result.get("action", "no_change")
    agent_response = result.get("agent_response", "I understand your request.")

    # Handle re-search if needed
    if action_taken == "re_search":
        # Re-search with potentially modified parameters
        # For now, we'll just use the same parameters
        # In a more advanced implementation, the agent could modify these
        try:
            new_recipes = await edamam_service.search_recipes(
                health_labels=session.merged_preferences.diet_labels,
                excluded=session.merged_preferences.excluded_ingredients,
                max_results=settings.MAX_RECIPES_FETCH,
            )

            if new_recipes:
                # Update session with new recipes
                all_recipes_dict = [r.model_dump() for r in new_recipes]

                # Re-run selection agent
                from agent.agent import graph

                selection_state = {
                    "user_ids": session.user_ids,
                    "diet_labels": session.merged_preferences.diet_labels,
                    "excluded_ingredients": session.merged_preferences.excluded_ingredients,
                    "fridge_items": session.merged_preferences.fridge_items,
                    "all_recipes": all_recipes_dict,
                    "selected_recipes": [],
                    "chat_history": [],
                    "current_message": None,
                    "action": "initial_search",
                    "agent_response": None,
                }

                selection_result = graph.invoke(selection_state)
                selected_recipes_dict = selection_result["selected_recipes"]

                # Update session
                session.all_recipes = new_recipes
                session.selected_recipes = [
                    EdamamRecipe(**r) for r in selected_recipes_dict
                ]
        except Exception as e:
            # Fall back to existing recipes if re-search fails
            print(f"Error re-searching: {e}")
            action_taken = "filter"

    # Get final selected recipes
    final_recipes = [EdamamRecipe(**r) for r in result["selected_recipes"]]

    # Update session with new chat history and selected recipes
    session_service.update_chat_history(
        request.session_id, request.message, agent_response
    )
    session_service.update_selected_recipes(request.session_id, final_recipes)

    return ChatResponse(
        recipes=final_recipes, response=agent_response, action_taken=action_taken
    )
