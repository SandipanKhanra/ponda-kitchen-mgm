"""
Sheet Storage Backend Adapter - LSP & DIP.
Implements IStorageBackend adapting Google Sheets and Local Excel persistence.
"""

import io
from typing import Dict, Any, List, Optional
from core.interfaces import IStorageBackend


class SheetStorageBackend(IStorageBackend):
    """
    Adapter implementing IStorageBackend.
    Delegates to the spreadsheet sync engine while exposing a clean, decoupled interface.
    """

    def __init__(self, raw_engine=None):
        if raw_engine is None:
            # Lazy import to avoid circular dependency
            import sheet_service
            self._engine = sheet_service._raw_sheet_engine
        else:
            self._engine = raw_engine

    @property
    def mode(self) -> str:
        return self._engine.mode

    @property
    def sheet(self):
        return self._engine.sheet

    @property
    def current_tab_name(self) -> str:
        return self._engine.current_tab_name

    def get_status(self) -> Dict[str, Any]:
        return self._engine.get_status()

    def get_available_tabs(self, force_refresh: bool = False) -> List[str]:
        return self._engine.get_available_tabs(force_refresh=force_refresh)

    def get_current_tab(self) -> str:
        return self._engine.current_tab_name

    def select_tab(self, tab_name: str) -> bool:
        return self._engine.select_tab(tab_name)

    def create_new_sheet(self, sheet_name: str, clone_from: str = "Master_Template") -> Dict[str, Any]:
        return self._engine.create_new_sheet(sheet_name, clone_from=clone_from)

    def read_tab_records(self, tab_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        return self._engine.get_month_records(tab_name=tab_name, force_refresh=force_refresh)

    def append_record(self, data: Dict[str, Any], tab_name: Optional[str] = None) -> Dict[str, Any]:
        target_tab = (tab_name or self._engine.current_tab_name).strip()
        self._engine.invalidate_cache(target_tab)
        if self._engine.mode == "google_sheets":
            return self._engine._add_google_record(data, target_tab)
        return self._engine._add_excel_record(data, target_tab)

    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target_tab = (tab_name or self._engine.current_tab_name).strip()
        self._engine.invalidate_cache(target_tab)
        if self._engine.mode == "google_sheets":
            return self._engine._update_google_record(record_id, updates, target_tab)
        return self._engine._update_excel_record(record_id, updates, target_tab)

    def delete_record(self, record_id: str, tab_name: Optional[str] = None) -> bool:
        return self._engine.delete_record(record_id, tab_name=tab_name)

    def read_vendor_rows(self, tab_name: Optional[str] = None) -> List[Dict[str, Any]]:
        target_tab = (tab_name or self._engine.current_tab_name).strip()
        raw_vendors = self._engine.get_vendor_records(target_tab)
        return raw_vendors.get("vendors", [])

    def sync_vendor_total(self, vendor_name: str, total_amount: float, tab_name: Optional[str] = None) -> None:
        target_tab = (tab_name or self._engine.current_tab_name).strip()
        self._engine._sync_vendor_total_to_sheet(vendor_name, total_amount, target_tab)

    def update_vendor_cell(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        return self._engine.update_vendor_record(row_number, vendor_name, amount, tab_name=tab_name)

    def delete_vendor_cell(self, row_number: int, tab_name: Optional[str] = None) -> bool:
        return self._engine.delete_vendor_record(row_number, tab_name=tab_name)

    def sync_cooks_to_sheet(self, cooks: List[Dict[str, Any]], tab_name: Optional[str] = None) -> bool:
        self._engine.cooks = cooks
        return self._engine._sync_cooks_to_sheet(tab_name=tab_name)

    def generate_excel_export(self, tab_name: Optional[str] = None) -> io.BytesIO:
        target_tab = (tab_name or self._engine.current_tab_name).strip()
        return self._engine.generate_excel_export(target_tab)

    def invalidate_cache(self, tab_name: Optional[str] = None) -> None:
        self._engine.invalidate_cache(tab_name=tab_name)

