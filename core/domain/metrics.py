"""
Metrics Domain Module - SRP: Financial aggregations and donation bifurcations.
Pure domain logic free from persistence or HTTP concerns.
"""

from typing import List, Dict, Any, Optional


def parse_num(val: Any) -> float:
    """Safely converts spreadsheet values to clean floats."""
    if val is None:
        return 0.0
    if isinstance(val, (int, float)):
        return float(val)
    s = str(val).strip().replace("₹", "").replace(",", "").replace("Rs.", "").replace("Rs", "").strip()
    if not s or s.startswith("="):
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def calculate_metrics(records: List[Dict[str, Any]], all_rows: Optional[List[List[str]]] = None) -> Dict[str, Any]:
    """Computes totals, bifurcations, and net margins across kitchen transaction records."""
    total_collections = sum(r.get("amount", 0.0) for r in records)
    total_orders = sum(r["amount"] for r in records if r.get("type", "").strip().lower() == "order")
    total_sponsors = sum(r["amount"] for r in records if r.get("type", "").strip().lower() == "sponsor")
    total_coupons = sum(r["amount"] for r in records if "coupon" in r.get("type", "").strip().lower())
    total_other_types = total_collections - (total_orders + total_sponsors + total_coupons)

    total_cash = sum(r["amount"] for r in records if "cash" in r.get("payment_through", "").lower())
    total_gpay = sum(r["amount"] for r in records if "gpay" in r.get("payment_through", "").lower())
    total_bank = sum(r["amount"] for r in records if any(k in r.get("payment_through", "").lower() for k in ["bank", "transfer", "neft", "cheque"]))
    total_other_payment = total_collections - (total_cash + total_gpay + total_bank)

    count_received = sum(1 for r in records if r.get("payment_received", "").strip().lower() in ["yes", "y", "done", "paid"])
    count_pending = len(records) - count_received
    amt_received = sum(r["amount"] for r in records if r.get("payment_received", "").strip().lower() in ["yes", "y", "done", "paid"])
    amt_pending = total_collections - amt_received

    total_incentive = sum(r.get("cook_incentive", 0.0) for r in records if r.get("type", "").strip().lower() == "order")

    programs_bifurcation: Dict[str, float] = {}
    for r in records:
        prog = r.get("program", "").strip() or "General Program"
        programs_bifurcation[prog] = programs_bifurcation.get(prog, 0.0) + r.get("amount", 0.0)

    menu_bifurcation: Dict[str, float] = {}
    for r in records:
        menu = r.get("menu_type", "").strip() or "Standard / Custom"
        menu_bifurcation[menu] = menu_bifurcation.get(menu, 0.0) + r.get("amount", 0.0)

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


def empty_metrics() -> Dict[str, Any]:
    """Returns a baseline zero-value metrics dictionary."""
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
        "bifurcation_type": {"Orders": 0.0, "Sponsorships": 0.0, "Coupons": 0.0, "Other": 0.0},
        "bifurcation_payment": {"Cash": 0.0, "GPay": 0.0, "Bank / Cheque": 0.0, "Other": 0.0},
        "bifurcation_status": {"Paid": 0.0, "Pending": 0.0},
        "bifurcation_program": {},
        "bifurcation_menu": {}
    }

