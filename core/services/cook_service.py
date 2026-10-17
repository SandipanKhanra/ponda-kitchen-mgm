"""
Cook Service - SRP: Cook roster management & Section 3 Policy direct profit sharing payroll.
DIP: Injected with IStorageBackend and IPolicyCalculator.
"""

import os
import json
import uuid
from typing import Dict, Any, List, Optional
from core.interfaces import ICookService, IStorageBackend, IPolicyCalculator
from core.domain.policy import DEFAULT_COOKS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
COOKS_CONFIG_FILE = os.path.join(BASE_DIR, "cooks_config.json")


class CookService(ICookService):
    """Manages cook profiles, salary configuration, and Section 3 direct profit sharing payroll."""

    def __init__(self, storage: IStorageBackend, policy: IPolicyCalculator, config_file: str = COOKS_CONFIG_FILE):
        self.storage = storage
        self.policy = policy
        self.config_file = config_file
        self.cooks = self._load_cooks_config()

    def _load_cooks_config(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and data:
                        return data
            except Exception as e:
                print(f"[CookService] Error loading cooks config: {e}")
        return [dict(c) for c in DEFAULT_COOKS]

    def _save_cooks_config(self):
        try:
            with open(self.config_file, "w", encoding="utf-8") as f:
                json.dump(self.cooks, f, indent=2)
        except Exception as e:
            print(f"[CookService] Error saving cooks config: {e}")

    def get_cook_records(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetches cook roster with live monthly payroll.
        As per ISKCON-PONDA Kitchen Policy Section 3:
        Direct profit sharing: Every active cook receives the full matrix incentive pool directly.
        Total Payout = Base Salary + Direct Matrix Share + Festival Allowance + Yearly Bonus.
        """
        target_tab = (tab_name or self.storage.get_current_tab()).strip()

        # Read active tab records to compute matrix incentive pool
        tab_data = self.storage.read_tab_records(target_tab)
        records = tab_data.get("records", [])

        # Total incentive pool strictly from Order transactions
        total_matrix_incentive = sum(
            float(r.get("cook_incentive", 0.0))
            for r in records
            if r.get("type", "").strip().lower() == "order"
        )

        cook_list = []
        total_payroll = 0.0

        for c in self.cooks:
            base = float(c.get("base_salary", 0.0))
            fest = float(c.get("festival_allowance", 1000.0))
            bonus = float(c.get("yearly_bonus", 0.0))
            # Direct profit sharing: full matrix incentive added directly to each person
            share = total_matrix_incentive
            payout = round(base + share + fest + bonus, 2)
            total_payroll += payout

            cook_list.append({
                "id": c.get("id"),
                "name": c.get("name"),
                "role": c.get("role", "Cook"),
                "base_salary": base,
                "festival_allowance": fest,
                "yearly_bonus": bonus,
                "matrix_share": share,
                "total_payout": payout
            })

        return {
            "tab": target_tab,
            "cooks": cook_list,
            "cook_count": len(cook_list),
            "total_cook_incentive": total_matrix_incentive,
            "total_payroll": round(total_payroll, 2)
        }

    def add_cook(self, name: str, base_salary: float, role: Optional[str] = "Cook", festival_allowance: float = 1000.0, yearly_bonus: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Adds a cook to the roster and synchronizes to storage."""
        new_cook = {
            "id": f"cook_{uuid.uuid4().hex[:6]}",
            "name": name.strip(),
            "base_salary": float(base_salary or 0.0),
            "role": (role or "Cook").strip(),
            "festival_allowance": float(festival_allowance if festival_allowance is not None else 1000.0),
            "yearly_bonus": float(yearly_bonus if yearly_bonus is not None else 0.0)
        }
        self.cooks.append(new_cook)
        self._save_cooks_config()

        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        self.storage.sync_cooks_to_sheet(self.cooks, target_tab)
        return new_cook

    def update_cook(self, cook_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Updates cook details and synchronizes to storage."""
        for c in self.cooks:
            if c["id"] == cook_id:
                if "name" in updates and updates["name"]:
                    c["name"] = updates["name"].strip()
                if "base_salary" in updates and updates["base_salary"] is not None:
                    c["base_salary"] = float(updates["base_salary"])
                if "role" in updates and updates["role"]:
                    c["role"] = updates["role"].strip()
                if "festival_allowance" in updates and updates["festival_allowance"] is not None:
                    c["festival_allowance"] = float(updates["festival_allowance"])
                if "yearly_bonus" in updates and updates["yearly_bonus"] is not None:
                    c["yearly_bonus"] = float(updates["yearly_bonus"])

                self._save_cooks_config()
                target_tab = (tab_name or self.storage.get_current_tab()).strip()
                self.storage.sync_cooks_to_sheet(self.cooks, target_tab)
                return c
        return None

    def delete_cook(self, cook_id: str, tab_name: Optional[str] = None) -> bool:
        """Removes a cook from the roster and synchronizes to storage."""
        orig_len = len(self.cooks)
        self.cooks = [c for c in self.cooks if c["id"] != cook_id]
        if len(self.cooks) < orig_len:
            self._save_cooks_config()
            target_tab = (tab_name or self.storage.get_current_tab()).strip()
            self.storage.sync_cooks_to_sheet(self.cooks, target_tab)
            return True
        return False

