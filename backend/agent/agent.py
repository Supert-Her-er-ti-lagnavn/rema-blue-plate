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

# For chat refinement, we'll create a separate simple workflow
chat_workflow = StateGraph(GraphState)
chat_workflow.add_node("handle_chat", handle_chat_refinement)
chat_workflow.add_edge(START, "handle_chat")
chat_workflow.add_edge("handle_chat", END)
chat_graph = chat_workflow.compile()
