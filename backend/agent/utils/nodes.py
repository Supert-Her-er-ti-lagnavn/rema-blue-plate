"""Node functions for the LangGraph agent."""

import random
import json
from typing import List, Dict, Any, Optional
from agent.utils.state import GraphState
from agent.utils.tools import search_edamam_recipes
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import settings


async def construct_search_query(
    family_info: str,
    diet_labels: List[str],
    excluded_ingredients: List[str],
    custom_preferences: List[str],
    user_message: Optional[str] = None
) -> Dict[str, Any]:
    """
    Use GPT to intelligently construct Edamam search parameters.

    Analyzes family preferences and optional user message to decide
    which Edamam parameters to use for optimal recipe search.

    Args:
        family_info: Formatted string with family member preferences
        diet_labels: Health labels from user profiles (e.g., ["vegan", "gluten-free"])
        excluded_ingredients: Ingredients to exclude (from customPreferences)
        custom_preferences: User custom preferences/allergies
        user_message: Optional user request (e.g., "find me fish recipes", "quick italian dinner")

    Returns:
        Dictionary with Edamam search parameters
    """
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, temperature=0.3)

    system_prompt = """You are an expert at constructing recipe search queries for the Edamam Recipe API.

Your task: Analyze family dietary preferences and user requests, then construct optimal Edamam search parameters.

AVAILABLE EDAMAM PARAMETERS:

1. q (query): General search text (e.g., "fish", "pasta", "chicken curry")
   - Use when user specifies ingredients or dish names
   - Examples: "fish", "chicken", "chocolate cake"

2. mealType: Array - "breakfast", "lunch", "dinner", "snack", "teatime"
   - Use when user specifies meal context
   - Examples: ["dinner"], ["breakfast"]

3. dishType: Array - "main course", "side dish", "soup", "salad", "bread", "dessert", "drinks", "starter"
   - Use when user specifies dish category
   - Examples: ["main course"], ["dessert"]

4. cuisineType: Array - "american", "asian", "british", "caribbean", "chinese", "french", "greek",
   "indian", "italian", "japanese", "korean", "mediterranean", "mexican", "middle eastern", "nordic"
   - Use when user specifies cuisine preference
   - Examples: ["italian"], ["asian"]

5. ingr: String - "MIN+", "MIN-MAX", or "MAX" (integers)
   - Use when user wants simple/complex recipes
   - Examples: "5-8" (5-8 ingredients), "10+" (10+ ingredients), "5" (max 5)

6. health: Array - From user dietary preferences
   - Options: "vegan", "vegetarian", "dairy-free", "gluten-free", "peanut-free", "tree-nut-free",
     "soy-free", "fish-free", "shellfish-free", "pork-free", "kosher", etc.
   - ALWAYS include these from user profiles
   - Examples: ["vegan", "dairy-free"], ["gluten-free"]

7. time: String - "MIN+", "MIN-MAX", or "MAX" (minutes)
   - Use when user wants quick/slow recipes
   - Examples: "30" (max 30 min), "20-40" (20-40 min), "60+" (60+ min)

8. excluded: Array - Ingredients to exclude
   - ALWAYS include these from user allergies/dislikes
   - Extract ingredient names from natural language (e.g., "allergic to nuts" → "nuts")
   - Examples: ["nuts", "fish"], ["broccoli"]

9. diet: Array - "balanced", "high-fiber", "high-protein", "low-carb", "low-fat", "low-sodium"
   - Use for specific diet types (different from health restrictions)
   - Examples: ["high-protein"], ["low-carb"]

CRITICAL INSTRUCTIONS - READ CAREFULLY:

**HANDLING CUSTOM PREFERENCES**:
- Custom preferences may contain natural language in any language (English, Norwegian, etc.)
- Extract the key ingredient/allergen name from sentences:
  - "er allergisk mot nøtter" → extract "nuts" for excluded
  - "allergic to peanuts" → extract "peanuts" for excluded
  - "doesn't like broccoli" → extract "broccoli" for excluded
- If uncertain about extraction, DO NOT include in excluded (better safe than sorry)

**PRIORITY RULE**: User's explicit request ALWAYS OVERRIDES dietary preferences!

1. If NO user message: Use health + excluded from preferences
2. If user message provided:
   - FIRST: Analyze what user is asking for
   - SECOND: Set query parameter based on user request
   - THIRD: ONLY include health_labels if they DON'T conflict with user request

   **CONFLICT EXAMPLES**:
   - User asks for "fish" + profile has "vegan" → SET query="fish", IGNORE vegan label, SET health_labels=[]
   - User asks for "chicken" + profile has "vegetarian" → SET query="chicken", IGNORE vegetarian, SET health_labels=[]
   - User asks for "cheese pizza" + profile has "dairy-free" → SET query="cheese pizza", IGNORE dairy-free, SET health_labels=[]
   - User asks for "quick meals" + profile has "vegan" → SET time="30", KEEP health_labels=["vegan"] (no conflict)

**EXAMPLES**:
- User says "fish dinner", profile is vegan → {"query": "fish", "meal_type": ["dinner"], "health_labels": [], "excluded": []}
- User says "find me recipes", profile is vegan → {"query": "recipe", "health_labels": ["vegan"], "excluded": [...]}
- User says "vegan pasta", profile is gluten-free → {"query": "pasta", "health_labels": ["vegan"], "excluded": [...]}

Respond with JSON ONLY:
{
    "query": "search text or null",
    "health_labels": ["ONLY if no conflict with user request"],
    "excluded": ["from user preferences"],
    "cuisine_type": ["cuisine" or null],
    "meal_type": ["meal type" or null],
    "dish_type": ["dish type" or null],
    "diet": ["diet label" or null],
    "ingr": "range or null",
    "time": "range or null"
}"""

    if user_message:
        user_prompt = f"""{family_info}

User dietary preferences:
- Health labels: {diet_labels}
- Excluded ingredients: {excluded_ingredients}
- Custom preferences/allergies: {custom_preferences}

User's request: "{user_message}"

Construct optimal Edamam search parameters."""
    else:
        user_prompt = f"""{family_info}

User dietary preferences:
- Health labels: {diet_labels}
- Excluded ingredients: {excluded_ingredients}
- Custom preferences/allergies: {custom_preferences}

User clicked "Search Recipes" with no specific request.

Construct optimal Edamam search parameters for general meal discovery."""

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt),
        ]

        print(f"[construct_search_query] Invoking GPT with:")
        print(f"  - diet_labels: {diet_labels}")
        print(f"  - excluded_ingredients: {excluded_ingredients}")
        print(f"  - custom_preferences: {custom_preferences}")
        print(f"  - user_message: {user_message}")

        response = llm.invoke(messages)
        content = response.content.strip()

        print(f"[construct_search_query] GPT raw response: {content[:500]}")

        # Extract JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        params = json.loads(content)

        # Clean up null values (keep empty arrays as they're valid)
        cleaned_params = {k: v for k, v in params.items() if v is not None and v != ""}

        print(f"[construct_search_query] Final params: {cleaned_params}")
        return cleaned_params

    except Exception as e:
        # Fallback: basic search with query, health, and excluded
        print(f"[construct_search_query] GPT failed, using fallback. Error: {e}")
        print(f"[construct_search_query] diet_labels: {diet_labels}")

        # Separate health labels from diet labels
        health_only = []
        diet_only = []

        for label in diet_labels:
            label_lower = label.lower()
            if label_lower in ["balanced", "high-fiber", "high-protein", "low-carb", "low-fat", "low-sodium"]:
                diet_only.append(label)
            else:
                health_only.append(label)

        fallback_params = {
            "query": "recipe",
        }

        if health_only:
            fallback_params["health_labels"] = health_only
        if diet_only:
            fallback_params["diet"] = diet_only
        if excluded_ingredients:
            fallback_params["excluded"] = excluded_ingredients

        print(f"[construct_search_query] Fallback params: {fallback_params}")
        return fallback_params


