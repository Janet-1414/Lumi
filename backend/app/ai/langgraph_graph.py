"""
app/ai/langgraph_graph.py

LangGraph graph definition for Lumi's AI chat agent.

Separating the graph definition from chat_agent.py keeps
each file focused and makes the graph easier to test and extend.

Graph structure:
    agent → (has tool calls?) → tools → agent → END
                              ↓ (no tools)
                             END
"""

from typing import Annotated, Any, TypedDict

from langchain_core.messages import BaseMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode


# ─── Agent state ─────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    """State passed between nodes in the LangGraph graph."""
    messages:     Annotated[list[BaseMessage], add_messages]
    user_context: dict[str, Any]
    user_id:      str


# ─── Graph builder ────────────────────────────────────────────────────────────

def build_lumi_graph(llm_with_tools: Any, tools: list) -> Any:
    """
    Build and compile the Lumi ReAct agent graph.

    Args:
        llm_with_tools: ChatOpenAI instance with tools bound via .bind_tools()
        tools:          List of tool functions available to the agent

    Returns:
        Compiled LangGraph runnable ready for .astream_events()
    """

    def agent_node(state: AgentState) -> dict:
        """LLM reasoning node — decides next action."""
        from langchain_core.messages import SystemMessage
        from datetime import UTC, datetime

        today = datetime.now(UTC).strftime("%A, %d %B %Y")

        system = SystemMessage(
            content=(
                "You are Lumi, a friendly AI financial companion for African youth. "
                "You have access to the user's real financial data through tools. "
                "Always use tools to fetch real data before answering. "
                "Be warm, specific, and use UGX amounts. "
                f"Today is {today}."
            )
        )
        response = llm_with_tools.invoke([system, *state["messages"]])
        return {"messages": [response]}

    def should_continue(state: AgentState) -> str:
        """Route: call tools or go to END."""
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    # Build graph
    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(tools))

    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")

    return graph.compile()
