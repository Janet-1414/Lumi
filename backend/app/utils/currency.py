"""
app/utils/currency.py — UGX and multi-currency formatting helpers.
"""


def format_ugx(amount: float, compact: bool = False) -> str:
    """Format a UGX amount for display. e.g. 2450000 → 'UGX 2,450,000'"""
    if compact:
        if amount >= 1_000_000:
            return f"UGX {amount / 1_000_000:.1f}M"
        if amount >= 1_000:
            return f"UGX {amount / 1_000:.0f}K"
    return f"UGX {amount:,.0f}"


def format_currency(amount: float, currency: str = "UGX", compact: bool = False) -> str:
    """Format any currency amount."""
    if currency.upper() == "UGX":
        return format_ugx(amount, compact)
    return f"{currency} {amount:,.2f}"


def pct_change(current: float, previous: float) -> float:
    """Percentage change between two values."""
    if previous == 0:
        return 0.0
    return round((current - previous) / previous * 100, 1)
