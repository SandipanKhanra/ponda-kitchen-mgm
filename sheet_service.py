import os
import io
import json
import re
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    import gspread
    from google.oauth2.service_account import Credentials
    GSPREAD_AVAILABLE = True
except ImportError:
    GSPREAD_AVAILABLE = False

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False

HEADERS = [
    "Vendor name", "Amount", "",
    "Date", "Person name", "Program", "Type",
    "No. of Devotees", "Menu Type", "Order Incentive",
    "Amount", "Payment through", "Paymt Rcvd"
]
EXCEL_FILE_PATH = os.path.join(os.path.dirname(__file__), "database.xlsx")
COOKS_CONFIG_FILE = os.path.join(os.path.dirname(__file__), "cooks_config.json")
VENDOR_MASTER_FILE = os.path.join(os.path.dirname(__file__), "vendor_master.json")
VENDOR_BILLS_FILE = os.path.join(os.path.dirname(__file__), "vendor_bills.json")

DEFAULT_SPREADSHEET_ID = "15tvKnG6mx2XiwQi54pynK1q_gSMW8lNrwMklKambK4Y"
DEFAULT_SPREADSHEET_GID = "1912501962"
DEFAULT_TAB_NAME = "April 26"

DEFAULT_VENDORS = [
    "Rinka Marketing",
    "Kasturi Enterprises",
    "Goa Bhagayatdar",
    "Vedit General Store",
    "Jitendra Govekar",
    "Shreeji Trading",
    "Diksha Tendulkar",
    "Matchless gift purchase",
    "Gas",
    "Petty cash"
]

# -----------------------------------------------------------------------------
# Policy Section 3: Allowances & Incentives Matrix (ISKCON-PONDA Kitchen Policy)
# -----------------------------------------------------------------------------
MENU_PRICES = {
    "Very Heavy": 250, # 250/plate
    "Heavy":      220, # 220/plate
    "Medium":     160, # 160/plate
    "Light":      100, # 100/plate
}

INCENTIVE_MATRIX = {
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

def calculate_cook_incentive(devotee_count: int, menu_type: str) -> float:
    """Calculates cook incentive from Policy Matrix (Section 3). Delegated to PolicyCalculator (SRP)."""
    from core.domain.policy import PolicyCalculator
    return PolicyCalculator().calculate_cook_incentive(devotee_count, menu_type)

def calculate_order_pricing(devotee_count: int, menu_type: str, record_type: str = "Order") -> Dict[str, Any]:
    """Calculates suggested order amount and matrix cook incentive. Delegated to PolicyCalculator (SRP)."""
    from core.domain.policy import PolicyCalculator
    return PolicyCalculator().calculate_order_pricing(devotee_count, menu_type, record_type)

def load_env_file():
    """Auto-loads .env file."""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k and k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass

load_env_file()

def parse_num(val: Any) -> float:
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).replace(",", "").replace("₹", "").strip()
    try:
        return float(s)
    except ValueError:
        return 0.0

def parse_int(val: Any) -> int:
    if val is None:
        return 0
    if isinstance(val, int):
        return val
    try:
        return int(float(str(val).strip()))
    except (ValueError, TypeError):
        return 0

def normalize_sheet_date(date_val: Any) -> str:
    """Normalizes YYYY-MM-DD (from HTML5 date pickers), datetime objects, or existing date into DD/MM/YYYY."""
    if not date_val:
        return datetime.now().strftime("%d/%m/%Y")
    if isinstance(date_val, datetime):
        return date_val.strftime("%d/%m/%Y")
    d_str = str(date_val).strip()
    if "-" in d_str and len(d_str.split("-")) == 3:
        parts = d_str.split("-")
        if len(parts[0]) == 4:  # YYYY-MM-DD
            return f"{parts[2].zfill(2)}/{parts[1].zfill(2)}/{parts[0]}"
    return d_str

