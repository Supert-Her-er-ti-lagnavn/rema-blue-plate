from langgraph.graph import StateGraph, START, END
from agent.utils.state import GraphState

workflow = StateGraph(GraphState)

# ----------------------------------------
#
# Define your graph here
#
# ----------------------------------------

graph = workflow.compile()
