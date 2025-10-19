"""LangGraph workflow for recipe selection agent."""

from langgraph.graph import StateGraph, START, END
from agent.utils.state import GraphState
from agent.utils.nodes import select_diverse_recipes, handle_chat_refinement


# Create the workflow
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("select_recipes", select_diverse_recipes)
workflow.add_node("handle_chat", handle_chat_refinement)

# Define edges for initial search workflow
# START -> select_recipes -> END
workflow.add_edge(START, "select_recipes")
workflow.add_edge("select_recipes", END)

# Compile the graph
graph = workflow.compile()

# For chat refinement, create a workflow that supports re-search
chat_workflow = StateGraph(GraphState)
chat_workflow.add_node("handle_chat", handle_chat_refinement)
chat_workflow.add_node("select_recipes", select_diverse_recipes)

# Start with chat handler
chat_workflow.add_edge(START, "handle_chat")

# After chat: decide whether to re-search or end
def should_research(state: GraphState) -> str:
    """Decide if we need to re-search based on action."""
    action = state.get("action", "question")
    if action == "re_search":
        return "select_recipes"
    return END

chat_workflow.add_conditional_edges(
    "handle_chat",
    should_research,
    {
        "select_recipes": "select_recipes",
        END: END
    }
)

# After re-search, end
chat_workflow.add_edge("select_recipes", END)

chat_graph = chat_workflow.compile()
