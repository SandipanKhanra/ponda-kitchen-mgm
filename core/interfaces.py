"""
Core Interfaces - ISP (Interface Segregation Principle) & DIP (Dependency Inversion Principle)
Defines abstract contracts for storage backends and specialized domain services.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import io


class IStorageBackend(ABC):
    """
    Interface for persistence engines (Google Sheets, Local Excel, In-Memory).
    Adheres to Liskov Substitution Principle (LSP): any implementation can be used interchangeably.
    """

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Returns connection status, active mode, and spreadsheet metadata."""
        pass

    @abstractmethod
    def get_available_tabs(self, force_refresh: bool = False) -> List[str]:
        """Returns list of worksheet/tab names."""
        pass

    @abstractmethod
    def get_current_tab(self) -> str:
        """Returns currently active month tab name."""
        pass

    @abstractmethod
    def select_tab(self, tab_name: str) -> bool:
        """Selects active month tab."""
        pass

    @abstractmethod
    def create_new_sheet(self, sheet_name: str, clone_from: str = "Master_Template") -> Dict[str, Any]:
        """Creates a new month sheet by cloning a template."""
        pass

    @abstractmethod
    def read_tab_records(self, tab_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        """Reads transactions rows and computes metrics for a given tab."""
        pass

    @abstractmethod
    def append_record(self, data: Dict[str, Any], tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Appends a new transaction row."""
        pass

    @abstractmethod
    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Updates an existing transaction row."""
        pass

    @abstractmethod
    def delete_record(self, record_id: str, tab_name: Optional[str] = None) -> bool:
        """Deletes/clears a transaction row."""
        pass

    @abstractmethod
    def read_vendor_rows(self, tab_name: Optional[str] = None) -> List[Dict[str, Any]]:
        """Reads vendor rows from sheet columns N, O, P."""
        pass

    @abstractmethod
    def sync_vendor_total(self, vendor_name: str, total_amount: float, tab_name: Optional[str] = None) -> None:
        """Updates the auto-summed bill total into sheet Column P for a given vendor."""
        pass

    @abstractmethod
    def update_vendor_cell(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Updates vendor name and direct amount in sheet cells."""
        pass

    @abstractmethod
    def delete_vendor_cell(self, row_number: int, tab_name: Optional[str] = None) -> bool:
        """Clears vendor cell from sheet."""
        pass

    @abstractmethod
    def sync_cooks_to_sheet(self, cooks: List[Dict[str, Any]], tab_name: Optional[str] = None) -> bool:
        """Synchronizes cook roster and payroll rows to sheet."""
        pass

    @abstractmethod
    def generate_excel_export(self, tab_name: Optional[str] = None) -> io.BytesIO:
        """Generates an Excel workbook export stream."""
        pass

    @abstractmethod
    def invalidate_cache(self, tab_name: Optional[str] = None) -> None:
        """Clears memory caches."""
        pass


class IPolicyCalculator(ABC):
    """
    Interface for Policy Matrix calculations (Section 3).
    Open/Closed Principle (OCP): open to new pricing formulas without modifying consumers.
    """

    @abstractmethod
    def calculate_cook_incentive(self, devotee_count: int, menu_type: str) -> float:
        """Calculates dynamic cook incentive based on devotee slabs."""
        pass

    @abstractmethod
    def calculate_order_pricing(self, devotee_count: int, menu_type: str, record_type: str = "Order") -> Dict[str, Any]:
        """Calculates suggested order price and matrix incentive."""
        pass


class IOrderService(ABC):
    """Interface for Order and Sponsor transaction operations (ISP)."""

    @abstractmethod
    def get_records(self, tab_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        pass

    @abstractmethod
    def add_record(self, data: Dict[str, Any], tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete_record(self, record_id: str, tab_name: Optional[str] = None) -> bool:
        pass


class IVendorService(ABC):
    """Interface for Vendor management and itemized bill tracking (ISP)."""

    @abstractmethod
    def get_vendor_summary(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def add_vendor_bill_entry(self, vendor_name: str, amount: float, date: Optional[str] = None, notes: Optional[str] = None, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_vendor_bill_entry(self, entry_id: str, tab_name: Optional[str] = None) -> bool:
        pass

    @abstractmethod
    def register_vendor(self, vendor_name: str, initial_amount: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_vendor(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def delete_vendor(self, row_number: int, tab_name: Optional[str] = None) -> bool:
        pass


class ICookService(ABC):
    """Interface for Cook roster and direct matrix profit sharing payroll (ISP)."""

    @abstractmethod
    def get_cook_records(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def add_cook(self, name: str, base_salary: float, role: Optional[str] = "Cook", festival_allowance: float = 1000.0, yearly_bonus: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        pass

    @abstractmethod
    def update_cook(self, cook_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def delete_cook(self, cook_id: str, tab_name: Optional[str] = None) -> bool:
        pass


class IExportService(ABC):
    """Interface for spreadsheet exports (ISP)."""

    @abstractmethod
    def export_excel(self, tab_name: Optional[str] = None) -> io.BytesIO:
        pass

