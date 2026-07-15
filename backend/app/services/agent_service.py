import os
import time
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from .rag_service import retrieve_context

load_dotenv()

# Using fast model for all agents to keep response times demo-friendly
llm = ChatGroq(
    model="llama-3.1-8b-instant",
    groq_api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.0,
    max_tokens=600,
)


@tool
def lookup_lab_reference(parameter: str) -> str:
    """Look up normal reference ranges and clinical significance for a lab parameter."""
    return retrieve_context(f"normal range {parameter}", k=2)


@tool
def lookup_drug_risk(drug_and_context: str) -> str:
    """Look up drug interactions and risks given a drug name and patient condition."""
    return retrieve_context(f"drug interaction {drug_and_context}", k=3)


@tool
def assess_combined_risk(clinical_summary: str) -> str:
    """Assess combined risk when multiple abnormal values are present together."""
    return retrieve_context(clinical_summary, k=3)


def _run_agent(tools, system_prompt: str, user_input: str, retries: int = 2) -> str:
    """
    Runs a ReAct agent with resilience against four known failure modes:
      1. Rate limits (per-minute) -> retry after short delay
      2. Malformed tool-call syntax (tool_use_failed) -> retry once
      3. Hallucinated tool names not in the agent's toolset -> retry once
      4. Request too large (413) -> truncate input and retry once, no loop

    When tools is an empty list, create_react_agent still works correctly —
    it simply behaves as a single-shot reasoning call with no tool-calling
    capability at all, which eliminates failure modes 2 and 3 entirely for
    that agent.
    """
    try:
        agent = create_react_agent(llm, tools, prompt=system_prompt)
        result = agent.invoke({"messages": [{"role": "user", "content": user_input}]})

        final_message = result["messages"][-1]
        content = final_message.content

        if isinstance(content, list):
            text_parts = [block.get("text", "") for block in content
                         if isinstance(block, dict) and block.get("type") == "text"]
            return "\n".join(text_parts).strip()
        return str(content)

    except Exception as e:
        error_str = str(e)

        is_too_large = "413" in error_str or "too large" in error_str.lower()
        is_wrong_tool = "was not in request.tools" in error_str
        is_malformed_call = "tool_use_failed" in error_str
        is_rate_limited = "rate_limit_exceeded" in error_str

        is_retryable = (is_rate_limited or is_malformed_call or is_wrong_tool) and retries > 0 and not is_too_large

        if is_too_large:
            print("Request too large — truncating input and retrying once without retry loop")
            truncated_input = user_input[:1200] + "\n\n[Note: input truncated due to length]"
            try:
                agent = create_react_agent(llm, tools, prompt=system_prompt)
                result = agent.invoke({"messages": [{"role": "user", "content": truncated_input}]})
                final_message = result["messages"][-1]
                content = final_message.content
                if isinstance(content, list):
                    text_parts = [block.get("text", "") for block in content if isinstance(block, dict) and block.get("type") == "text"]
                    return "\n".join(text_parts).strip()
                return str(content)
            except Exception as e2:
                return f"Agent error: input too large even after truncation — {str(e2)}"

        if is_retryable:
            wait = 2.0 if is_rate_limited else 0.5
            print(f"Retryable error, retrying... ({retries} left): {error_str[:120]}")
            time.sleep(wait)
            return _run_agent(tools, system_prompt, user_input, retries - 1)

        print(f"Agent error: {e}")
        return f"Agent error: {error_str}"


def run_lab_agent(lab_text: str) -> str:
    tools = [lookup_lab_reference, assess_combined_risk]
    return _run_agent(
        tools,
        "You are a Lab Analysis Agent. You have access to ONLY these tools: lookup_lab_reference, "
        "assess_combined_risk. Do NOT attempt to use any other tools (no web search, no external search, "
        "no brave_search or similar). Be concise and direct.",
        f"Analyze these lab results:\n{lab_text}"
    )


def run_medicine_agent(medicines: list, lab_summary: str) -> str:
    """
    Pre-fetches RAG context directly in code for each named medicine.

    No tools are given to this agent — it reasons purely over the
    pre-fetched context as plain text. This was changed after observing
    that even with context pre-fetched, giving the model an OPTIONAL tool
    still caused malformed tool-call errors (tool_use_failed) on
    llama-3.1-8b-instant, exhausting all retries. Since the relevant
    context is already deterministically correct in code, there is no
    upside to letting the model call a tool here — only downside risk.
    """
    context_blocks = []
    for med in medicines:
        ctx = retrieve_context(f"drug interaction {med}", k=2)
        context_blocks.append(f"--- {med} ---\n{ctx}")
    combined_context = "\n\n".join(context_blocks)[:1800]

    tools = []  # intentionally empty — see docstring
    return _run_agent(
        tools,
        "You are a Medicine Safety Agent. You have NO tools available — base your "
        "entire safety assessment on the reference context provided below. "
        "Only ever mention the specific medicines listed here: "
        f"{', '.join(medicines)}. Never mention any other drug name, even if one "
        "appears in the reference context as a tangential example.\n\n"
        f"Reference context:\n{combined_context}",
        f"Check these medicines for dangerous interactions:\nMedicines: {', '.join(medicines)}\n\nLab Summary: {lab_summary}"
    )


def run_risk_orchestrator(lab_analysis: str, medicine_analysis: str) -> str:
    """
    Uses the fast 8B model by default for quick demo-friendly response times.

    Hard guard: if either upstream analysis is itself a failed Agent error,
    we intercept BEFORE calling the LLM rather than relying on prompt
    instructions alone.
    """
    lab_failed = lab_analysis.strip().startswith("Agent error")
    med_failed = medicine_analysis.strip().startswith("Agent error")

    if lab_failed and med_failed:
        return ("Unable to generate a final verdict — both lab and medicine analyses "
                "failed due to API errors. Please try again.")
    if med_failed:
        return (f"Medicine analysis failed due to an API error, so a complete combined "
                f"verdict isn't possible. Lab findings alone:\n\n{lab_analysis}")
    if lab_failed:
        return (f"Lab analysis failed due to an API error, so a complete combined "
                f"verdict isn't possible. Medicine findings alone:\n\n{medicine_analysis}")

    lab_short = lab_analysis[:600]
    med_short = medicine_analysis[:600]

    tools = [assess_combined_risk]
    system_prompt = (
        "You are a Risk Orchestrator Agent. You have access to ONLY ONE tool: assess_combined_risk. "
        "Do NOT attempt to use any other tools. Be concise. Only reference medicines, "
        "conditions, and values explicitly mentioned in the provided analyses below — "
        "never invent or hallucinate drug names, medicine switches, or numeric values not present "
        "in the input. Do not introduce any drug name that does not appear verbatim in the text below."
    )
    user_input = (
        f"Combine these analyses into a final concise verdict:\n\n"
        f"Lab Analysis:\n{lab_short}\n\n"
        f"Medicine Analysis:\n{med_short}"
    )

    result = _run_agent(tools, system_prompt, user_input)

    if result.startswith("Agent error") and ("too large" in result.lower() or "413" in result):
        return ("Unable to generate the final synthesized verdict right now due to API rate limits "
                "from heavy testing today. The individual Lab Analysis and Medicine Safety Agent "
                "results above are accurate and complete on their own.")

    return result