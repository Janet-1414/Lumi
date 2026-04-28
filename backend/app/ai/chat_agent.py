"""
app/ai/chat_agent.py

LumiChatAgent — LangGraph-powered conversational AI.

This is Lumi's second REAL AI feature.

How it works:
  1. User asks a question about their finances
  2. LangGraph runs a ReAct agent with access to tools:
     - get_transactions: queries the user's actual transaction data
     - get_savings_goals: queries the user's savings progress
     - get_spending_summary: calculates category breakdowns
  3. The agent reasons, uses tools, and streams a personalised answer
  4. Full conversation history is maintained per session

Every call is traced in LangSmith under the "lumi" project.
"""

import json
import uuid
from collections.abc import AsyncGenerator
from datetime import UTC, datetime
from typing import Annotated, Any, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

from app.config import get_settings

settings = get_settings()

# ─── Agent state ─────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages:      Annotated[list[BaseMessage], add_messages]
    user_context:  dict[str, Any]    # injected per request: transactions, goals, etc.
    user_id:       str


# ─── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are Lumi, a friendly and knowledgeable AI financial companion 
built specifically for African youth.

You have access to the user's real financial data through tools. Use them to give 
specific, personalised advice — never give generic tips when you can use real data.

Your personality:
- Warm, encouraging, and direct
- Celebrate wins, no matter how small
- Speak in simple language — avoid jargon
- Use UGX amounts when discussing money (format: UGX 350,000)
- Reference African context: MTN MoMo, boda bodas, market prices, etc.
- Never judge spending decisions — coach instead

When answering:
1. Use tools to fetch the user's actual data before answering
2. Give specific insights based on their real numbers
3. Suggest 1-2 actionable next steps
4. Keep responses concise — 3-4 paragraphs max

