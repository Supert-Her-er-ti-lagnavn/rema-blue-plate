"""State definition for the LangGraph agent."""

from typing import TypedDict, List, Optional


class GraphState(TypedDict):
    """State for the recipe selection agent."""

    # Input data
    user_ids: List[int]
    diet_labels: List[str]
    excluded_ingredients: List[str]
    fridge_items: List[str]

    # Recipes data
    all_recipes: List[dict]  # All recipes from Edamam
    selected_recipes: List[dict]  # Agent-selected recipes

    # Chat interaction
    chat_history: List[dict]
    current_message: Optional[str]

    # Agent state
    action: str  # "initial_search" | "refine" | "re_search"
    agent_response: Optional[str]
