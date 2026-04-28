"""app/utils/utils.py — Shared pure utility functions."""

import random
import string

_ADJECTIVES = ["Savings", "Budget", "Smart", "Frugal", "Wise", "Gold", "Diamond"]
_NOUNS      = ["Lion", "Queen", "King", "Eagle", "Cheetah", "Phoenix", "Ace"]
_CITIES     = ["KLA", "LGS", "NBO", "ACC", "ABJ", "DAR"]


def generate_alias() -> str:
    """Generate a random anonymous alias like 'SavingsLion_KLA'."""
    adj  = random.choice(_ADJECTIVES)
    noun = random.choice(_NOUNS)
    city = random.choice(_CITIES)
    return f"{adj}{noun}_{city}"


def generate_random_string(length: int = 8) -> str:
    """Generate a random alphanumeric string."""
    return "".join(random.choices(string.ascii_letters + string.digits, k=length))
