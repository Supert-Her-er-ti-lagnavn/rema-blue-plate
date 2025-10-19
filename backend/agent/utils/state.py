"""State definition for the LangGraph agent."""

from typing import TypedDict, List, Optional


class GraphState(TypedDict):
    """State for the recipe selection agent."""

    # Input data
    user_ids: List[int]
    diet_labels: List[str]
    excluded_ingredients: List[str]
    fridge_items: List[str]
    custom_preferences: List[str]  # User's free-text preferences for AI
    family_members_info: str  # Formatted string with family member preferences for agent prompt

    # Recipes data
    all_recipes: List[dict]  # All recipes from Edamam (populated by agent)
    selected_recipes: List[dict]  # Agent-selected recipes (9+ diverse options)

    # Chat interaction
    chat_history: List[dict]
    current_message: Optional[str]

    # Agent state
    action: str  # "initial_search" | "refine" | "re_search"
    agent_response: Optional[str]
