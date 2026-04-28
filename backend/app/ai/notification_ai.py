"""app/ai/notification_ai.py — AI decides when and what to notify users about."""


class NotificationAI:
    """
    Decides the optimal timing and content for user notifications.
    Rules:
    - Spending alert: when >80% of category budget used
    - Savings nudge: when no deposit in 3 days
    - Streak reminder: 2 hours before midnight if no saving logged today
    """

    def should_send_spending_alert(self, pct_used: float) -> bool:
        return pct_used >= 0.80

    def should_send_nudge(self, days_since_deposit: int) -> bool:
        return days_since_deposit >= 3

    def format_spending_alert(self, category: str, pct: float) -> str:
        return (f"⚠️ You've used {pct:.0f}% of your {category} budget. "
                f"Slow down to stay on track this month.")

    def format_streak_reminder(self, streak: int) -> str:
        return (f"🔥 Don't break your {streak}-day streak! "
                f"Log at least one saving today to keep it alive.")


_notification_ai = NotificationAI()
def get_notification_ai() -> NotificationAI:
    return _notification_ai
