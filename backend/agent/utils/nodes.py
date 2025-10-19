"""Node functions for the LangGraph agent."""

import random
import json
from typing import List
from agent.utils.state import GraphState
from agent.utils.tools import search_edamam_recipes
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings


async def select_diverse_recipes(state: GraphState) -> GraphState:
    """
    Agent node that searches Edamam API and selects 9+ diverse recipes.

    The agent:
    1. Receives family member preferences from state
    2. Calls search_edamam_recipes tool to get ~30 recipes
    3. Selects 9+ recipes with 70% smart variety + 30% random discovery
    4. Returns all recipes if fewer than 9 available
    """
    # Get family member info and preferences
    family_info = state.get("family_members_info", "")
    diet_labels = state.get("diet_labels", [])
    excluded_ingredients = state.get("excluded_ingredients", [])

    # Check if agent should search (initial search or re-search)
    # If all_recipes is empty, agent needs to search
    should_search = len(state.get("all_recipes", [])) == 0

    if not should_search:
        # Already have recipes, just select from them
        all_recipes = state["all_recipes"]
    else:
        # Agent needs to search Edamam API
        print(f"Agent searching Edamam API with health_labels={diet_labels}, excluded={excluded_ingredients}")

        try:
            # Call the Edamam API tool
            all_recipes = await search_edamam_recipes.ainvoke({
                "health_labels": diet_labels,
                "excluded": excluded_ingredients,
                "query": None,  # Agent can decide to use query if needed
                "max_results": 30
            })

            # Update state with fetched recipes
            state["all_recipes"] = all_recipes
            print(f"Agent fetched {len(all_recipes)} recipes from Edamam")

        except Exception as e:
            print(f"Error calling Edamam API: {e}")
            state["all_recipes"] = []
            state["selected_recipes"] = []
            return state

    # If no recipes found, return empty
    if not all_recipes:
        state["selected_recipes"] = []
        return state

    # If fewer than 9 recipes, return all of them
    if len(all_recipes) <= 9:
        state["selected_recipes"] = all_recipes
        return state

    # Agent selects 9+ recipes with variety
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

    # Create recipe summaries for the agent
    recipe_summaries = []
    for i, recipe in enumerate(all_recipes):
        summary = {
            "index": i,
            "name": recipe.get("label", "Unknown"),
            "cuisine": recipe.get("cuisineType", []),
            "dish_type": recipe.get("dishType", []),
            "meal_type": recipe.get("mealType", []),
            "cooking_time": recipe.get("totalTime", 0),
            "calories": recipe.get("calories", 0),
        }
        recipe_summaries.append(summary)

    # Build system prompt with family info
    system_prompt = f"""You are a meal planning assistant helping users find diverse and interesting recipes.

{family_info}

Your task: Select at least 9 recipes (or all available if fewer than 9) from the provided list.

Selection strategy (smart 70% + random 30%):
- SMART SELECTION (~7 recipes): Maximize variety in:
  * Cuisine types (Italian, Asian, Mexican, American, Mediterranean, etc.)
  * Protein sources (chicken, beef, fish, vegetarian, vegan)
  * Cooking times (quick 15-30min meals AND elaborate 60+ min dishes)
  * Dish types (soups, salads, mains, sides, appetizers)
  * Respect all dietary restrictions and preferences

- RANDOM ELEMENT (~2-3 recipes): Include some unexpected but valid options for discovery
  * Pick interesting/unusual recipes that still meet dietary needs
  * Add element of surprise and variety

IMPORTANT:
- Select AT LEAST 9 recipes (if available)
- If there are fewer than 9 recipes total, select ALL of them
- Avoid selecting very similar recipes (e.g., don't pick 4 pasta dishes)

Respond with ONLY a JSON array of indices, like: [0, 3, 5, 8, 12, 15, 18, 21, 25]"""

    user_prompt = f"Here are {len(recipe_summaries)} recipes to choose from:\n\n{json.dumps(recipe_summaries, indent=2)}\n\nSelect at least 9 diverse recipes (or all if fewer than 9) and return their indices as a JSON array."

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = llm.invoke(messages)
        content = response.content.strip()

        # Parse indices
        # Handle if response is wrapped in ```json``` tags
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        selected_indices = json.loads(content)

        # Validate and get selected recipes
        selected = []
        for idx in selected_indices:
            if 0 <= idx < len(all_recipes):
                selected.append(all_recipes[idx])

        # Ensure we have at least 9 (or all if fewer available)
        min_required = min(9, len(all_recipes))
        if len(selected) < min_required:
            print(f"Agent selected only {len(selected)} recipes, falling back to random selection")
            # Fall back: add random recipes to reach 9
            remaining_indices = [i for i in range(len(all_recipes)) if i not in selected_indices]
            needed = min_required - len(selected)
            if needed > 0 and remaining_indices:
                additional = random.sample(remaining_indices, min(needed, len(remaining_indices)))
                selected.extend([all_recipes[i] for i in additional])

        state["selected_recipes"] = selected
        print(f"Agent selected {len(selected)} recipes")

    except Exception as e:
        print(f"Error in agent selection: {e}")
        # Fallback: randomly select 9 recipes (or all if fewer)
        num_to_select = min(9, len(all_recipes))
        state["selected_recipes"] = random.sample(all_recipes, num_to_select)

    return state


