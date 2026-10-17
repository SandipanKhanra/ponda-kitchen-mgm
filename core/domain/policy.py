"""
Policy Domain Module - SRP: Policy Matrix (Section 3) & Plate Pricing Engine.
Open/Closed Principle (OCP): New menu tiers and pricing structures can be configured cleanly.
"""

from typing import Dict, Any
from core.interfaces import IPolicyCalculator

# ISKCON-PONDA Kitchen Policy Section 3 Rates
MENU_PRICES: Dict[str, int] = {
    "Very Heavy": 250,  # 250/plate
    "Heavy":      220,  # 220/plate
    "Medium":     160,  # 160/plate
    "Light":      100,  # 100/plate
}

# Devotee Slabs: Upto 25, From 26 to 50, ..., From 226 to 250
INCENTIVE_MATRIX: Dict[str, list] = {
    "Very Heavy": [219, 438, 656, 875, 1094, 1313, 1531, 1750, 1969, 2188],
    "Heavy":      [193, 385, 578, 770, 963, 1115, 1348, 1540, 1733, 1925],
    "Medium":     [140, 280, 420, 560, 700, 840, 980, 1120, 1260, 1400],
    "Light":      [88, 175, 263, 350, 438, 525, 613, 700, 788, 875],
}

DEFAULT_COOKS = [
    {
        "id": "cook-1",
        "name": "Manoranjan Prabhu",
        "base_salary": 17137.0,
        "role": "Main Kitchen, Wooden Chulha Area (Coconut Grater, Atta Machine)",
        "festival_allowance": 1000.0,
        "yearly_bonus": 0.0
    },
    {
        "id": "cook-2",
        "name": "Chittaranjan Prabhu",
        "base_salary": 17137.0,
        "role": "Main Kitchen, Wooden Chulha Area (Fridge, Mixer)",
        "festival_allowance": 1000.0,
        "yearly_bonus": 0.0
    },
    {
        "id": "cook-3",
        "name": "Ranjan Prabhu",
        "base_salary": 13448.0,
        "role": "Main Kitchen, Wooden Chulha Area (Tomato Puree, Potato Peeler)",
        "festival_allowance": 1000.0,
        "yearly_bonus": 0.0
    }
]


class PolicyCalculator(IPolicyCalculator):
    """Encapsulates Section 3 Policy incentive calculations and order pricing."""

    def __init__(self, menu_prices: Dict[str, int] = None, incentive_matrix: Dict[str, list] = None):
        self.menu_prices = menu_prices or MENU_PRICES
        self.incentive_matrix = incentive_matrix or INCENTIVE_MATRIX

    def calculate_cook_incentive(self, devotee_count: int, menu_type: str) -> float:
        """Calculates cook incentive from Policy Matrix (Section 3)."""
        if not devotee_count or devotee_count <= 0 or not menu_type:
            return 0.0

        menu_key = None
        menu_clean = menu_type.strip().lower()
        for key in sorted(self.incentive_matrix.keys(), key=len, reverse=True):
            if key.lower() in menu_clean:
                menu_key = key
                break

        if not menu_key:
            return 0.0

        rates = self.incentive_matrix[menu_key]
        idx = (devotee_count - 1) // 25
        if idx < len(rates):
            return float(rates[idx])

        extra_brackets = idx - len(rates) + 1
        step = rates[1] - rates[0]
        return float(rates[-1] + extra_brackets * step)

    def calculate_order_pricing(self, devotee_count: int, menu_type: str, record_type: str = "Order") -> Dict[str, Any]:
        """Calculates suggested order amount and matrix cook incentive."""
        is_order = (record_type or "Order").strip().lower() == "order"
        plate_price = 0
        menu_clean = (menu_type or "").strip().lower()
        for key in sorted(self.menu_prices.keys(), key=len, reverse=True):
            if key.lower() in menu_clean:
                plate_price = self.menu_prices[key]
                break

        suggested_amount = plate_price * devotee_count if is_order and devotee_count else 0.0
        incentive = self.calculate_cook_incentive(devotee_count, menu_type) if is_order else 0.0

        return {
            "devotees": devotee_count,
            "menu_type": menu_type,
            "record_type": record_type,
            "is_order": is_order,
            "plate_price": plate_price,
            "suggested_amount": suggested_amount,
            "cook_incentive": incentive
        }

