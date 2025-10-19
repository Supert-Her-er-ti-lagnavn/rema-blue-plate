"""Node functions for the LangGraph agent."""

import random
from typing import List
from agent.utils.state import GraphState
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings


def select_diverse_recipes(state: GraphState) -> GraphState:
    """
    Agent node that selects 5-10 diverse recipes from the provided list.

    Uses GPT-4o-mini to ensure variety in:
    - Cuisine types
    - Main proteins
    - Cooking methods
    - Complexity levels
    """
    all_recipes = state["all_recipes"]

    if not all_recipes:
        state["selected_recipes"] = []
        return state

    # If we have fewer than 10 recipes, return them all
    if len(all_recipes) <= 10:
        state["selected_recipes"] = all_recipes
        return state

    # Initialize LLM
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

    # Create a simplified recipe list for the prompt
    recipe_summaries = []
    for i, recipe in enumerate(all_recipes):
        summary = {
            "index": i,
            "name": recipe.get("label", "Unknown"),
            "cuisine": recipe.get("cuisineType", []),
            "dish_type": recipe.get("dishType", []),
            "meal_type": recipe.get("mealType", []),
            "cooking_time": recipe.get("totalTime", 0),
        }
        recipe_summaries.append(summary)

    # Prompt for the agent
    system_prompt = """You are a meal planning assistant helping users select diverse and interesting recipes.

Your task is to select between 5-10 recipes from the provided list, ensuring maximum variety in:
- Cuisine types (Italian, Asian, Mexican, etc.)
- Main ingredients and proteins
- Dish types (soup, salad, main course, etc.)
- Cooking times (quick meals and more elaborate dishes)

Avoid selecting very similar recipes. For example, don't select 3 pasta dishes or 4 chicken recipes.

Respond with ONLY a JSON array of the indices you've selected, like: [0, 5, 12, 18, 23, 27]
Select between 5-10 recipes."""

    user_prompt = f"Here are the recipes to choose from:\n\n{recipe_summaries}\n\nSelect 5-10 diverse recipes and return their indices as a JSON array."

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = llm.invoke(messages)
        content = response.content.strip()

        # Parse the indices from response
        import json

        selected_indices = json.loads(content)

        # Validate and get selected recipes
        selected = []
        for idx in selected_indices:
            if 0 <= idx < len(all_recipes):
                selected.append(all_recipes[idx])

        # Ensure we have at least 5 and at most 10
        if len(selected) < 5:
            # Fall back to random selection
            selected = random.sample(all_recipes, min(5, len(all_recipes)))
        elif len(selected) > 10:
            selected = selected[:10]

        state["selected_recipes"] = selected

    except Exception as e:
        print(f"Error in agent selection: {e}")
        # Fallback: randomly select 5-10 recipes
        num_to_select = random.randint(5, min(10, len(all_recipes)))
        state["selected_recipes"] = random.sample(all_recipes, num_to_select)

    return state


def handle_chat_refinement(state: GraphState) -> GraphState:
    """
    Agent node that processes user chat messages and refines recipe selection.

    The agent can:
    - Filter existing recipes based on feedback
    - Decide to re-search with modified parameters
    - Explain why certain recipes were selected
    """
    current_message = state.get("current_message", "")
    chat_history = state.get("chat_history", [])
    all_recipes = state.get("all_recipes", [])
    selected_recipes = state.get("selected_recipes", [])

    if not current_message:
        return state

    # Initialize LLM
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

    # Build context
    recipe_summaries = [
        {
            "name": r.get("label", ""),
            "cuisine": r.get("cuisineType", []),
            "dish_type": r.get("dishType", []),
            "calories": r.get("calories", 0),
            "time": r.get("totalTime", 0),
        }
        for r in all_recipes
    ]

    system_prompt = """You are a helpful meal planning assistant. The user has received recipe suggestions and wants to refine them.

You can:
1. Filter existing recipes based on their preferences (e.g., "show me only quick meals", "I want Italian food")
2. Suggest re-searching with different parameters (e.g., "make it healthier", "I want vegetarian options")
3. Explain why certain recipes were selected

Analyze the user's message and decide on an action. Respond in JSON format:
{
    "action": "filter" or "re_search" or "explain",
    "response": "Your message to the user",
    "selected_indices": [list of indices if action is filter],
    "new_parameters": {optional new search parameters if re_search}
}"""

    user_prompt = f"""Current recipes: {recipe_summaries}

User message: "{current_message}"

Previous chat: {chat_history[-4:] if len(chat_history) > 0 else "None"}

Decide how to respond and what action to take."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = llm.invoke(messages)
        content = response.content.strip()

        import json

        agent_decision = json.loads(content)

        action = agent_decision.get("action", "explain")
        agent_response = agent_decision.get("response", "I understand your request.")

        state["action"] = action
        state["agent_response"] = agent_response

        if action == "filter" and "selected_indices" in agent_decision:
            # Filter existing recipes
            indices = agent_decision["selected_indices"]
            new_selected = [all_recipes[i] for i in indices if 0 <= i < len(all_recipes)]
            state["selected_recipes"] = new_selected if new_selected else selected_recipes

        elif action == "re_search":
            # Mark that we need to re-search
            # The API endpoint will handle calling Edamam again
            state["selected_recipes"] = []

    except Exception as e:
        print(f"Error in chat refinement: {e}")
        state["action"] = "no_change"
        state["agent_response"] = "I understand. Let me keep the current selection for now."

    return state
