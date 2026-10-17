"""
Order Service - SRP: Transaction business logic, validations, and metrics.
DIP: Injected with IStorageBackend and IPolicyCalculator abstractions.
"""

from typing import Dict, Any, Optional
from core.interfaces import IOrderService, IStorageBackend, IPolicyCalculator


class OrderService(IOrderService):
    """Manages Order and Sponsor transactions and calculation of Section 3 incentives."""

    def __init__(self, storage: IStorageBackend, policy: IPolicyCalculator):
        self.storage = storage
        self.policy = policy

    def get_records(self, tab_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        """Fetches transactions, calculated metrics, and bifurcations for the selected tab."""
        return self.storage.read_tab_records(tab_name=tab_name, force_refresh=force_refresh)

    def add_record(self, data: Dict[str, Any], tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Validates record, applies policy incentive calculation for Orders, and persists to storage."""
        rec_type = str(data.get("type") or "Order").strip()
        is_order = (rec_type.lower() == "order")

        devotees = int(data.get("number_of_devotees") or 0) if is_order else 0
        menu_type = str(data.get("menu_type") or "").strip() if is_order else ""

        # Calculate incentive using policy calculator
        incentive = 0.0
        if is_order and devotees > 0 and menu_type:
            incentive = self.policy.calculate_cook_incentive(devotees, menu_type)

        record_payload = dict(data)
        record_payload["type"] = rec_type
        record_payload["number_of_devotees"] = devotees
        record_payload["menu_type"] = menu_type
        record_payload["cook_incentive"] = incentive

        return self.storage.append_record(record_payload, tab_name=tab_name)

    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Recalculates incentive if devotees/menu/type change, and updates storage."""
        payload = dict(updates)
        rec_type = payload.get("type")
        devotees = payload.get("number_of_devotees")
        menu_type = payload.get("menu_type")

        # If order fields are being updated, ensure incentive matches policy
        if (rec_type and str(rec_type).strip().lower() == "order") or (devotees is not None) or (menu_type is not None):
            dev_val = int(devotees or 0)
            menu_val = str(menu_type or "").strip()
            if dev_val > 0 and menu_val:
                payload["cook_incentive"] = self.policy.calculate_cook_incentive(dev_val, menu_val)
            else:
                payload["cook_incentive"] = 0.0

        return self.storage.update_record(record_id, payload, tab_name=tab_name)

    def delete_record(self, record_id: str, tab_name: Optional[str] = None) -> bool:
        """Deletes a transaction record from storage."""
        return self.storage.delete_record(record_id, tab_name=tab_name)