async def select_diverse_recipes(state: GraphState) -> GraphState:
    """
    Agent node that searches Edamam API and selects 9+ diverse recipes.

    The agent:
    1. Receives family member preferences from state
    2. Uses GPT to intelligently construct Edamam search parameters
    3. Calls search_edamam_recipes tool to get ~30 recipes
    4. Selects 9+ recipes with 70% smart variety + 30% random discovery
    5. Returns all recipes if fewer than 9 available
    """
    # Get family member info and preferences
    family_info = state.get("family_members_info", "")
    diet_labels = state.get("diet_labels", [])
    excluded_ingredients = state.get("excluded_ingredients", [])
    custom_preferences = state.get("custom_preferences", [])
    current_message = state.get("current_message", None)

    # Check if agent should search (initial search or re-search)
    # If all_recipes is empty, agent needs to search
    should_search = len(state.get("all_recipes", [])) == 0

    if not should_search:
        # Already have recipes, just select from them
        all_recipes = state["all_recipes"]
    else:
        # Agent needs to search Edamam API
        # Use GPT to intelligently construct search parameters
        try:
            search_params = await construct_search_query(
                family_info=family_info,
                diet_labels=diet_labels,
                excluded_ingredients=excluded_ingredients,
                custom_preferences=custom_preferences,
                user_message=current_message
            )

            print(f"[select_diverse_recipes] Search params: {search_params}")
            print(f"[select_diverse_recipes] User message: {current_message}")

            all_recipes = await search_edamam_recipes.ainvoke({
                **search_params,
                "max_results": 30
            })

            print(f"[select_diverse_recipes] Received {len(all_recipes)} recipes from Edamam")
            state["all_recipes"] = all_recipes
        except Exception as e:
            print(f"[select_diverse_recipes] Error during search: {e}")
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
            # Fall back: add random recipes to reach 9
            remaining_indices = [i for i in range(len(all_recipes)) if i not in selected_indices]
            needed = min_required - len(selected)
            if needed > 0 and remaining_indices:
                additional = random.sample(remaining_indices, min(needed, len(remaining_indices)))
                selected.extend([all_recipes[i] for i in additional])

        state["selected_recipes"] = selected

    except Exception:
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
            state["action"] = "re_search"
            state["all_recipes"] = []
            state["selected_recipes"] = []

            # Extract search parameters if provided
            search_params = agent_decision.get("search_params", {})
            if search_params:
                if "health_labels" in search_params:
                    state["diet_labels"] = search_params["health_labels"]
                if "excluded" in search_params:
                    existing = state.get("excluded_ingredients", [])
                    new_excluded = search_params["excluded"]
                    state["excluded_ingredients"] = list(set(existing + new_excluded))

        elif intent == "filter":
            # Filter existing recipes
            state["action"] = "filter"
            indices = agent_decision.get("selected_indices", [])
            if indices:
                new_selected = [selected_recipes[i] for i in indices if 0 <= i < len(selected_recipes)]
                if new_selected:
                    state["selected_recipes"] = new_selected

        else:  # question
            # Just answer - no changes to recipes
            state["action"] = "question"

    except Exception:
        state["action"] = "question"
        state["agent_response"] = "I understand. Let me help you with that."

    return state