class SheetService:
    def __init__(self):
        self.mode = "local_excel"  # "google_sheets" or "local_excel"
        self.client = None
        self.sheet = None
        self.worksheet = None
        self.current_tab_name = DEFAULT_TAB_NAME
        self.spreadsheet_title = "Local Excel Database (database.xlsx)"
        self.available_tabs: List[str] = [DEFAULT_TAB_NAME]
        self.connection_error = None

        # In-Memory Cache to respect Google Sheets Free Tier API rate limits (60 req/min)
        self._records_cache: Dict[str, Dict[str, Any]] = {}
        self._tabs_cache: Optional[Dict[str, Any]] = None
        self.CACHE_TTL_SECONDS = 45

        self.cooks: List[Dict[str, Any]] = self._load_cooks_config()
        self.vendor_master: List[str] = self._load_vendor_master()
        self.vendor_bills: Dict[str, List[Dict[str, Any]]] = self._load_vendor_bills()
        self._init_backend()

    def _load_vendor_master(self) -> List[str]:
        if os.path.exists(VENDOR_MASTER_FILE):
            try:
                with open(VENDOR_MASTER_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and len(data) > 0:
                        return data
            except Exception:
                pass
        return list(DEFAULT_VENDORS)

    def _save_vendor_master(self):
        try:
            with open(VENDOR_MASTER_FILE, "w", encoding="utf-8") as f:
                json.dump(self.vendor_master, f, indent=2)
        except Exception as e:
            print(f"[SheetService] Error saving vendor master: {e}")

    def _load_vendor_bills(self) -> Dict[str, List[Dict[str, Any]]]:
        if os.path.exists(VENDOR_BILLS_FILE):
            try:
                with open(VENDOR_BILLS_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        return data
            except Exception:
                pass
        return {}

    def _save_vendor_bills(self):
        try:
            with open(VENDOR_BILLS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.vendor_bills, f, indent=2)
        except Exception as e:
            print(f"[SheetService] Error saving vendor bills: {e}")

    def _load_cooks_config(self) -> List[Dict[str, Any]]:
        if os.path.exists(COOKS_CONFIG_FILE):
            try:
                with open(COOKS_CONFIG_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return [dict(c) for c in DEFAULT_COOKS]

    def _save_cooks_config(self):
        try:
            with open(COOKS_CONFIG_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cooks, f, indent=2)
        except Exception as e:
            print(f"[SheetService] Error saving cooks config: {e}")

    def _init_backend(self):
        google_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON")
        google_file = os.environ.get("SERVICE_ACCOUNT_FILE", "credentials.json")
        sheet_target = os.environ.get("SPREADSHEET_ID", DEFAULT_SPREADSHEET_ID)

        if GSPREAD_AVAILABLE and (google_json or (google_file and os.path.exists(google_file))):
            try:
                scopes = [
                    "https://www.googleapis.com/auth/spreadsheets",
                    "https://www.googleapis.com/auth/drive"
                ]
                if google_json:
                    creds_info = json.loads(google_json)
                    creds = Credentials.from_service_account_info(creds_info, scopes=scopes)
                else:
                    creds = Credentials.from_service_account_file(google_file, scopes=scopes)

                self.client = gspread.authorize(creds)

                try:
                    self.sheet = self.client.open_by_key(sheet_target)
                except Exception:
                    self.sheet = self.client.open(sheet_target)

                self.spreadsheet_title = self.sheet.title
                self.mode = "google_sheets"

                all_ws = self.sheet.worksheets()
                self.available_tabs = [w.title.strip() for w in all_ws]

                sheet_gid = os.environ.get("SPREADSHEET_GID", DEFAULT_SPREADSHEET_GID)
                matched_ws = None
                if sheet_gid:
                    try:
                        matched_ws = self.sheet.get_worksheet_by_id(int(sheet_gid))
                    except Exception:
                        pass

                if not matched_ws and DEFAULT_TAB_NAME in self.available_tabs:
                    matched_ws = self.sheet.worksheet(DEFAULT_TAB_NAME)
                elif not matched_ws and all_ws:
                    matched_ws = all_ws[0]

                self.worksheet = matched_ws
                self.current_tab_name = self.worksheet.title.strip() if self.worksheet else DEFAULT_TAB_NAME
                print(f"[SheetService] Connected to Google Sheet: '{self.spreadsheet_title}' (Tab: '{self.current_tab_name}')")
                return
            except Exception as e:
                self.connection_error = str(e)
                print(f"[SheetService] Google Sheets connection failed ({e}). Falling back to Local Excel.")

        self.mode = "local_excel"
        self._ensure_excel_file()
        print(f"[SheetService] Using Local Excel database at: {EXCEL_FILE_PATH}")

    def invalidate_cache(self, tab_name: Optional[str] = None):
        """Clears in-memory cache to force fresh read from sheet."""
        if tab_name and tab_name in self._records_cache:
            del self._records_cache[tab_name]
        else:
            self._records_cache.clear()
        self._tabs_cache = None

    def get_available_tabs(self, force_refresh: bool = False) -> List[str]:
        now = time.time()
        if not force_refresh and self._tabs_cache and (now - self._tabs_cache["time"] < 300):
            return self._tabs_cache["tabs"]

        if self.mode == "google_sheets" and self.sheet:
            try:
                tabs = [w.title.strip() for w in self.sheet.worksheets()]
                self.available_tabs = tabs
                self._tabs_cache = {"tabs": tabs, "time": now}
                return tabs
            except Exception as e:
                print(f"[SheetService] Error fetching tabs: {e}")
                return self.available_tabs
        else:
            tabs = list(self.available_tabs)
            if OPENPYXL_AVAILABLE and os.path.exists(EXCEL_FILE_PATH):
                try:
                    wb = openpyxl.load_workbook(EXCEL_FILE_PATH, read_only=True)
                    for s in wb.sheetnames:
                        if s not in tabs:
                            tabs.append(s)
                except Exception:
                    pass
            # Also discover standalone month files like Kitchen_Accountability_Feb_27.xlsx
            try:
                base_dir = os.path.dirname(__file__)
                for f in os.listdir(base_dir):
                    if f.startswith("Kitchen_Accountability_") and f.endswith(".xlsx"):
                        t_name = f[len("Kitchen_Accountability_"):-len(".xlsx")].replace("_", " ").strip()
                        if t_name and t_name not in tabs:
                            tabs.append(t_name)
            except Exception:
                pass
            self.available_tabs = tabs
            return tabs



    def get_status(self) -> Dict[str, Any]:
        tabs = self.get_available_tabs()
        return {
            "mode": self.mode,
            "connected": self.mode == "google_sheets" or os.path.exists(EXCEL_FILE_PATH),
            "spreadsheet_title": self.spreadsheet_title,
            "spreadsheet_id": os.environ.get("SPREADSHEET_ID", DEFAULT_SPREADSHEET_ID),
            "current_tab": self.current_tab_name,
            "available_tabs": tabs,
            "gspread_library_installed": GSPREAD_AVAILABLE,
            "openpyxl_installed": OPENPYXL_AVAILABLE,
            "connection_error": self.connection_error,
            "google_sheet_url": f"https://docs.google.com/spreadsheets/d/{DEFAULT_SPREADSHEET_ID}/edit#gid={self.worksheet.id if self.worksheet else DEFAULT_SPREADSHEET_GID}"
        }

    # -------------------------------------------------------------------------
    # Batch Reading with Caching for Rate Limit Compliance
    # -------------------------------------------------------------------------
    def get_month_records(self, tab_name: Optional[str] = None, force_refresh: bool = False) -> Dict[str, Any]:
        target_tab = (tab_name or self.current_tab_name).strip()
        now = time.time()

        if not force_refresh and target_tab in self._records_cache:
            entry = self._records_cache[target_tab]
            if (now - entry["time"]) < self.CACHE_TTL_SECONDS:
                return entry["data"]

        if self.mode == "google_sheets":
            result = self._get_google_records(target_tab)
        else:
            result = self._get_excel_records(target_tab)

        self._records_cache[target_tab] = {"data": result, "time": now}
        return result

    @staticmethod
    def _detect_order_layout(all_rows: List[List[Any]]) -> Dict[str, Any]:
        """
        Dynamically detects the order table column layout and header row.
        Supports:
          1. Legacy / Original Sheets (e.g. 'August 26', 'Jan 26', 'Sept 25'):
             Columns start at D (0-indexed 3) with headers on Row 2:
             Original columns:
               Col D (3): Date
               Col E (4): Person name
               Col F (5): Program
               Col G (6): Type
               Col H (7): Payment through
               Col I (8): Amount
               Col J (9): Paymt Rcvd
             New columns added accordingly:
               Col K (10): No. of Devotees
               Col L (11): Menu Type
               Col M (12): Order Incentive
               Col N (13): Notes
          2. Modern / Template Sheets (e.g. 'April 26', 'Nov 26', 'Master_Template'):
             Columns start at D (0-indexed 3) with headers on Row 2:
               Col D (3): Date
               Col E (4): Person name
               Col F (5): Program
               Col G (6): Type
               Col H (7): No. of Devotees
               Col I (8): Menu Type
               Col J (9): Order Incentive
               Col K (10): Amount
               Col L (11): Payment through
               Col M (12): Paymt Rcvd
               Col N (13): Notes
          3. Standalone / A1-based Sheets (e.g. 'Kitchen_Accountability_Feb_27.xlsx'):
             Columns start at A (0-indexed 0) with headers on Row 1 (or 2):
               Col A (0): Date .. Col K (10): Notes
        """
        default_layout = {
            "layout_type": "template_orders",
            "header_row_idx": 2,
            "data_start_row": 3,
            "start_col_idx": 3,
            "end_col_idx": 13,
            "start_col_letter": "D",
            "end_col_letter": "N",
            "col_map": {
                "date": 3,
                "person_name": 4,
                "program": 5,
                "type": 6,
                "number_of_devotees": 7,
                "menu_type": 8,
                "cook_incentive": 9,
                "amount": 10,
                "payment_through": 11,
                "payment_received": 12,
                "notes": 13
            }
        }

        if not all_rows:
            return default_layout

        header_row_idx = None
        date_col_idx = None

        for r_i in range(min(4, len(all_rows))):
            row = all_rows[r_i][:15]
            row_strs = [str(c or "").strip().lower() for c in row]
            for c_i, c_text in enumerate(row_strs):
                if "date" in c_text and c_i < 15:
                    order_indicators = ["person", "name", "type", "program", "amount", "payment", "rcvd"]
                    if sum(1 for ind in order_indicators if any(ind in s for s in row_strs)) >= 2:
                        header_row_idx = r_i + 1
                        date_col_idx = c_i
                        break
            if header_row_idx is not None:
                break

        if header_row_idx is None:
            if len(all_rows) > 0 and "date" in str(all_rows[0][0] or "").lower():
                header_row_idx = 1
                date_col_idx = 0
            elif len(all_rows) > 1 and "date" in str(all_rows[1][0] or "").lower():
                header_row_idx = 2
                date_col_idx = 0
            else:
                header_row_idx = 2
                date_col_idx = 3

        start_col = date_col_idx
        h_cells = all_rows[header_row_idx - 1][:15] if header_row_idx <= len(all_rows) else []
        h_strs = [str(c or "").strip().lower() for c in h_cells]

        # Check for legacy format (Col H / idx 7 is 'Payment through')
        is_legacy = False
        if start_col == 3 and len(h_strs) > 7:
            if "payment" in h_strs[7] or "through" in h_strs[7] or "mode" in h_strs[7] or "pay" in h_strs[7]:
                is_legacy = True
            elif len(h_strs) > 8 and "amount" in h_strs[8]:
                is_legacy = True

        if is_legacy:
            layout_type = "legacy_orders"
            col_map = {
                "date": 3,
                "person_name": 4,
                "program": 5,
                "type": 6,
                "payment_through": 7,
                "amount": 8,
                "payment_received": 9,
                "number_of_devotees": 10,
                "menu_type": 11,
                "cook_incentive": 12,
                "notes": 13
            }
            start_letter = "D"
            end_letter = "N"
            start_col_idx = 3
            end_col_idx = 13
        elif start_col == 3:
            layout_type = "template_orders"
            col_map = {
                "date": 3,
                "person_name": 4,
                "program": 5,
                "type": 6,
                "number_of_devotees": 7,
                "menu_type": 8,
                "cook_incentive": 9,
                "amount": 10,
                "payment_through": 11,
                "payment_received": 12,
                "notes": 13
            }
            start_letter = "D"
            end_letter = "N"
            start_col_idx = 3
            end_col_idx = 13
        else:
            layout_type = "a1_orders"
            col_map = {
                "date": 0,
                "person_name": 1,
                "program": 2,
                "type": 3,
                "number_of_devotees": 4,
                "menu_type": 5,
                "cook_incentive": 6,
                "amount": 7,
                "payment_through": 8,
                "payment_received": 9,
                "notes": 10
            }
            start_letter = "A"
            end_letter = "K"
            start_col_idx = 0
            end_col_idx = 10

        return {
            "layout_type": layout_type,
            "header_row_idx": header_row_idx,
            "data_start_row": header_row_idx + 1,
            "start_col_idx": start_col_idx,
            "end_col_idx": end_col_idx,
            "start_col_letter": start_letter,
            "end_col_letter": end_letter,
            "col_map": col_map
        }

    @staticmethod
    def _format_order_row_for_layout(layout: Dict[str, Any], data: Dict[str, Any]) -> List[Any]:
        layout_type = layout["layout_type"]
        rec_type = str(data.get("type") or "Order").strip()
        is_order = (rec_type.lower() == "order")

        devs_val = parse_int(data.get("number_of_devotees", 0)) if is_order else 0
        devs_cell = devs_val if (is_order and devs_val > 0) else ""

        inc_val = float(data.get("cook_incentive", 0.0)) if is_order else 0.0
        inc_clean = int(inc_val) if inc_val.is_integer() else round(inc_val, 2)
        inc_cell = inc_clean if (is_order and inc_val > 0) else ""
        menu_type_cell = str(data.get("menu_type") or "") if is_order else ""

        amount_val = parse_num(data.get("amount", 0))
        amt_clean = int(amount_val) if amount_val.is_integer() else round(amount_val, 2)
        amt_cell = amt_clean if amount_val > 0 else ""

        date_cell = normalize_sheet_date(data.get("date"))
        person_cell = str(data.get("person_name") or "")
        program_cell = str(data.get("program") or "")
        paym_cell = str(data.get("payment_through") or "Cash")
        rcvd_cell = str(data.get("payment_received") or "Yes")
        notes_cell = str(data.get("notes") or "").strip()

        if layout_type == "legacy_orders":
            # Original columns: Date, Person, Program, Type, Payment through, Amount, Paymt Rcvd
            # Followed by new columns: Devotees, Menu Type, Order Incentive, Notes
            return [
                date_cell, person_cell, program_cell, rec_type,
                paym_cell, amt_cell, rcvd_cell,
                devs_cell, menu_type_cell, inc_cell, notes_cell
            ]
        elif layout_type == "a1_orders":
            return [
                date_cell, person_cell, program_cell, rec_type,
                devs_cell, menu_type_cell, inc_cell, amt_cell,
                paym_cell, rcvd_cell, notes_cell
            ]
        else: # template_orders
            return [
                date_cell, person_cell, program_cell, rec_type,
                devs_cell, menu_type_cell, inc_cell, amt_cell,
                paym_cell, rcvd_cell, notes_cell
            ]

    def _get_google_records(self, target_tab: str) -> Dict[str, Any]:
        try:
            ws = self.sheet.worksheet(target_tab) if self.sheet else None
            if not ws:
                return {"records": [], "metrics": self._empty_metrics(), "tab": target_tab}

            all_rows = ws.get_all_values()
            records = []

            layout = self._detect_order_layout(all_rows)
            start_row = layout["data_start_row"]
            cmap = layout["col_map"]

            for idx, r in enumerate(all_rows, start=1):
                if idx < start_row:
                    continue
                if idx > 40:
                    break

                # Stop reading when reaching total row or summary row
                if any("total:" in str(cell).strip().lower() for cell in r[:15]):
                    break

                date_val = str(r[cmap["date"]]).strip() if len(r) > cmap["date"] else ""
                person_name = str(r[cmap["person_name"]]).strip() if len(r) > cmap["person_name"] else ""
                program = str(r[cmap["program"]]).strip() if len(r) > cmap["program"] else ""
                type_val = str(r[cmap["type"]]).strip() if len(r) > cmap["type"] else "Order"
                devotees_val = parse_int(r[cmap["number_of_devotees"]]) if len(r) > cmap["number_of_devotees"] else 0
                menu_val = str(r[cmap["menu_type"]]).strip() if len(r) > cmap["menu_type"] else ""
                incentive_val = parse_num(r[cmap["cook_incentive"]]) if len(r) > cmap["cook_incentive"] else 0.0
                amount_val = parse_num(r[cmap["amount"]]) if len(r) > cmap["amount"] else 0.0
                payment_through = str(r[cmap["payment_through"]]).strip() if len(r) > cmap["payment_through"] else "Cash"
                paymt_rcvd = str(r[cmap["payment_received"]]).strip() if len(r) > cmap["payment_received"] else "Yes"
                notes_val = str(r[cmap["notes"]]).strip() if len(r) > cmap["notes"] else ""

                is_order = (type_val.strip().lower() == "order")
                if not is_order:
                    # Profit calculation and incentives are strictly applicable to type "Order" only
                    incentive_val = 0.0
                    devotees_val = 0
                    menu_val = ""
                elif incentive_val == 0.0 and devotees_val > 0 and menu_val:
                    incentive_val = calculate_cook_incentive(devotees_val, menu_val)

                if person_name or date_val or amount_val > 0:
                    tab_slug = re.sub(r"[^a-zA-Z0-9]", "_", target_tab)
                    records.append({
                        "id": f"{tab_slug}_R{idx}",
                        "row_number": idx,
                        "date": date_val,
                        "person_name": person_name,
                        "program": program,
                        "type": type_val or "Order",
                        "payment_through": payment_through or "Cash",
                        "amount": amount_val,
                        "payment_received": paymt_rcvd or "Yes",
                        "notes": notes_val,
                        "number_of_devotees": devotees_val,
                        "menu_type": menu_val,
                        "cook_incentive": incentive_val,
                        "tab": target_tab
                    })

            metrics = self._calculate_metrics(records, all_rows)
            return {"records": records, "metrics": metrics, "tab": target_tab, "total_records": len(records)}

        except Exception as e:
            print(f"[SheetService] Error reading Google Sheet tab '{target_tab}': {e}")
            return {"records": [], "metrics": self._empty_metrics(), "tab": target_tab, "error": str(e)}

    def _calculate_metrics(self, records: List[Dict[str, Any]], all_rows: Optional[List[List[str]]] = None) -> Dict[str, Any]:
        total_collections = sum(r["amount"] for r in records)
        total_orders = sum(r["amount"] for r in records if r["type"].strip().lower() == "order")
        total_sponsors = sum(r["amount"] for r in records if r["type"].strip().lower() == "sponsor")
        total_coupons = sum(r["amount"] for r in records if "coupon" in r["type"].strip().lower())
        total_other_types = total_collections - (total_orders + total_sponsors + total_coupons)

        total_cash = sum(r["amount"] for r in records if "cash" in r["payment_through"].lower())
        total_gpay = sum(r["amount"] for r in records if "gpay" in r["payment_through"].lower())
        total_bank = sum(r["amount"] for r in records if any(k in r["payment_through"].lower() for k in ["bank", "transfer", "neft", "cheque"]))
        total_other_payment = total_collections - (total_cash + total_gpay + total_bank)

        count_received = sum(1 for r in records if r["payment_received"].strip().lower() in ["yes", "y", "done", "paid"])
        count_pending = len(records) - count_received
        amt_received = sum(r["amount"] for r in records if r["payment_received"].strip().lower() in ["yes", "y", "done", "paid"])
        amt_pending = total_collections - amt_received

        # Cook Incentive Summary (from Section 3 Policy Matrix - Order type only)
        total_incentive = sum(r.get("cook_incentive", 0.0) for r in records if r.get("type", "").strip().lower() == "order")

        # Bifurcation: By Program / Event
        programs_bifurcation: Dict[str, float] = {}
        for r in records:
            prog = r.get("program", "").strip() or "General Program"
            programs_bifurcation[prog] = programs_bifurcation.get(prog, 0.0) + r["amount"]

        # Bifurcation: By Menu Type
        menu_bifurcation: Dict[str, float] = {}
        for r in records:
            menu = r.get("menu_type", "").strip() or "Standard / Custom"
            menu_bifurcation[menu] = menu_bifurcation.get(menu, 0.0) + r["amount"]

        # Vendor Total & Net Debit/Credit Difference from Sheet
        vendor_total = 0.0
        net_difference = total_collections
        if all_rows and len(all_rows) >= 16:
            try:
                if len(all_rows[15]) > 1:
                    vendor_total = parse_num(all_rows[15][1])
                if len(all_rows) >= 33 and len(all_rows[32]) > 1:
                    net_diff_val = parse_num(all_rows[32][1])
                    if net_diff_val:
                        net_difference = net_diff_val
                    else:
                        net_difference = total_collections - vendor_total
                else:
                    net_difference = total_collections - vendor_total
            except Exception:
                pass

        return {
            "total_collections": total_collections,
            "total_orders": total_orders,
            "total_sponsors": total_sponsors,
            "total_coupons": total_coupons,
            "total_cash": total_cash,
            "total_gpay": total_gpay,
            "total_bank": total_bank,
            "count_records": len(records),
            "count_received": count_received,
            "count_pending": count_pending,
            "amt_received": amt_received,
            "amt_pending": amt_pending,
            "total_cook_incentive": total_incentive,
            "vendor_expenses": vendor_total,
            "net_difference": net_difference,
            "bifurcation_type": {
                "Orders": total_orders,
                "Sponsorships": total_sponsors,
                "Coupons": total_coupons,
                "Other": max(total_other_types, 0.0)
            },
            "bifurcation_payment": {
                "Cash": total_cash,
                "GPay": total_gpay,
                "Bank / Cheque": total_bank,
                "Other": max(total_other_payment, 0.0)
            },
            "bifurcation_status": {
                "Paid": amt_received,
                "Pending": amt_pending
            },
            "bifurcation_program": programs_bifurcation,
            "bifurcation_menu": menu_bifurcation
        }

    def _empty_metrics(self) -> Dict[str, Any]:
        return {
            "total_collections": 0.0,
            "total_orders": 0.0,
            "total_sponsors": 0.0,
            "total_coupons": 0.0,
            "total_cash": 0.0,
            "total_gpay": 0.0,
            "total_bank": 0.0,
            "count_records": 0,
            "count_received": 0,
            "count_pending": 0,
            "amt_received": 0.0,
            "amt_pending": 0.0,
            "total_cook_incentive": 0.0,
            "vendor_expenses": 0.0,
            "net_difference": 0.0,
            "bifurcation_type": {},
            "bifurcation_payment": {},
            "bifurcation_status": {},
            "bifurcation_program": {},
            "bifurcation_menu": {}
        }

    # -------------------------------------------------------------------------
    # Vendor Management (Rows 3 to 15 in Columns A & B)
    # -------------------------------------------------------------------------
    # -------------------------------------------------------------------------
    # Vendor Management (Rows 3 to 15 in Columns A & B, Bills in Columns P to T)
    # -------------------------------------------------------------------------
    def get_vendor_records(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        target_tab = (tab_name or self.current_tab_name).strip()
        vendors = []
        net_diff = 0.0
        sheet_vendor_rows = []
        sheet_bills = []

        if self.mode == "google_sheets" and self.sheet:
            try:
                ws = self.sheet.worksheet(target_tab)
                all_vals = ws.get_all_values()

                # 1. Vendor summary in A3:B15
                for idx in range(2, min(15, len(all_vals))):
                    r = all_vals[idx]
                    v_name = r[0].strip() if len(r) > 0 else ""
                    v_amt = parse_num(r[1]) if len(r) > 1 else 0.0
                    row_num = idx + 1
                    if v_name or v_amt > 0:
                        sheet_vendor_rows.append((row_num, v_name, v_amt))

                # Net difference
                if len(all_vals) >= 33 and len(all_vals[32]) > 1:
                    net_diff = parse_num(all_vals[32][1])

                # 2. Dedicated Vendor Bills Section in Columns P to T (Rows 3+)
                for idx, r in enumerate(all_vals, start=1):
                    if idx < 3:
                        continue
                    if len(r) > 16:
                        b_date = r[15].strip() if len(r) > 15 else ""
                        b_vendor = r[16].strip() if len(r) > 16 else ""
                        b_notes = r[17].strip() if len(r) > 17 else ""
                        b_amt = parse_num(r[18]) if len(r) > 18 else 0.0
                        b_id = r[19].strip() if len(r) > 19 and r[19].strip() else f"vbill_{target_tab}_R{idx}"

                        if b_vendor or b_amt > 0:
                            sheet_bills.append({
                                "id": b_id,
                                "vendor_name": b_vendor,
                                "amount": b_amt,
                                "date": b_date,
                                "notes": b_notes,
                                "row_number": idx,
                                "tab": target_tab
                            })
            except Exception as e:
                print(f"[SheetService] Error fetching vendors from sheet: {e}")

        else:
            self._ensure_excel_file()
            if OPENPYXL_AVAILABLE and os.path.exists(EXCEL_FILE_PATH):
                wb = openpyxl.load_workbook(EXCEL_FILE_PATH, data_only=True)
                ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active
                for r_idx in range(3, 16):
                    v_name = str(ws.cell(row=r_idx, column=1).value or "").strip()
                    v_amt = parse_num(ws.cell(row=r_idx, column=2).value)
                    if v_name or v_amt > 0:
                        sheet_vendor_rows.append((r_idx, v_name, v_amt))

                for r_idx in range(3, ws.max_row + 1):
                    b_date = str(ws.cell(row=r_idx, column=16).value or "").strip()
                    b_vendor = str(ws.cell(row=r_idx, column=17).value or "").strip()
                    b_notes = str(ws.cell(row=r_idx, column=18).value or "").strip()
                    b_amt = parse_num(ws.cell(row=r_idx, column=19).value)
                    b_id = str(ws.cell(row=r_idx, column=20).value or "").strip() or f"vbill_{target_tab}_R{r_idx}"

                    if b_vendor or b_amt > 0:
                        sheet_bills.append({
                            "id": b_id,
                            "vendor_name": b_vendor,
                            "amount": b_amt,
                            "date": b_date,
                            "notes": b_notes,
                            "row_number": r_idx,
                            "tab": target_tab
                        })

        # Merge vendors from sheet and master list
        all_known_names = set(self.vendor_master)
        seen_vendors = set()

        for (r_num, v_name, v_amt) in sheet_vendor_rows:
            if v_name:
                all_known_names.add(v_name)
                seen_vendors.add(v_name.lower())
                v_entries = [e for e in sheet_bills if e.get("vendor_name", "").strip().lower() == v_name.lower()]
                if v_entries:
                    computed_amt = sum(e["amount"] for e in v_entries)
                else:
                    computed_amt = v_amt

                vendors.append({
                    "row_number": r_num,
                    "name": v_name,
                    "vendor_name": v_name,
                    "amount": computed_amt,
                    "bill_count": len(v_entries),
                    "entries": v_entries,
                    "tab": target_tab
                })

        # Include any vendor from bills that might not yet be in sheet_vendor_rows
        for e in sheet_bills:
            vn = e.get("vendor_name", "").strip()
            if vn and vn.lower() not in seen_vendors:
                all_known_names.add(vn)
                seen_vendors.add(vn.lower())
                v_entries = [b for b in sheet_bills if b.get("vendor_name", "").strip().lower() == vn.lower()]
                computed_amt = sum(b["amount"] for b in v_entries)
                vendors.append({
                    "row_number": len(vendors) + 3,
                    "name": vn,
                    "vendor_name": vn,
                    "amount": computed_amt,
                    "bill_count": len(v_entries),
                    "entries": v_entries,
                    "tab": target_tab
                })

        available_vendors = sorted(list(all_known_names))
        vendor_total = sum(v["amount"] for v in vendors)

        # Month collections & net debit/credit difference
        month_data = self.get_month_records(target_tab)
        tot_collections = month_data.get("metrics", {}).get("total_collections", 0.0)
        net_diff = tot_collections - vendor_total

        return {
            "tab": target_tab,
            "vendors": vendors,
            "available_vendors": available_vendors,
            "all_entries": sheet_bills,
            "total_vendor_expenses": vendor_total,
            "total_collections": tot_collections,
            "net_difference": net_diff,
            "vendor_count": len(vendors),
            "total_entries_count": len(sheet_bills)
        }

    def _sync_vendor_total_to_sheet(self, vendor_name: str, total_amount: float, target_tab: str):
        """Syncs the computed total for a vendor directly to Columns A & B in Google Sheets/Excel as a true numeric value."""
        v_name = vendor_name.strip()
        amt_clean = int(total_amount) if float(total_amount).is_integer() else round(float(total_amount), 2)
        sheet_val = amt_clean if total_amount > 0 else ""

        if self.mode == "google_sheets" and self.sheet:
            try:
                ws = self.sheet.worksheet(target_tab)
                vals = ws.get_values("A3:B15")
                target_row = None
                empty_row = None

                for idx in range(13):
                    row_name = vals[idx][0].strip() if idx < len(vals) and vals[idx] else ""
                    if row_name.lower() == v_name.lower():
                        target_row = idx + 3
                        break
                    elif not row_name and empty_row is None:
                        empty_row = idx + 3

                row_to_write = target_row if target_row else (empty_row if empty_row else 15)
                ws.update(range_name=f"A{row_to_write}:B{row_to_write}", values=[[v_name, sheet_val]], value_input_option="USER_ENTERED")
            except Exception as e:
                print(f"[SheetService] Error syncing vendor to sheet: {e}")

        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active
            target_row = None
            empty_row = None
            for r in range(3, 16):
                row_name = str(ws.cell(row=r, column=1).value or "").strip()
                if row_name.lower() == v_name.lower():
                    target_row = r
                    break
                elif not row_name and empty_row is None:
                    empty_row = r

            row_to_write = target_row if target_row else (empty_row if empty_row else 15)
            ws.cell(row=row_to_write, column=1, value=v_name)
            ws.cell(row=row_to_write, column=2, value=amt_clean if total_amount > 0 else "")
            wb.save(EXCEL_FILE_PATH)

    def add_vendor_entry(self, vendor_name: str, amount: float, date: Optional[str] = None, notes: Optional[str] = None, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Adds a bill entry for a vendor directly to Columns P:T in Google Sheets/Excel, recalculates total, and syncs to Columns A & B."""
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)
        v_name = vendor_name.strip()
        amt_clean = int(amount) if float(amount).is_integer() else round(float(amount), 2)
        d_val = date.strip() if date else datetime.now().strftime("%d/%m/%Y")
        if "-" in d_val and len(d_val.split("-")) == 3:
            parts = d_val.split("-")
            if len(parts[0]) == 4:
                d_val = f"{parts[2]}/{parts[1]}/{parts[0]}"

        # Ensure vendor is in master list
        if not any(v.lower() == v_name.lower() for v in self.vendor_master):
            self.vendor_master.append(v_name)
            self._save_vendor_master()

        entry_id = f"vbill_{int(time.time() * 1000)}"
        entry = {
            "id": entry_id,
            "vendor_name": v_name,
            "amount": float(amount),
            "date": d_val,
            "notes": (notes or "").strip(),
            "tab": target_tab
        }

        if self.mode == "google_sheets" and self.sheet:
            ws = self.sheet.worksheet(target_tab)
            all_vals = ws.get_all_values()

            target_row = None
            for idx in range(2, len(all_vals)):
                r = all_vals[idx]
                p_val = r[15].strip() if len(r) > 15 else ""
                q_val = r[16].strip() if len(r) > 16 else ""
                s_val = r[18].strip() if len(r) > 18 else ""
                if not p_val and not q_val and not s_val:
                    target_row = idx + 1
                    break
            if not target_row:
                target_row = max(len(all_vals) + 1, 3)

            ws.update(
                range_name=f"P{target_row}:T{target_row}",
                values=[[d_val, v_name, notes or "", amt_clean, entry_id]],
                value_input_option="USER_ENTERED"
            )

            # Recalculate total for this vendor from all bills in sheet
            existing_total = 0.0
            for idx in range(2, len(all_vals)):
                r = all_vals[idx]
                if len(r) > 16 and r[16].strip().lower() == v_name.lower():
                    existing_total += parse_num(r[18]) if len(r) > 18 else 0.0
            vendor_total = existing_total + float(amount)
            self._sync_vendor_total_to_sheet(v_name, vendor_total, target_tab)

        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active

            target_row = None
            for r in range(3, ws.max_row + 2):
                p_val = str(ws.cell(row=r, column=16).value or "").strip()
                q_val = str(ws.cell(row=r, column=17).value or "").strip()
                s_val = str(ws.cell(row=r, column=19).value or "").strip()
                if not p_val and not q_val and not s_val:
                    target_row = r
                    break
            if not target_row:
                target_row = max(ws.max_row + 1, 3)

            ws.cell(row=target_row, column=16, value=d_val)
            ws.cell(row=target_row, column=17, value=v_name)
            ws.cell(row=target_row, column=18, value=notes or "")
            ws.cell(row=target_row, column=19, value=amt_clean)
            ws.cell(row=target_row, column=20, value=entry_id)
            wb.save(EXCEL_FILE_PATH)

            vendor_total = 0.0
            for r in range(3, ws.max_row + 1):
                if str(ws.cell(row=r, column=17).value or "").strip().lower() == v_name.lower():
                    vendor_total += parse_num(ws.cell(row=r, column=19).value)
            self._sync_vendor_total_to_sheet(v_name, vendor_total, target_tab)

        return {
            "entry": entry,
            "vendor_name": v_name,
            "vendor_total": vendor_total,
            "tab": target_tab
        }

    def delete_vendor_entry(self, entry_id: str, tab_name: Optional[str] = None) -> bool:
        """Deletes a vendor bill entry from Columns P:T, recalculates the vendor total, and syncs to Columns A & B."""
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        if self.mode == "google_sheets" and self.sheet:
            ws = self.sheet.worksheet(target_tab)
            all_vals = ws.get_all_values()

            target_row = None
            v_name = None
            for idx in range(2, len(all_vals)):
                r = all_vals[idx]
                row_entry_id = r[19].strip() if len(r) > 19 else ""
                if row_entry_id == entry_id:
                    target_row = idx + 1
                    v_name = r[16].strip() if len(r) > 16 else ""
                    break

            if not target_row:
                return False

            ws.batch_clear([f"P{target_row}:T{target_row}"])

            new_total = 0.0
            if v_name:
                for idx in range(2, len(all_vals)):
                    if idx + 1 == target_row:
                        continue
                    r = all_vals[idx]
                    if len(r) > 16 and r[16].strip().lower() == v_name.lower():
                        new_total += parse_num(r[18]) if len(r) > 18 else 0.0
                self._sync_vendor_total_to_sheet(v_name, new_total, target_tab)
            return True

        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active

            target_row = None
            v_name = None
            for r in range(3, ws.max_row + 1):
                row_entry_id = str(ws.cell(row=r, column=20).value or "").strip()
                if row_entry_id == entry_id:
                    target_row = r
                    v_name = str(ws.cell(row=r, column=17).value or "").strip()
                    break

            if not target_row:
                return False

            for c in range(16, 21):
                ws.cell(row=target_row, column=c, value="")
            wb.save(EXCEL_FILE_PATH)

            new_total = 0.0
            if v_name:
                for r in range(3, ws.max_row + 1):
                    if str(ws.cell(row=r, column=17).value or "").strip().lower() == v_name.lower():
                        new_total += parse_num(ws.cell(row=r, column=19).value)
                self._sync_vendor_total_to_sheet(v_name, new_total, target_tab)
            return True

    def register_vendor(self, vendor_name: str, initial_amount: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """Registers a new vendor name and adds them to available vendors and sheet."""
        target_tab = (tab_name or self.current_tab_name).strip()
        v_name = vendor_name.strip()
        if not any(v.lower() == v_name.lower() for v in self.vendor_master):
            self.vendor_master.append(v_name)
            self._save_vendor_master()

        if initial_amount > 0:
            return self.add_vendor_entry(v_name, initial_amount, notes="Initial Bill Entry", tab_name=target_tab)

        self._sync_vendor_total_to_sheet(v_name, 0.0, target_tab)
        return {"vendor_name": v_name, "amount": 0.0, "tab": target_tab}

    def update_vendor_record(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        amt_clean = int(amount) if float(amount).is_integer() else round(float(amount), 2)
        sheet_val = amt_clean if amount > 0 else ""

        if self.mode == "google_sheets" and self.sheet:
            ws = self.sheet.worksheet(target_tab)
            # Pass sheet_val as numeric (int/float) with USER_ENTERED so Google Sheets stores it as a number, NOT text '3400
            ws.update(range_name=f"A{row_number}:B{row_number}", values=[[vendor_name.strip(), sheet_val]], value_input_option="USER_ENTERED")
        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active
            ws.cell(row=row_number, column=1, value=vendor_name.strip())
            ws.cell(row=row_number, column=2, value=sheet_val)
            wb.save(EXCEL_FILE_PATH)

        return {
            "row_number": row_number,
            "vendor_name": vendor_name.strip(),
            "amount": float(amount),
            "tab": target_tab
        }

    def add_vendor_record(self, vendor_name: str, amount: float, tab_name: Optional[str] = None) -> Dict[str, Any]:
        return self.add_vendor_entry(vendor_name, amount, tab_name=tab_name)

    def delete_vendor_record(self, row_number: int, tab_name: Optional[str] = None) -> bool:
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        if self.mode == "google_sheets" and self.sheet:
            ws = self.sheet.worksheet(target_tab)
            ws.batch_clear([f"A{row_number}:B{row_number}"])
            return True
        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            ws = wb[target_tab] if target_tab in wb.sheetnames else wb.active
            ws.cell(row=row_number, column=1, value="")
            ws.cell(row=row_number, column=2, value="")
            wb.save(EXCEL_FILE_PATH)
            return True

    # -------------------------------------------------------------------------
    # Cook Management & Payroll Engine (Section 3 Policy Matrix - Direct Profit)
    # -------------------------------------------------------------------------
    def get_cook_records(self, tab_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Calculates cook payroll based on devotees and menu type from Policy Section 3 Matrix.
        Corresponding matrix profit is added directly to each person (no percentage reduction).
        """
        target_tab = (tab_name or self.current_tab_name).strip()
        month_data = self.get_month_records(target_tab)
        tot_incentive = month_data.get("metrics", {}).get("total_cook_incentive", 0.0)

        cook_list = []
        total_payroll = 0.0

        for c in self.cooks:
            base_salary = float(c.get("base_salary", 18000.0))
            festival_allowance = float(c.get("festival_allowance", 1000.0))
            yearly_bonus = float(c.get("yearly_bonus", 0.0))

            # Profit sharing based on number of devotees and menu type (Section 3 Policy Matrix)
            # The corresponding profit is added directly to each person
            matrix_profit = round(tot_incentive, 2)
            total_payout = round(base_salary + matrix_profit + festival_allowance + yearly_bonus, 2)
            total_payroll += total_payout

            cook_list.append({
                "id": c.get("id"),
                "name": c.get("name"),
                "base_salary": base_salary,
                "role": c.get("role", "Cook"),
                "matrix_share": matrix_profit,
                "festival_allowance": festival_allowance,
                "yearly_bonus": yearly_bonus,
                "total_payout": total_payout
            })

        return {
            "tab": target_tab,
            "total_cook_incentive": tot_incentive,
            "total_payroll": total_payroll,
            "cooks": cook_list,
            "cook_count": len(cook_list)
        }

    def select_tab(self, tab_name: str) -> bool:
        tab_name = tab_name.strip()
        if self.mode == "google_sheets" and self.sheet:
            try:
                ws = self.sheet.worksheet(tab_name)
                self.worksheet = ws
                self.current_tab_name = tab_name
                # Ensure the cook payroll for this newly selected tab is synchronized
                self._sync_cooks_to_sheet(tab_name)
                return True
            except Exception as e:
                print(f"[SheetService] Error selecting tab '{tab_name}': {e}")
                return False
        else:
            self.current_tab_name = tab_name
            self._sync_cooks_to_sheet(tab_name)
            return True

    def _sync_cooks_to_sheet(self, tab_name: Optional[str] = None) -> bool:
        """
        Synchronizes self.cooks (base salaries, incentives formula, festival allowances,
        bonuses, and total formula) directly into the Google Sheets worksheet for the target tab,
        the currently active tab, Jan 27, Master_Template, April 26, as well as database.xlsx.
        """
        target_tab = (tab_name or self.current_tab_name).strip()

        # 1. Sync to Google Sheets if connected
        if self.mode == "google_sheets" and self.sheet:
            tabs_to_sync = [target_tab]
            for tab_cand in [self.current_tab_name, "Master_Template", "Jan 27", "April 26"]:
                if tab_cand and tab_cand not in tabs_to_sync and tab_cand in self.available_tabs:
                    tabs_to_sync.append(tab_cand)

            for tab in tabs_to_sync:
                try:
                    ws = self.sheet.worksheet(tab)
                    col1 = ws.col_values(1)
                    header_row = None
                    for idx, val in enumerate(col1, start=1):
                        if "staff / cook name" in str(val).strip().lower():
                            header_row = idx
                            break

                    if not header_row:
                        if tab in ["Master_Template", "Jan 27"]:
                            header_row = 43
                        elif tab == "April 26":
                            header_row = 44
                        else:
                            continue

                    # Transaction end row for Order Incentive formula
                    tx_end = header_row - 3
                    inc_formula = f"=SUM(J3:J{tx_end})"

                    first_cook_row = header_row + 1
                    rows_to_write = []

                    for idx, c in enumerate(self.cooks):
                        r_num = first_cook_row + idx
                        b_sal = float(c.get("base_salary", 18000))
                        base_val = int(b_sal) if b_sal.is_integer() else round(b_sal, 2)

                        f_allow = float(c.get("festival_allowance", 0))
                        fest_val = int(f_allow) if f_allow.is_integer() else round(f_allow, 2)

                        y_bon = float(c.get("yearly_bonus", 0))
                        bonus_val = int(y_bon) if y_bon.is_integer() else round(y_bon, 2)

                        rows_to_write.append([
                            c.get("name", "").strip(),
                            c.get("role", "Cook").strip(),
                            base_val,
                            inc_formula,
                            fest_val,
                            bonus_val,
                            f"=C{r_num}+D{r_num}+E{r_num}+F{r_num}"
                        ])

                    last_cook_row = first_cook_row + len(self.cooks) - 1
                    summary_row = last_cook_row + 1

                    summary_vals = [
                        "Total Kitchen Payroll:",
                        "",
                        f"=SUM(C{first_cook_row}:C{last_cook_row})",
                        f"=SUM(D{first_cook_row}:D{last_cook_row})",
                        f"=SUM(E{first_cook_row}:E{last_cook_row})",
                        f"=SUM(F{first_cook_row}:F{last_cook_row})",
                        f"=SUM(G{first_cook_row}:G{last_cook_row})"
                    ]
                    rows_to_write.append(summary_vals)

                    # Update rows in Google Sheet
                    update_range = f"A{first_cook_row}:G{summary_row}"
                    ws.update(range_name=update_range, values=rows_to_write, value_input_option="USER_ENTERED")

                    # Clear trailing rows
                    clear_range = f"A{summary_row + 1}:G{summary_row + 8}"
                    ws.batch_clear([clear_range])

                    self.invalidate_cache(tab)
                except Exception as e:
                    print(f"[SheetService] Warning: Failed to sync cooks to Google Sheet tab '{tab}': {e}")

        # 2. Sync to local database.xlsx
        if OPENPYXL_AVAILABLE and os.path.exists(EXCEL_FILE_PATH):
            try:
                wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
                xl_tabs = [target_tab]
                for xcand in [self.current_tab_name, "Master_Template", "Jan 27", "April 26"]:
                    if xcand and xcand in wb.sheetnames and xcand not in xl_tabs:
                        xl_tabs.append(xcand)

                for xtab in xl_tabs:
                    if xtab not in wb.sheetnames:
                        if xtab == target_tab and wb.active:
                            xws = wb.active
                        else:
                            continue
                    else:
                        xws = wb[xtab]

                    header_row = None
                    for r in range(1, 70):
                        val = str(xws.cell(row=r, column=1).value or "").strip().lower()
                        if "staff / cook name" in val:
                            header_row = r
                            break
                    if not header_row:
                        header_row = 43

                    tx_end = header_row - 3
                    inc_formula = f"=SUM(J3:J{tx_end})"
                    first_cook_row = header_row + 1

                    for idx, c in enumerate(self.cooks):
                        r_num = first_cook_row + idx
                        b_sal = float(c.get("base_salary", 18000))
                        base_val = int(b_sal) if b_sal.is_integer() else round(b_sal, 2)

                        f_allow = float(c.get("festival_allowance", 0))
                        fest_val = int(f_allow) if f_allow.is_integer() else round(f_allow, 2)

                        y_bon = float(c.get("yearly_bonus", 0))
                        bonus_val = int(y_bon) if y_bon.is_integer() else round(y_bon, 2)

                        xws.cell(row=r_num, column=1, value=c.get("name", "").strip())
                        xws.cell(row=r_num, column=2, value=c.get("role", "Cook").strip())
                        xws.cell(row=r_num, column=3, value=base_val)
                        xws.cell(row=r_num, column=4, value=inc_formula)
                        xws.cell(row=r_num, column=5, value=fest_val)
                        xws.cell(row=r_num, column=6, value=bonus_val)
                        xws.cell(row=r_num, column=7, value=f"=C{r_num}+D{r_num}+E{r_num}+F{r_num}")

                    last_cook_row = first_cook_row + len(self.cooks) - 1
                    summary_row = last_cook_row + 1

                    xws.cell(row=summary_row, column=1, value="Total Kitchen Payroll:")
                    xws.cell(row=summary_row, column=2, value="")
                    xws.cell(row=summary_row, column=3, value=f"=SUM(C{first_cook_row}:C{last_cook_row})")
                    xws.cell(row=summary_row, column=4, value=f"=SUM(D{first_cook_row}:D{last_cook_row})")
                    xws.cell(row=summary_row, column=5, value=f"=SUM(E{first_cook_row}:E{last_cook_row})")
                    xws.cell(row=summary_row, column=6, value=f"=SUM(F{first_cook_row}:F{last_cook_row})")
                    xws.cell(row=summary_row, column=7, value=f"=SUM(G{first_cook_row}:G{last_cook_row})")

                    for clr_r in range(summary_row + 1, summary_row + 9):
                        for clr_c in range(1, 8):
                            xws.cell(row=clr_r, column=clr_c, value="")

                wb.save(EXCEL_FILE_PATH)
            except Exception as e:
                print(f"[SheetService] Warning: Failed to sync cooks to Excel: {e}")

        return True

    def add_cook(self, name: str, base_salary: float, role: Optional[str] = "Cook", festival_allowance: float = 1000.0, yearly_bonus: float = 0.0, tab_name: Optional[str] = None) -> Dict[str, Any]:
        new_id = f"cook-{len(self.cooks) + 1}"
        new_cook = {
            "id": new_id,
            "name": name.strip(),
            "base_salary": float(base_salary),
            "role": role.strip() if role else "Cook",
            "festival_allowance": float(festival_allowance),
            "yearly_bonus": float(yearly_bonus)
        }
        self.cooks.append(new_cook)
        self._save_cooks_config()
        self._sync_cooks_to_sheet(tab_name)
        return new_cook

    def update_cook(self, cook_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target_cook = None
        for c in self.cooks:
            if c["id"] == cook_id:
                target_cook = c
                break

        if not target_cook:
            return None

        if "name" in updates and updates["name"]:
            target_cook["name"] = str(updates["name"]).strip()
        if "base_salary" in updates and updates["base_salary"] is not None:
            target_cook["base_salary"] = float(updates["base_salary"])
        if "festival_allowance" in updates and updates["festival_allowance"] is not None:
            target_cook["festival_allowance"] = float(updates["festival_allowance"])
        if "yearly_bonus" in updates and updates["yearly_bonus"] is not None:
            target_cook["yearly_bonus"] = float(updates["yearly_bonus"])
        if "role" in updates and updates["role"] is not None:
            target_cook["role"] = str(updates["role"]).strip()

        self._save_cooks_config()
        self._sync_cooks_to_sheet(tab_name)
        return target_cook

    def delete_cook(self, cook_id: str, tab_name: Optional[str] = None) -> bool:
        initial_len = len(self.cooks)
        self.cooks = [c for c in self.cooks if c["id"] != cook_id]
        if len(self.cooks) == initial_len:
            return False
        self._save_cooks_config()
        self._sync_cooks_to_sheet(tab_name)
        return True

    # -------------------------------------------------------------------------
    # Batch Adding a Record (Orders & Sponsors)
    # -------------------------------------------------------------------------
    def add_record(self, data: Dict[str, Any], tab_name: Optional[str] = None) -> Dict[str, Any]:
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        rec_type = str(data.get("type") or "Order").strip()
        is_order = (rec_type.lower() == "order")

        devotees = parse_int(data.get("number_of_devotees", 0)) if is_order else 0
        menu_type = str(data.get("menu_type") or "").strip() if is_order else ""

        # Compute cook incentive from Policy Section 3 Matrix (strictly for Order type only)
        incentive = 0.0
        if is_order and devotees > 0 and menu_type:
            incentive = calculate_cook_incentive(devotees, menu_type)

        data["type"] = rec_type
        data["number_of_devotees"] = devotees
        data["menu_type"] = menu_type
        data["cook_incentive"] = incentive

        if self.mode == "google_sheets":
            return self._add_google_record(data, target_tab)
        return self._add_excel_record(data, target_tab)

    def _add_google_record(self, data: Dict[str, Any], target_tab: str) -> Dict[str, Any]:
        ws = self.sheet.worksheet(target_tab)
        all_rows = ws.get_all_values()
        layout = self._detect_order_layout(all_rows)
        cmap = layout["col_map"]
        start_letter = layout["start_col_letter"]
        end_letter = layout["end_col_letter"]
        h_row = layout["header_row_idx"]
        layout_type = layout["layout_type"]

        # Ensure header row has new columns labeled if not already present
        if layout_type == "legacy_orders":
            h_cells = all_rows[h_row - 1] if len(all_rows) >= h_row else []
            if len(h_cells) < 14 or not str(h_cells[10]).strip():
                try:
                    ws.update(range_name=f"K{h_row}:N{h_row}", values=[["No. of Devotees", "Menu Type", "Order Incentive", "Notes"]], value_input_option="USER_ENTERED")
                except Exception:
                    pass
        elif layout_type == "template_orders":
            h_cells = all_rows[h_row - 1] if len(all_rows) >= h_row else []
            if len(h_cells) < 14 or not str(h_cells[13]).strip():
                try:
                    ws.update(range_name=f"N{h_row}", values=[["Notes"]], value_input_option="USER_ENTERED")
                except Exception:
                    pass

        # Scan transaction rows
        start_row = layout["data_start_row"]
        last_rec_row = h_row
        total_row = 41

        for idx in range(start_row, min(41, len(all_rows) + 1)):
            r = all_rows[idx - 1] if idx - 1 < len(all_rows) else []
            if any("total:" in str(cell).strip().lower() for cell in r[:15]):
                total_row = idx
                break

            p_name = r[cmap["person_name"]].strip() if len(r) > cmap["person_name"] else ""
            d_val = r[cmap["date"]].strip() if len(r) > cmap["date"] else ""
            amt_val = parse_num(r[cmap["amount"]]) if len(r) > cmap["amount"] else 0.0
            if p_name or d_val or amt_val > 0:
                last_rec_row = idx

        target_row = last_rec_row + 1

        if target_row >= total_row:
            ws.insert_rows([[""] * 15], row=total_row)
            target_row = total_row

        row_vals = self._format_order_row_for_layout(layout, data)
        range_name = f"{start_letter}{target_row}:{end_letter}{target_row}"
        ws.update(range_name=range_name, values=[row_vals], value_input_option="USER_ENTERED")

        tab_slug = re.sub(r"[^a-zA-Z0-9]", "_", target_tab)
        return {
            "id": f"{tab_slug}_R{target_row}",
            "row_number": target_row,
            "date": normalize_sheet_date(data.get("date")),
            "person_name": str(data.get("person_name") or ""),
            "program": str(data.get("program") or ""),
            "type": str(data.get("type") or "Order"),
            "number_of_devotees": parse_int(data.get("number_of_devotees", 0)),
            "menu_type": str(data.get("menu_type") or ""),
            "cook_incentive": float(data.get("cook_incentive", 0.0)),
            "amount": parse_num(data.get("amount", 0)),
            "payment_through": str(data.get("payment_through") or "Cash"),
            "payment_received": str(data.get("payment_received") or "Yes"),
            "notes": str(data.get("notes") or ""),
            "tab": target_tab
        }

    # -------------------------------------------------------------------------
    # Updating a Record
    # -------------------------------------------------------------------------
    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        if self.mode == "google_sheets":
            return self._update_google_record(record_id, updates, target_tab)
        return self._update_excel_record(record_id, updates, target_tab)

    def _update_google_record(self, record_id: str, updates: Dict[str, Any], target_tab: str) -> Optional[Dict[str, Any]]:
        ws = self.sheet.worksheet(target_tab)
        m = re.search(r"_R(\d+)$", record_id)
        if not m:
            return None
        row_idx = int(m.group(1))

        all_rows = ws.get_all_values()
        layout = self._detect_order_layout(all_rows)
        cmap = layout["col_map"]
        start_letter = layout["start_col_letter"]
        end_letter = layout["end_col_letter"]
        start_idx = layout["start_col_idx"]

        current_vals = ws.get_values(f"{start_letter}{row_idx}:{end_letter}{row_idx}")
        current_row = current_vals[0] if current_vals and current_vals[0] else [""] * 11
        while len(current_row) < 11:
            current_row.append("")

        def get_curr(col_key: str, default: str = "") -> str:
            c = cmap[col_key] - start_idx
            return current_row[c] if c < len(current_row) else default

        merged_data = {
            "date": updates["date"] if "date" in updates and updates["date"] is not None else get_curr("date"),
            "person_name": updates["person_name"] if "person_name" in updates and updates["person_name"] is not None else get_curr("person_name"),
            "program": updates["program"] if "program" in updates and updates["program"] is not None else get_curr("program"),
            "type": updates["type"] if "type" in updates and updates["type"] is not None else get_curr("type", "Order"),
            "payment_through": updates["payment_through"] if "payment_through" in updates and updates["payment_through"] is not None else get_curr("payment_through", "Cash"),
            "payment_received": updates["payment_received"] if "payment_received" in updates and updates["payment_received"] is not None else get_curr("payment_received", "Yes"),
            "notes": updates["notes"] if "notes" in updates and updates["notes"] is not None else get_curr("notes", ""),
            "number_of_devotees": updates["number_of_devotees"] if "number_of_devotees" in updates and updates["number_of_devotees"] is not None else parse_int(get_curr("number_of_devotees")),
            "menu_type": updates["menu_type"] if "menu_type" in updates and updates["menu_type"] is not None else get_curr("menu_type"),
            "amount": updates["amount"] if "amount" in updates and updates["amount"] is not None else parse_num(get_curr("amount"))
        }

        rec_type = str(merged_data["type"]).strip()
        is_order = (rec_type.lower() == "order")
        devs = parse_int(merged_data["number_of_devotees"]) if is_order else 0
        menu = str(merged_data["menu_type"]).strip() if is_order else ""
        inc = 0.0
        if is_order and devs > 0 and menu:
            inc = calculate_cook_incentive(devs, menu)
        merged_data["number_of_devotees"] = devs
        merged_data["menu_type"] = menu
        merged_data["cook_incentive"] = inc

        updated_row = self._format_order_row_for_layout(layout, merged_data)
        ws.update(range_name=f"{start_letter}{row_idx}:{end_letter}{row_idx}", values=[updated_row], value_input_option="USER_ENTERED")

        return {
            "id": record_id,
            "row_number": row_idx,
            "date": merged_data["date"],
            "person_name": merged_data["person_name"],
            "program": merged_data["program"],
            "type": merged_data["type"],
            "number_of_devotees": devs,
            "menu_type": menu,
            "cook_incentive": inc,
            "amount": parse_num(merged_data["amount"]),
            "payment_through": merged_data["payment_through"],
            "payment_received": merged_data["payment_received"],
            "notes": merged_data["notes"],
            "tab": target_tab
        }

    # -------------------------------------------------------------------------
    # Deleting a Record
    # -------------------------------------------------------------------------
    def delete_record(self, record_id: str, tab_name: Optional[str] = None) -> bool:
        target_tab = (tab_name or self.current_tab_name).strip()
        self.invalidate_cache(target_tab)

        if self.mode == "google_sheets":
            return self._delete_google_record(record_id, target_tab)
        return self._delete_excel_record(record_id, target_tab)

    def _delete_google_record(self, record_id: str, target_tab: str) -> bool:
        ws = self.sheet.worksheet(target_tab)
        m = re.search(r"_R(\d+)$", record_id)
        if not m:
            return False
        row_idx = int(m.group(1))

        all_rows = ws.get_all_values()
        layout = self._detect_order_layout(all_rows)
        start_letter = layout["start_col_letter"]
        end_letter = layout["end_col_letter"]
        start_idx = layout["start_col_idx"]
        end_idx = layout["end_col_idx"]
        cmap = layout["col_map"]
        start_row = layout["data_start_row"]

        last_rec_row = row_idx
        for idx in range(start_row, min(41, len(all_rows) + 1)):
            r = all_rows[idx - 1] if idx - 1 < len(all_rows) else []
            if any("total:" in str(cell).strip().lower() for cell in r[:15]):
                break
            p_name = r[cmap["person_name"]].strip() if len(r) > cmap["person_name"] else ""
            d_val = r[cmap["date"]].strip() if len(r) > cmap["date"] else ""
            amt_val = parse_num(r[cmap["amount"]]) if len(r) > cmap["amount"] else 0.0
            if p_name or d_val or amt_val > 0:
                last_rec_row = idx

        if row_idx == last_rec_row:
            ws.batch_clear([f"{start_letter}{row_idx}:{end_letter}{row_idx}"])
            return True

        subsequent_rows = []
        for r in all_rows[row_idx:last_rec_row]:
            sub = r[start_idx:end_idx + 1] if len(r) > start_idx else []
            while len(sub) < 11:
                sub.append("")
            # Clean numeric columns to prevent string representation with apostrophe:
            dev_v = parse_int(sub[4])
            sub[4] = dev_v if dev_v > 0 else ""
            inc_v = parse_num(sub[6])
            sub[6] = int(inc_v) if inc_v.is_integer() else round(inc_v, 2) if inc_v > 0 else ""
            amt_v = parse_num(sub[7])
            sub[7] = int(amt_v) if amt_v.is_integer() else round(amt_v, 2) if amt_v > 0 else ""
            subsequent_rows.append(sub[:11])

        if subsequent_rows:
            ws.update(range_name=f"{start_letter}{row_idx}:{end_letter}{last_rec_row - 1}", values=subsequent_rows, value_input_option="USER_ENTERED")
        ws.batch_clear([f"{start_letter}{last_rec_row}:{end_letter}{last_rec_row}"])
        return True

    # -------------------------------------------------------------------------
    # Create New Month Sheet Tab by Cloning Master_Template
    # -------------------------------------------------------------------------
    def create_new_sheet(self, sheet_name: str, clone_from: Optional[str] = "Master_Template") -> Dict[str, Any]:
        sheet_name = sheet_name.strip()
        self.invalidate_cache()

        if self.mode == "google_sheets" and self.sheet:
            all_ws_titles = [w.title.strip() for w in self.sheet.worksheets()]
            if sheet_name in all_ws_titles:
                raise ValueError(f"Sheet tab '{sheet_name}' already exists.")

            # Identify template to duplicate
            ref_template = clone_from if clone_from and clone_from in all_ws_titles else ("Master_Template" if "Master_Template" in all_ws_titles else "April 26")
            ref_ws = self.sheet.worksheet(ref_template)

            # Native Google Sheets duplication preserves 100% of formatting, formulas & styles
            new_ws = ref_ws.duplicate(new_sheet_name=sheet_name)

            # Update month title in A1
            try:
                new_ws.update(range_name="A1:B1", values=[["For the month:", sheet_name]], value_input_option="USER_ENTERED")
                # Clear transaction data rows D3:M40, vendor bills P3:T100, and reset vendor amounts B3:B15 for fresh entries
                new_ws.batch_clear(["D3:M40", "P3:T100", "B3:B15"])
            except Exception as e:
                print(f"[SheetService] Note on new sheet update: {e}")

            self.worksheet = new_ws
            self.current_tab_name = sheet_name
            self.get_available_tabs(force_refresh=True)
            return {"success": True, "sheet_name": sheet_name}

        else:
            self._ensure_excel_file()
            wb = openpyxl.load_workbook(EXCEL_FILE_PATH)
            if sheet_name in wb.sheetnames:
                raise ValueError(f"Sheet tab '{sheet_name}' already exists.")

            ref_ws = wb[clone_from] if clone_from in wb.sheetnames else wb.active
            new_ws = wb.copy_worksheet(ref_ws)
            new_ws.title = sheet_name
            new_ws.cell(row=1, column=1, value="For the month:")
            new_ws.cell(row=1, column=2, value=sheet_name)

            for r in range(3, 41):
                for c in range(4, 15):
                    new_ws.cell(row=r, column=c, value="")
            for r in range(3, 101):
                for c in range(16, 21):
                    new_ws.cell(row=r, column=c, value="")
            for r in range(3, 16):
                new_ws.cell(row=r, column=2, value="")

            wb.save(EXCEL_FILE_PATH)
            self.current_tab_name = sheet_name
            self.get_available_tabs(force_refresh=True)
            return {"success": True, "sheet_name": sheet_name}

    # -------------------------------------------------------------------------
    # Excel Fallback Storage Engine (database.xlsx)
    # -------------------------------------------------------------------------
    def _ensure_excel_file(self):
        if not OPENPYXL_AVAILABLE:
            return

        if not os.path.exists(EXCEL_FILE_PATH):
            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = DEFAULT_TAB_NAME

            header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
            header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")

            ws.cell(row=1, column=1, value="For the month:")
            ws.cell(row=1, column=2, value="April 2026")

            for col_idx, h in enumerate(HEADERS, start=1):
                c = ws.cell(row=2, column=col_idx, value=h)
                if h:
                    c.fill = header_fill
                    c.font = header_font
                    c.alignment = Alignment(horizontal="center", vertical="center")

            sample_rows = [
                ["04/04/2026", "Gandha Mataji", "", "Order", 25, "Light", 88.0, 1400, "Cash", "Yes"],
                ["10/04/2026", "Hanuman Prabhu-Margao", "", "Order", 25, "Light", 88.0, 1400, "Gpay", "Yes"],
                ["10/04/2026", "Pandurang Mulvi", "", "Order", 50, "Medium", 280.0, 2400, "Cash", "Yes"],
                ["10/04/2026", "Sushant Chaitanya Prabhu", "Fri Ghanekar", "Order", 100, "Medium", 560.0, 8400, "Gpay", "Yes"],
                ["13/04/2026", "Jyoti Mataji", "Ekadashi Prasad", "Sponsor", 0, "", 0.0, 1800, "Cash", "Yes"],
            ]

            for row_idx, r in enumerate(sample_rows, start=3):
                for c_offset, val in enumerate(r):
                    ws.cell(row=row_idx, column=4 + c_offset, value=val)

            ws.cell(row=41, column=10, value="Total:")
            ws.cell(row=41, column=11, value="=SUM(K3:K40)")

            # Vendor Bills title in P1
            ws.cell(row=1, column=16, value="Vendor Bills")

            # Vendor Bills headers in P2:T2
            vbill_headers = ["Bill Date", "Vendor Name", "Description / Notes", "Bill Amount", "Entry ID"]
            for offset, vh in enumerate(vbill_headers):
                c = ws.cell(row=2, column=16 + offset, value=vh)
                c.fill = header_fill
                c.font = header_font
                c.alignment = Alignment(horizontal="center", vertical="center")

            # Cook Payroll headers and formula rows in A43:G48
            payroll_headers = ['Staff / Cook Name', 'Role & Responsibility', 'Base Salary', 'Order Incentive', 'Festival Allowance', 'Yearly Bonus', 'Total Monthly Payout']
            for offset, ph in enumerate(payroll_headers):
                c = ws.cell(row=43, column=1 + offset, value=ph)
                c.fill = header_fill
                c.font = header_font
                c.alignment = Alignment(horizontal="center", vertical="center")

            cook_rows = [
                ['Manoranjan Prabhu', 'Main Kitchen & Chulha Area', 18000, '=SUM(J3:J40)', 1000, 0, '=C44+D44+E44+F44'],
                ['Chittaranjan Prabhu', 'Assistant Cook & Cutting', 18000, '=SUM(J3:J40)', 1000, 0, '=C45+D45+E45+F45'],
                ['Ranjan Prabhu', 'Cook & Dough/Chapati Section', 18000, '=SUM(J3:J40)', 1000, 0, '=C46+D46+E46+F46'],
                ['Jitendra Prabhu', 'Kitchen Helper & Cleaning', 16000, '=SUM(J3:J40)', 1000, 0, '=C47+D47+E47+F47'],
                ['Total Monthly Payroll', '', '=SUM(C44:C47)', '=SUM(D44:D47)', '=SUM(E44:E47)', '=SUM(F44:F47)', '=SUM(G44:G47)']
            ]
            for r_idx, crow in enumerate(cook_rows, start=44):
                for c_idx, val in enumerate(crow, start=1):
                    ws.cell(row=r_idx, column=c_idx, value=val)

            wb.save(EXCEL_FILE_PATH)

    def _get_excel_workbook_for_tab(self, target_tab: str, data_only: bool = False):
        self._ensure_excel_file()
        if not OPENPYXL_AVAILABLE:
            return None, None, EXCEL_FILE_PATH

        target_path = EXCEL_FILE_PATH
        wb = openpyxl.load_workbook(target_path, data_only=data_only) if os.path.exists(target_path) else None

        if wb and target_tab in wb.sheetnames:
            return wb, wb[target_tab], target_path

        # Check alternative workbook e.g. Kitchen_Accountability_Feb_27.xlsx
        tab_slug = target_tab.replace(" ", "_")
        alt_filename = f"Kitchen_Accountability_{tab_slug}.xlsx"
        alt_path = os.path.join(os.path.dirname(__file__), alt_filename)
        if os.path.exists(alt_path):
            alt_wb = openpyxl.load_workbook(alt_path, data_only=data_only)
            ws = alt_wb[target_tab] if target_tab in alt_wb.sheetnames else alt_wb.active
            return alt_wb, ws, alt_path

        ws = wb[target_tab] if (wb and target_tab in wb.sheetnames) else (wb.active if wb else None)
        return wb, ws, target_path

    def _get_excel_records(self, target_tab: str) -> Dict[str, Any]:
        wb, ws, target_path = self._get_excel_workbook_for_tab(target_tab, data_only=True)
        if not ws:
            return {"records": [], "metrics": self._empty_metrics(), "tab": target_tab}

        all_rows = [[cell.value for cell in row] for row in ws.iter_rows(max_row=45)]
        layout = self._detect_order_layout(all_rows)
        start_row = layout["data_start_row"]
        cmap = layout["col_map"]

        records = []
        for row_idx in range(start_row, min(ws.max_row + 1, 41)):
            if any("total:" in str(ws.cell(row=row_idx, column=c).value or "").strip().lower() for c in range(1, 16)):
                break

            d_val_raw = ws.cell(row=row_idx, column=cmap["date"] + 1).value
            d_val = normalize_sheet_date(d_val_raw) if d_val_raw else ""
            p_name = str(ws.cell(row=row_idx, column=cmap["person_name"] + 1).value or "").strip()
            prog = str(ws.cell(row=row_idx, column=cmap["program"] + 1).value or "").strip()
            t_val = str(ws.cell(row=row_idx, column=cmap["type"] + 1).value or "Order").strip()
            devs = parse_int(ws.cell(row=row_idx, column=cmap["number_of_devotees"] + 1).value)
            menu = str(ws.cell(row=row_idx, column=cmap["menu_type"] + 1).value or "").strip()
            inc = parse_num(ws.cell(row=row_idx, column=cmap["cook_incentive"] + 1).value)
            amt = parse_num(ws.cell(row=row_idx, column=cmap["amount"] + 1).value)
            paym = str(ws.cell(row=row_idx, column=cmap["payment_through"] + 1).value or "Cash").strip()
            rcvd = str(ws.cell(row=row_idx, column=cmap["payment_received"] + 1).value or "Yes").strip()
            notes = str(ws.cell(row=row_idx, column=cmap["notes"] + 1).value or "").strip()

            is_order = (t_val.strip().lower() == "order")
            if not is_order:
                inc = 0.0
                devs = 0
                menu = ""
            elif inc == 0.0 and devs > 0 and menu:
                inc = calculate_cook_incentive(devs, menu)

            if p_name or d_val or amt > 0:
                tab_slug = re.sub(r"[^a-zA-Z0-9]", "_", target_tab)
                records.append({
                    "id": f"{tab_slug}_R{row_idx}",
                    "row_number": row_idx,
                    "date": d_val,
                    "person_name": p_name,
                    "program": prog,
                    "type": t_val,
                    "number_of_devotees": devs,
                    "menu_type": menu,
                    "cook_incentive": inc,
                    "amount": amt,
                    "payment_through": paym,
                    "payment_received": rcvd,
                    "notes": notes,
                    "tab": target_tab
                })

        metrics = self._calculate_metrics(records)
        return {"records": records, "metrics": metrics, "tab": target_tab, "total_records": len(records)}

    def _add_excel_record(self, data: Dict[str, Any], target_tab: str) -> Dict[str, Any]:
        wb, ws, target_path = self._get_excel_workbook_for_tab(target_tab, data_only=False)
        if not ws:
            return {}

        all_rows = [[cell.value for cell in row] for row in ws.iter_rows(max_row=45)]
        layout = self._detect_order_layout(all_rows)
        start_row = layout["data_start_row"]
        start_col = layout["start_col_idx"] + 1
        cmap = layout["col_map"]
        h_row = layout["header_row_idx"]
        layout_type = layout["layout_type"]

        # Ensure headers for new columns exist
        if layout_type == "legacy_orders":
            headers_to_add = ["No. of Devotees", "Menu Type", "Order Incentive", "Notes"]
            for idx_h, h_name in enumerate(headers_to_add):
                c_idx = start_col + 7 + idx_h
                if not ws.cell(row=h_row, column=c_idx).value:
                    ws.cell(row=h_row, column=c_idx, value=h_name)
        elif layout_type == "template_orders":
            notes_col = start_col + 10
            if not ws.cell(row=h_row, column=notes_col).value:
                ws.cell(row=h_row, column=notes_col, value="Notes")

        last_row = h_row
        for r in range(start_row, min(ws.max_row + 1, 41)):
            if any("total:" in str(ws.cell(row=r, column=c).value or "").strip().lower() for c in range(1, 16)):
                break
            if (ws.cell(row=r, column=cmap["person_name"] + 1).value or
                ws.cell(row=r, column=cmap["date"] + 1).value or
                parse_num(ws.cell(row=r, column=cmap["amount"] + 1).value) > 0):
                last_row = r

        target_row = last_row + 1
        row_vals = self._format_order_row_for_layout(layout, data)
        for offset, val in enumerate(row_vals):
            ws.cell(row=target_row, column=start_col + offset, value=val)

        wb.save(target_path)
        tab_slug = re.sub(r"[^a-zA-Z0-9]", "_", target_tab)
        return {
            "id": f"{tab_slug}_R{target_row}",
            "row_number": target_row,
            "date": normalize_sheet_date(data.get("date")),
            "person_name": str(data.get("person_name") or ""),
            "program": str(data.get("program") or ""),
            "type": str(data.get("type") or "Order"),
            "number_of_devotees": parse_int(data.get("number_of_devotees", 0)),
            "menu_type": str(data.get("menu_type") or ""),
            "cook_incentive": float(data.get("cook_incentive", 0.0)),
            "amount": parse_num(data.get("amount", 0)),
            "payment_through": str(data.get("payment_through") or "Cash"),
            "payment_received": str(data.get("payment_received") or "Yes"),
            "notes": str(data.get("notes") or ""),
            "tab": target_tab
        }

    def _update_excel_record(self, record_id: str, updates: Dict[str, Any], target_tab: str) -> Optional[Dict[str, Any]]:
        wb, ws, target_path = self._get_excel_workbook_for_tab(target_tab, data_only=False)
        if not ws:
            return None

        m = re.search(r"_R(\d+)$", record_id)
        if not m:
            return None
        row_idx = int(m.group(1))

        all_rows = [[cell.value for cell in row] for row in ws.iter_rows(max_row=45)]
        layout = self._detect_order_layout(all_rows)
        cmap = layout["col_map"]
        start_col = layout["start_col_idx"] + 1

        def get_curr(col_key: str, default: str = "") -> str:
            col_pos = cmap[col_key] + 1
            v = ws.cell(row=row_idx, column=col_pos).value
            return str(v).strip() if v is not None else default

        merged_data = {
            "date": updates["date"] if "date" in updates and updates["date"] is not None else get_curr("date"),
            "person_name": updates["person_name"] if "person_name" in updates and updates["person_name"] is not None else get_curr("person_name"),
            "program": updates["program"] if "program" in updates and updates["program"] is not None else get_curr("program"),
            "type": updates["type"] if "type" in updates and updates["type"] is not None else get_curr("type", "Order"),
            "payment_through": updates["payment_through"] if "payment_through" in updates and updates["payment_through"] is not None else get_curr("payment_through", "Cash"),
            "payment_received": updates["payment_received"] if "payment_received" in updates and updates["payment_received"] is not None else get_curr("payment_received", "Yes"),
            "notes": updates["notes"] if "notes" in updates and updates["notes"] is not None else get_curr("notes", ""),
            "number_of_devotees": updates["number_of_devotees"] if "number_of_devotees" in updates and updates["number_of_devotees"] is not None else parse_int(get_curr("number_of_devotees")),
            "menu_type": updates["menu_type"] if "menu_type" in updates and updates["menu_type"] is not None else get_curr("menu_type"),
            "amount": updates["amount"] if "amount" in updates and updates["amount"] is not None else parse_num(get_curr("amount"))
        }

        rec_type = str(merged_data["type"]).strip()
        is_order = (rec_type.lower() == "order")
        devs = parse_int(merged_data["number_of_devotees"]) if is_order else 0
        menu = str(merged_data["menu_type"]).strip() if is_order else ""
        inc = 0.0
        if is_order and devs > 0 and menu:
            inc = calculate_cook_incentive(devs, menu)
        merged_data["number_of_devotees"] = devs
        merged_data["menu_type"] = menu
        merged_data["cook_incentive"] = inc

        row_vals = self._format_order_row_for_layout(layout, merged_data)
        for offset, val in enumerate(row_vals):
            ws.cell(row=row_idx, column=start_col + offset, value=val)

        wb.save(target_path)
        return {
            "id": record_id,
            "row_number": row_idx,
            "date": merged_data["date"],
            "person_name": merged_data["person_name"],
            "program": merged_data["program"],
            "type": merged_data["type"],
            "number_of_devotees": devs,
            "menu_type": menu,
            "cook_incentive": inc,
            "amount": parse_num(merged_data["amount"]),
            "payment_through": merged_data["payment_through"],
            "payment_received": merged_data["payment_received"],
            "notes": merged_data["notes"],
            "tab": target_tab
        }

    def _delete_excel_record(self, record_id: str, target_tab: str) -> bool:
        wb, ws, target_path = self._get_excel_workbook_for_tab(target_tab, data_only=False)
        if not ws:
            return False

        m = re.search(r"_R(\d+)$", record_id)
        if not m:
            return False
        row_idx = int(m.group(1))

        all_rows = [[cell.value for cell in row] for row in ws.iter_rows(max_row=45)]
        layout = self._detect_order_layout(all_rows)
        start_col = layout["start_col_idx"] + 1

        for c in range(start_col, start_col + 11):
            ws.cell(row=row_idx, column=c, value="")

        wb.save(target_path)
        return True

    def generate_excel_export(self, tab_name: Optional[str] = None) -> io.BytesIO:
        target_tab = (tab_name or self.current_tab_name).strip()
        result = self.get_month_records(target_tab, force_refresh=True)
        records = result.get("records", [])

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = target_tab[:30]

        header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
        header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
        border_side = Side(style="thin", color="CBD5E1")
        border = Border(left=border_side, right=border_side, top=border_side, bottom=border_side)
        data_font = Font(name="Segoe UI", size=10)

        export_headers = [
            "Date", "Person Name", "Program", "Type", "No. of Devotees",
            "Menu Type", "Order Incentive (Rs)", "Amount (Rs)", "Payment Through", "Payment Received"
        ]
        ws.append(export_headers)
        for col_idx in range(1, len(export_headers) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center")
            cell.border = border

        for rec in records:
            ws.append([
                rec.get("date", ""),
                rec.get("person_name", ""),
                rec.get("program", ""),
                rec.get("type", ""),
                rec.get("number_of_devotees", 0) if rec.get("type", "").lower() == "order" else "",
                rec.get("menu_type", "") if rec.get("type", "").lower() == "order" else "",
                rec.get("cook_incentive", 0.0) if rec.get("type", "").lower() == "order" else "",
                rec.get("amount", 0.0),
                rec.get("payment_through", ""),
                rec.get("payment_received", "")
            ])
            row_idx = ws.max_row
            for col_idx in range(1, len(export_headers) + 1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.font = data_font
                cell.border = border

        for col in ws.columns:
            max_len = max(len(str(cell.value or "")) for cell in col)
            col_letter = get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)
        return output

_raw_sheet_engine = SheetService()

class KitchenServiceFacade:
    """
    Facade Design Pattern:
    Maintains 100% backward compatibility for all existing callers and tests,
    while delegating all business operations to decoupled domain services (SRP, ISP, DIP).
    """
    def __init__(self, raw_engine):
        self._engine = raw_engine
        from core.storage.sheet_storage_backend import SheetStorageBackend
        from core.container import AppContainer
        self._storage = SheetStorageBackend(self._engine)
        self._container = AppContainer(storage_backend=self._storage)

    @property
    def mode(self):
        return self._engine.mode

    @property
    def sheet(self):
        return self._engine.sheet

    @property
    def current_tab_name(self):
        return self._engine.current_tab_name

    @current_tab_name.setter
    def current_tab_name(self, val):
        self._engine.current_tab_name = val

    @property
    def available_tabs(self):
        return self._engine.available_tabs

    @property
    def cooks(self):
        return self._container.cook_service.cooks

    @property
    def available_vendors(self):
        return self._container.vendor_service.available_vendors

    @property
    def vendor_bills(self):
        return self._container.vendor_service.vendor_bills

    def get_status(self):
        return self._engine.get_status()

    def get_available_tabs(self, force_refresh: bool = False):
        return self._engine.get_available_tabs(force_refresh=force_refresh)

    def select_tab(self, tab_name: str):
        return self._engine.select_tab(tab_name)

    def create_new_sheet(self, sheet_name: str, clone_from: str = "Master_Template"):
        return self._engine.create_new_sheet(sheet_name, clone_from=clone_from)

    def get_month_records(self, tab_name: Optional[str] = None, force_refresh: bool = False):
        return self._container.order_service.get_records(tab_name=tab_name, force_refresh=force_refresh)

    def add_record(self, data: Dict[str, Any], tab_name: Optional[str] = None):
        return self._container.order_service.add_record(data, tab_name=tab_name)

    def update_record(self, record_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None):
        return self._container.order_service.update_record(record_id, updates, tab_name=tab_name)

    def delete_record(self, record_id: str, tab_name: Optional[str] = None):
        return self._container.order_service.delete_record(record_id, tab_name=tab_name)

    def get_vendor_records(self, tab_name: Optional[str] = None):
        return self._container.vendor_service.get_vendor_summary(tab_name=tab_name)

    def add_vendor_entry(self, vendor_name: str, amount: float, date: Optional[str] = None, notes: Optional[str] = None, tab_name: Optional[str] = None):
        return self._container.vendor_service.add_vendor_bill_entry(vendor_name, amount, date=date, notes=notes, tab_name=tab_name)

    def delete_vendor_entry(self, entry_id: str, tab_name: Optional[str] = None):
        return self._container.vendor_service.delete_vendor_bill_entry(entry_id, tab_name=tab_name)

    def register_vendor(self, vendor_name: str, initial_amount: float = 0.0, tab_name: Optional[str] = None):
        return self._container.vendor_service.register_vendor(vendor_name, initial_amount=initial_amount, tab_name=tab_name)

    def update_vendor_record(self, row_number: int, vendor_name: str, amount: float, tab_name: Optional[str] = None):
        return self._container.vendor_service.update_vendor(row_number, vendor_name, amount, tab_name=tab_name)

    def delete_vendor_record(self, row_number: int, tab_name: Optional[str] = None):
        return self._container.vendor_service.delete_vendor(row_number, tab_name=tab_name)

    def get_cook_records(self, tab_name: Optional[str] = None):
        return self._container.cook_service.get_cook_records(tab_name=tab_name)

    def add_cook(self, name: str, base_salary: float, role: Optional[str] = "Cook", festival_allowance: float = 1000.0, yearly_bonus: float = 0.0, tab_name: Optional[str] = None):
        return self._container.cook_service.add_cook(name, base_salary, role=role, festival_allowance=festival_allowance, yearly_bonus=yearly_bonus, tab_name=tab_name)

    def update_cook(self, cook_id: str, updates: Dict[str, Any], tab_name: Optional[str] = None):
        return self._container.cook_service.update_cook(cook_id, updates, tab_name=tab_name)

    def delete_cook(self, cook_id: str, tab_name: Optional[str] = None):
        return self._container.cook_service.delete_cook(cook_id, tab_name=tab_name)

    def generate_excel_export(self, tab_name: Optional[str] = None):
        return self._container.export_service.export_excel(tab_name=tab_name)

    def invalidate_cache(self, tab_name: Optional[str] = None):
        self._engine.invalidate_cache(tab_name=tab_name)

service = KitchenServiceFacade(_raw_sheet_engine)