async def handle_chat_refinement(state: GraphState) -> GraphState:
    """
    Agent node that processes user chat messages and refines recipe selection.

    The agent detects user intent:
    - "change_recipes": Re-search with new parameters (e.g., "no fish", "easier recipes")
    - "filter": Filter existing recipes (e.g., "show only Italian")
    - "question": Just answer without changing recipes (e.g., "how do I cook this?")
    """
    current_message = state.get("current_message", "")
    chat_history = state.get("chat_history", [])
    selected_recipes = state.get("selected_recipes", [])
    family_info = state.get("family_members_info", "")

    if not current_message:
        return state

    # Initialize LLM
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.7)

    # Build context with current recipes
    recipe_summaries = [
        {
            "index": i,
            "name": r.get("label", ""),
            "cuisine": r.get("cuisineType", []),
            "dish_type": r.get("dishType", []),
            "calories": r.get("calories", 0),
            "time": r.get("totalTime", 0),
        }
        for i, r in enumerate(selected_recipes)
    ]

    system_prompt = f"""You are a helpful meal planning assistant. The user is chatting about their recipe suggestions.

{family_info}

Current selected recipes: {len(selected_recipes)} recipes

Analyze the user's message and detect their intent:

1. "change_recipes" - User wants DIFFERENT recipes (trigger re-search):
   Examples: "no fish", "I don't like broccoli", "make it healthier", "easier recipes", "more protein", "I hate pasta"

2. "filter" - User wants to FILTER current recipes (no re-search):
   Examples: "show only Italian", "which ones are vegetarian", "show me the quick meals"

3. "question" - User is asking a QUESTION (no changes):
   Examples: "how do I cook this?", "what's in dish #3?", "tell me about the pasta", "why did you choose these?"

Respond in JSON format:
{{
    "intent": "change_recipes" or "filter" or "question",
    "response": "Your helpful message to the user",
    "selected_indices": [indices if filtering],
    "search_params": {{health_labels: [], excluded: [], query: ""}} if re-searching
}}

IMPORTANT:
- Only use "change_recipes" if user explicitly wants different/new recipes
- Use "question" if user is just asking about existing recipes
- Use "filter" to narrow down current selection"""

    user_prompt = f"""Current recipes: {json.dumps(recipe_summaries, indent=2)}

User message: "{current_message}"

Recent chat: {chat_history[-3:] if len(chat_history) > 0 else "None"}

What is the user's intent and how should I respond?"""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        response = llm.invoke(messages)
        content = response.content.strip()

        # Handle JSON extraction
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        agent_decision = json.loads(content)

        intent = agent_decision.get("intent", "question")
        agent_response = agent_decision.get("response", "I understand your request.")

        state["agent_response"] = agent_response

        if intent == "change_recipes":
            # User wants different recipes - trigger re-search
            print(f"User wants different recipes: {current_message}")
            state["action"] = "re_search"

            # Clear recipes to force re-search
            state["all_recipes"] = []
            state["selected_recipes"] = []

            # Extract search parameters if provided
            search_params = agent_decision.get("search_params", {})
            if search_params:
                # Update state with new search parameters
                if "health_labels" in search_params:
                    state["diet_labels"] = search_params["health_labels"]
                if "excluded" in search_params:
                    # Merge with existing excluded ingredients
                    existing = state.get("excluded_ingredients", [])
                    new_excluded = search_params["excluded"]
                    state["excluded_ingredients"] = list(set(existing + new_excluded))

        elif intent == "filter":
            # Filter existing recipes
            print(f"Filtering existing recipes: {current_message}")
            state["action"] = "filter"

            indices = agent_decision.get("selected_indices", [])
            if indices:
                new_selected = [selected_recipes[i] for i in indices if 0 <= i < len(selected_recipes)]
                if new_selected:
                    state["selected_recipes"] = new_selected

        else:  # question
            # Just answer - no changes to recipes
            print(f"User asked a question: {current_message}")
            state["action"] = "question"
            # Keep recipes as-is

    except Exception as e:
        print(f"Error in chat refinement: {e}")
        state["action"] = "question"
        state["agent_response"] = "I understand. Let me help you with that."

    return state
