"""
Vendor Service - SRP: Vendor expense tracking, itemized bill entries, and auto-summation.
DIP: Injected with IStorageBackend.
"""

import os
import json
import uuid
from typing import Dict, Any, List, Optional
from core.interfaces import IVendorService, IStorageBackend

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VENDOR_BILLS_FILE = os.path.join(BASE_DIR, "vendor_bills.json")
VENDOR_MASTER_FILE = os.path.join(BASE_DIR, "vendor_master.json")

DEFAULT_AVAILABLE_VENDORS = [
    "Rinka Marketing",
    "Kasturi Enterprises",
    "Goa Bhagavatdar",
    "Vedit General Store",
    "Jitendra Govekar",
    "Shreeji Trading",
    "Diksha Tendulkar",
    "poonam Anand mandrekar(Kaju)"
]


class VendorService(IVendorService):
    """Manages vendor master list, itemized grocery bills, and auto-summation to sheet Column P."""

    def __init__(self, storage: IStorageBackend, bills_file: str = VENDOR_BILLS_FILE, master_file: str = VENDOR_MASTER_FILE):
        self.storage = storage
        self.bills_file = bills_file
        self.master_file = master_file
        self.available_vendors = self._load_vendor_master()
        self.vendor_bills = self._load_vendor_bills()

    def _load_vendor_master(self) -> List[str]:
        if os.path.exists(self.master_file):
            try:
                with open(self.master_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and data:
                        return data
            except Exception as e:
                print(f"[VendorService] Error loading vendor master: {e}")
        return list(DEFAULT_AVAILABLE_VENDORS)

    def _save_vendor_master(self):
        try:
            with open(self.master_file, "w", encoding="utf-8") as f:
                json.dump(self.available_vendors, f, indent=2)
        except Exception as e:
            print(f"[VendorService] Error saving vendor master: {e}")

    def _load_vendor_bills(self) -> Dict[str, List[Dict[str, Any]]]:
        if os.path.exists(self.bills_file):
            try:
                with open(self.bills_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception as e:
                print(f"[VendorService] Error loading vendor bills: {e}")
        return {}

    def _save_vendor_bills(self):
        try:
            with open(self.bills_file, "w", encoding="utf-8") as f:
                json.dump(self.vendor_bills, f, indent=2)
        except Exception as e:
            print(f"[VendorService] Error saving vendor bills: {e}")

    def get_vendor_summary(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Fetches vendor summary, itemized entries, total vendor expenses, and net difference."""
        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        sheet_rows = self.storage.read_vendor_rows(target_tab)

        # Tab itemized bills from local store
        tab_entries = self.vendor_bills.get(target_tab, [])

        # Build vendor summaries map
        bill_counts: Dict[str, int] = {}
        for b in tab_entries:
            v_name = (b.get("vendor_name") or "").strip().lower()
            bill_counts[v_name] = bill_counts.get(v_name, 0) + 1

        vendors = []
        for r in sheet_rows:
            v_name = r.get("vendor_name", "")
            cnt = bill_counts.get(v_name.strip().lower(), 0)
            vendors.append({
                "row_number": r.get("row_number"),
                "vendor_name": v_name,
                "amount": r.get("amount", 0.0),
                "bill_count": cnt
            })

        total_vendor_expenses = sum(v["amount"] for v in vendors)

        # Read tab collections to calculate net difference
        tab_records_data = self.storage.read_tab_records(target_tab)
        metrics = tab_records_data.get("metrics", {})
        total_collections = metrics.get("total_collections", 0.0)
        net_difference = metrics.get("net_difference", total_collections - total_vendor_expenses)

        return {
            "tab": target_tab,
            "vendors": vendors,
            "vendor_count": len(vendors),
            "total_vendor_expenses": total_vendor_expenses,
            "net_difference": net_difference,
            "available_vendors": self.available_vendors,
            "all_entries": tab_entries,
            "total_entries_count": len(tab_entries)
        }

    def add_vendor_bill_entry(self, vendor_name: str, amount: float, date: Optional[str] = None, notes: Optional[str] = None, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Adds a bill entry, recalculates vendor total, and synchronizes to sheet Column P."""
        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        v_clean = vendor_name.strip()
        amt_clean = float(amount or 0.0)

        # Register vendor if not in available vendors
        if v_clean and not any(v.lower() == v_clean.lower() for v in self.available_vendors):
            self.available_vendors.append(v_clean)
            self._save_vendor_master()

        new_entry = {
            "id": f"bill_{uuid.uuid4().hex[:8]}",
            "vendor_name": v_clean,
            "amount": amt_clean,
            "date": date or "",
            "notes": notes or "",
            "tab": target_tab
        }

        if target_tab not in self.vendor_bills:
            self.vendor_bills[target_tab] = []

        self.vendor_bills[target_tab].insert(0, new_entry)
        self._save_vendor_bills()

        # Recalculate vendor total
        vendor_total = sum(
            float(b.get("amount", 0.0))
            for b in self.vendor_bills[target_tab]
            if (b.get("vendor_name") or "").strip().lower() == v_clean.lower()
        )

        # Sync to storage Column P
        self.storage.sync_vendor_total(v_clean, vendor_total, target_tab)

        return {
            "entry": new_entry,
            "vendor_name": v_clean,
            "vendor_total": vendor_total,
            "tab": target_tab
        }

    def delete_vendor_bill_entry(self, entry_id: str, tab_name: Optional[str] = None) -> bool:
        """Deletes a bill entry, recalculates total, and synchronizes to sheet."""
        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        entries = self.vendor_bills.get(target_tab, [])
        target_entry = next((e for e in entries if e["id"] == entry_id), None)
        if not target_entry:
            return False

        v_name = target_entry["vendor_name"]
        self.vendor_bills[target_tab] = [e for e in entries if e["id"] != entry_id]
        self._save_vendor_bills()

        # Recalculate vendor total
        vendor_total = sum(
            float(b.get("amount", 0.0))
            for b in self.vendor_bills[target_tab]
            if (b.get("vendor_name") or "").strip().lower() == v_name.lower()
        )

        self.storage.sync_vendor_total(v_name, vendor_total, target_tab)
        return True

    def register_vendor(self, vendor_name: str, initial_amount: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Registers a new vendor name and adds them to available vendors and sheet."""
        v_clean = vendor_name.strip()
        if not any(v.lower() == v_clean.lower() for v in self.available_vendors):
            self.available_vendors.append(v_clean)
            self._save_vendor_master()

        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        if initial_amount > 0:
            self.add_vendor_bill_entry(v_clean, initial_amount, notes="Opening bill", tab_name=target_tab)

        return {"vendor_name": v_clean, "initial_amount": initial_amount}

    def update_vendor(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Updates a vendor name and direct amount in sheet cells."""
        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        return self.storage.update_vendor_cell(row_number, vendor_name, amount, target_tab)

    def delete_vendor(self, row_number: int, tab_name: Optional[str] = None) -> bool:
        """Clears a vendor entry from the sheet."""
        target_tab = (tab_name or self.storage.get_current_tab()).strip()
        return self.storage.delete_vendor_cell(row_number, target_tab)

