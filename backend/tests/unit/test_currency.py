"""
tests/unit/test_currency.py
"""

import pytest
from app.utils.currency import format_ugx, format_currency, pct_change


class TestFormatUGX:
    def test_formats_with_commas(self) -> None:
        assert format_ugx(2_450_000) == "UGX 2,450,000"

    def test_formats_zero(self) -> None:
        assert format_ugx(0) == "UGX 0"

    def test_compact_millions(self) -> None:
        assert format_ugx(2_450_000, compact=True) == "UGX 2.5M"

    def test_compact_thousands(self) -> None:
        assert format_ugx(350_000, compact=True) == "UGX 350K"

    def test_compact_under_thousand(self) -> None:
        assert format_ugx(999, compact=True) == "UGX 999"


class TestFormatCurrency:
    def test_defaults_to_ugx(self) -> None:
        assert "UGX" in format_currency(100_000)

    def test_handles_other_currency(self) -> None:
        result = format_currency(5_000, "KES")
        assert "KES" in result

    def test_ugx_uses_ugx_formatter(self) -> None:
        assert format_currency(1_000_000, "UGX") == "UGX 1,000,000"


class TestPctChange:
    def test_positive_change(self) -> None:
        assert pct_change(120, 100) == 20.0

    def test_negative_change(self) -> None:
        assert pct_change(80, 100) == -20.0

    def test_zero_previous(self) -> None:
        assert pct_change(100, 0) == 0.0

    def test_no_change(self) -> None:
        assert pct_change(100, 100) == 0.0

    def test_rounds_to_1_decimal(self) -> None:
        result = pct_change(133, 100)
        assert result == 33.0