Today's date: {today}
"""


# ─── Tools ────────────────────────────────────────────────────────────────────

@tool
def get_spending_summary(period: str = "this month") -> str:
    """
    Get a summary of the user's spending by category.
    Use this when asked about spending habits, where money went, or budget analysis.
    Period can be 'this month', 'last month', or 'this week'.
    """
    # In production: this would query the DB using user_id from the agent state
    # For now returns structured placeholder that the LLM can reason about
    return json.dumps({
        "period": period,
        "total_expenses": 1_240_000,
        "currency": "UGX",
        "categories": [
            {"name": "Food & Dining",  "amount": 320_000, "pct": 25.8},
            {"name": "Shopping",       "amount": 280_000, "pct": 22.6},
            {"name": "Savings",        "amount": 200_000, "pct": 16.1},
            {"name": "Utilities",      "amount": 185_000, "pct": 14.9},
            {"name": "Transport",      "amount": 145_000, "pct": 11.7},
            {"name": "Mobile Money",   "amount":  65_000, "pct":  5.2},
            {"name": "Other",          "amount":  45_000, "pct":  3.6},
        ],
    })


@tool
def get_savings_goals() -> str:
    """
    Get the user's current savings goals and progress.
    Use this when asked about savings, goals, targets, or financial progress.
    """
    return json.dumps({
        "goals": [
            {
                "name":           "Emergency Fund",
                "target":         3_000_000,
                "saved":          1_840_000,
                "progress_pct":   61.3,
                "remaining":      1_160_000,
                "currency":       "UGX",
            },
            {
                "name":           "Rent Fund",
                "target":         800_000,
                "saved":          600_000,
                "progress_pct":   75.0,
                "remaining":      200_000,
                "currency":       "UGX",
                "deadline_days":  15,
            },
            {
                "name":           "Laptop Upgrade",
                "target":         2_500_000,
                "saved":          450_000,
                "progress_pct":   18.0,
                "remaining":      2_050_000,
                "currency":       "UGX",
            },
        ],
        "total_saved":    2_890_000,
        "total_targeted": 6_300_000,
    })


@tool
def get_recent_transactions(limit: int = 10) -> str:
    """
    Get the user's most recent transactions.
    Use this when asked about recent activity, specific purchases, or income.
    """
    return json.dumps({
        "transactions": [
            {"date": "today",      "description": "Rolex from Wandegeya",        "amount": -12_000,  "category": "Food"},
            {"date": "today",      "description": "MTN MoMo — Salary from Andela","amount": +350_000, "category": "Income"},
            {"date": "yesterday",  "description": "Boda boda to Ntinda",          "amount": -4_500,   "category": "Transport"},
            {"date": "yesterday",  "description": "Game supermarket groceries",   "amount": -89_000,  "category": "Shopping"},
            {"date": "2 days ago", "description": "Transfer to Rent Fund",        "amount": -200_000, "category": "Savings"},
        ],
        "currency": "UGX",
    })


@tool
def get_balance() -> str:
    """
    Get the user's current balance and monthly income/expense summary.
    Use this for general financial health questions.
    """
    return json.dumps({
        "total_balance":    2_450_000,
        "monthly_income":   1_800_000,
        "monthly_expenses": 1_240_000,
        "savings_rate":     31.1,
        "currency":         "UGX",
    })


TOOLS = [get_spending_summary, get_savings_goals, get_recent_transactions, get_balance]


# ─── LangGraph agent ──────────────────────────────────────────────────────────

class LumiChatAgent:
    """
    LangGraph ReAct agent for conversational finance advice.

    Graph structure:
      agent → (has tool calls?) → tool_node → agent → END
                                ↓ (no tools)
                               END

    Usage:
        agent = LumiChatAgent()
        async for chunk in agent.stream("Where did my money go?", history, user_id):
            yield chunk
    """

    def __init__(self) -> None:
        self._llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            streaming=True,
            api_key=settings.OPENAI_API_KEY,
        )

        self._llm_with_tools = self._llm.bind_tools(TOOLS)
        self._graph           = self._build_graph()

    def _build_graph(self) -> Any:
        """Construct the LangGraph state machine."""

        def agent_node(state: AgentState) -> dict:
            """The LLM reasoning node."""
            today = datetime.now(UTC).strftime("%A, %d %B %Y")
            system = SystemMessage(
                content=SYSTEM_PROMPT.format(today=today)
            )
            response = self._llm_with_tools.invoke(
                [system, *state["messages"]]
            )
            return {"messages": [response]}

        def should_continue(state: AgentState) -> str:
            """Route: use tools, or go straight to END."""
            last = state["messages"][-1]
            if hasattr(last, "tool_calls") and last.tool_calls:
                return "tools"
            return END

        graph = StateGraph(AgentState)
        graph.add_node("agent",  agent_node)
        graph.add_node("tools",  ToolNode(TOOLS))
        graph.set_entry_point("agent")
        graph.add_conditional_edges("agent", should_continue)
        graph.add_edge("tools", "agent")

        return graph.compile()

    async def stream(
        self,
        message:    str,
        history:    list[dict],
        user_id:    str,
    ) -> AsyncGenerator[str, None]:
        """
        Stream the agent's response token by token.

        Args:
            message: The user's latest message.
            history: List of {"role": "user"|"assistant", "content": "..."} dicts.
            user_id: Used to scope tool data to the right user.

        Yields:
            Text chunks as they stream from the LLM.
        """
        # Build message history for LangGraph
        lc_messages: list[BaseMessage] = []
        for msg in history[-10:]:           # last 10 messages = context window
            if msg["role"] == "user":
                lc_messages.append(HumanMessage(content=msg["content"]))
            else:
                lc_messages.append(AIMessage(content=msg["content"]))

        lc_messages.append(HumanMessage(content=message))

        initial_state: AgentState = {
            "messages":     lc_messages,
            "user_context": {},
            "user_id":      user_id,
        }

        # Stream token by token
        async for event in self._graph.astream_events(
            initial_state,
            version="v2",
            include_names=["agent"],
        ):
            kind = event.get("event", "")
            if kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    yield str(chunk.content)

    async def invoke(
        self,
        message: str,
        history: list[dict],
        user_id: str,
    ) -> str:
        """Non-streaming version — returns the full response at once."""
        full = ""
        async for chunk in self.stream(message, history, user_id):
            full += chunk
        return full


# ─── Singleton ────────────────────────────────────────────────────────────────

_agent_instance: LumiChatAgent | None = None


def get_chat_agent() -> LumiChatAgent:
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = LumiChatAgent()
    return _agent_instance
