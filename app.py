import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from models import (
    KitchenRecordCreate, KitchenRecordUpdate, TabSelectRequest, CreateSheetRequest,
    VendorItem, VendorEntryCreate, VendorCreate, CookCreate, CookUpdate
)
from sheet_service import (
    service, INCENTIVE_MATRIX, MENU_PRICES,
    calculate_cook_incentive, calculate_order_pricing
)

app = FastAPI(
    title="Kitchen Accountability ERP API",
    description="Full-scale Kitchen Management System (Kitchen Accountability 2025-26)",
    version="2.2.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    """Serves the responsive multi-page dashboard UI."""
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Kitchen Accountability API is running. UI files not found."}

@app.get("/api/status")
def get_status():
    """Returns spreadsheet sync mode, current tab, available tabs and metadata."""
    status = service.get_status()
    status["menu_prices"] = MENU_PRICES
    status["incentive_matrix"] = INCENTIVE_MATRIX
    return status

@app.get("/api/tabs")
def get_tabs(refresh: bool = False):
    """Returns list of monthly tabs and current active tab."""
    tabs = service.get_available_tabs(force_refresh=refresh)
    # Hide Master_Template from standard user month selector dropdown if desired, or keep as template
    user_tabs = [t for t in tabs if t != "Master_Template"]
    return {
        "current_tab": service.current_tab_name,
        "tabs": user_tabs
    }

@app.post("/api/tabs/select")
def select_tab(req: TabSelectRequest):
    """Switches active month tab."""
    success = service.select_tab(req.tab)
    if not success:
        raise HTTPException(status_code=400, detail=f"Failed to switch to tab '{req.tab}'")
    return {"success": True, "current_tab": service.current_tab_name}

@app.post("/api/sheets/create", status_code=201)
def create_new_sheet(req: CreateSheetRequest):
    """Creates a new month sheet in Google Sheets by cloning Master_Template."""
    try:
        res = service.create_new_sheet(req.sheet_name, clone_from=req.clone_from)
        return {"success": True, "sheet_name": res["sheet_name"], "current_tab": service.current_tab_name}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create sheet: {str(e)}")

# -----------------------------------------------------------------------------
# Orders & Sponsors Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/records")
def get_records(
    tab: Optional[str] = None,
    search: Optional[str] = None,
    type: Optional[str] = None,
    payment: Optional[str] = None,
    status: Optional[str] = None,
    menu: Optional[str] = None,
    refresh: bool = False
):
    """Fetches records, computed metrics, and donation bifurcations for the selected month."""
    data = service.get_month_records(tab, force_refresh=refresh)
    records = data.get("records", [])

    if search and isinstance(search, str):
        s = search.lower().strip()
        records = [
            r for r in records
            if s in r["person_name"].lower() or s in r["program"].lower() or s in r["date"].lower() or s in str(r["amount"]) or s in str(r.get("menu_type", "")).lower()
        ]

    if type and isinstance(type, str) and type != "All":
        records = [r for r in records if r["type"].strip().lower() == type.lower()]

    if payment and isinstance(payment, str) and payment != "All":
        records = [r for r in records if payment.lower() in r["payment_through"].lower()]

    if status and isinstance(status, str) and status != "All":
        if status.lower() in ["yes", "received"]:
            records = [r for r in records if r["payment_received"].strip().lower() in ["yes", "y", "done"]]
        elif status.lower() in ["no", "pending"]:
            records = [r for r in records if r["payment_received"].strip().lower() not in ["yes", "y", "done"]]

    if menu and isinstance(menu, str) and menu != "All":
        records = [r for r in records if menu.lower() in str(r.get("menu_type", "")).lower()]

    return {
        "records": records,
        "metrics": data.get("metrics", {}),
        "total": len(records),
        "tab": data.get("tab")
    }

@app.post("/api/records", status_code=201)
def create_record(record_data: KitchenRecordCreate, tab: Optional[str] = None):
    """Appends an Order or Sponsor to Google Sheets."""
    try:
        new_record = service.add_record(record_data.model_dump(), tab_name=tab)
        return {"success": True, "record": new_record}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add transaction: {str(e)}")

@app.put("/api/records/{record_id}")
def update_record(record_id: str, updates: KitchenRecordUpdate, tab: Optional[str] = None):
    """Updates an existing row in Google Sheets."""
    try:
        updated = service.update_record(record_id, updates.model_dump(exclude_unset=True), tab_name=tab)
        if not updated:
            raise HTTPException(status_code=404, detail="Record row not found")
        return {"success": True, "record": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update transaction: {str(e)}")

@app.delete("/api/records/{record_id}")
def delete_record(record_id: str, tab: Optional[str] = None):
    """Deletes/clears a transaction row from Google Sheets."""
    try:
        success = service.delete_record(record_id, tab_name=tab)
        if not success:
            raise HTTPException(status_code=404, detail="Record not found")
        return {"success": True, "message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")

@app.get("/api/calculate-order")
def calc_order_preview(devotees: int = Query(..., ge=0), menu: str = Query(...), type: str = Query("Order")):
    """Calculates suggested order amount and matrix incentive based on devotees and menu type (applicable only for type 'Order')."""
    return calculate_order_pricing(devotees, menu, type)

# -----------------------------------------------------------------------------
# Vendor Management Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/vendors")
def get_vendors(tab: Optional[str] = None):
    """Fetches vendor expenses, available vendor list, bill entries, and net difference."""
    return service.get_vendor_records(tab)

@app.post("/api/vendors/entries", status_code=201)
def add_vendor_entry(entry: VendorEntryCreate):
    """Adds a bill entry for a vendor, recalculates vendor total, and syncs to Google Sheets."""
    try:
        res = service.add_vendor_entry(
            vendor_name=entry.vendor_name,
            amount=entry.amount,
            date=entry.date,
            notes=entry.notes,
            tab_name=entry.tab
        )
        return {"success": True, "result": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add vendor bill entry: {str(e)}")

@app.delete("/api/vendors/entries/{entry_id}")
def delete_vendor_entry(entry_id: str, tab: Optional[str] = None):
    """Deletes a vendor bill entry, recalculates vendor total, and syncs to Google Sheets."""
    try:
        success = service.delete_vendor_entry(entry_id, tab_name=tab)
        if not success:
            raise HTTPException(status_code=404, detail="Vendor bill entry not found")
        return {"success": True, "message": "Vendor entry removed and sheet updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete vendor entry: {str(e)}")

@app.post("/api/vendors", status_code=201)
def register_vendor(item: VendorCreate):
    """Registers a new vendor name and adds them to available vendors and sheet."""
    try:
        res = service.register_vendor(item.vendor_name, initial_amount=item.initial_amount or 0.0, tab_name=item.tab)
        return {"success": True, "vendor": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register vendor: {str(e)}")

@app.put("/api/vendors/{row_number}")
def update_vendor(row_number: int, item: VendorItem, tab: Optional[str] = None):
    """Updates a vendor name and direct amount in the sheet."""
    try:
        res = service.update_vendor_record(row_number, item.vendor_name, item.amount, tab_name=tab)
        return {"success": True, "vendor": res}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update vendor: {str(e)}")

@app.delete("/api/vendors/{row_number}")
def delete_vendor(row_number: int, tab: Optional[str] = None):
    """Clears a vendor entry from the sheet."""
    try:
        success = service.delete_vendor_record(row_number, tab_name=tab)
        if not success:
            raise HTTPException(status_code=404, detail="Vendor entry not found")
        return {"success": True, "message": "Vendor entry cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete vendor: {str(e)}")

# -----------------------------------------------------------------------------
# Cook Management & Payroll Endpoints (Section 3 Policy Matrix - Direct Profit)
# -----------------------------------------------------------------------------
@app.get("/api/cooks")
def get_cooks(tab: Optional[str] = None):
    """Fetches cook records, base salary, matrix profit from devotees & menu, and total payout."""
    return service.get_cook_records(tab)

@app.post("/api/cooks", status_code=201)
def add_cook(req: CookCreate, tab: Optional[str] = None):
    """Adds a new cook to the management system and synchronizes to Google Sheets & Master Template."""
    try:
        target_tab = tab or req.tab
        cook = service.add_cook(
            name=req.name,
            base_salary=req.base_salary,
            role=req.role,
            festival_allowance=req.festival_allowance if req.festival_allowance is not None else 1000.0,
            yearly_bonus=req.yearly_bonus if req.yearly_bonus is not None else 0.0,
            tab_name=target_tab
        )
        return {"success": True, "cook": cook}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add cook: {str(e)}")

@app.put("/api/cooks/{cook_id}")
def update_cook(cook_id: str, updates: CookUpdate, tab: Optional[str] = None):
    """Updates a cook's basic salary, role, festival allowance, or bonus and syncs to Google Sheets."""
    try:
        target_tab = tab or updates.tab
        updated = service.update_cook(cook_id, updates.model_dump(exclude_unset=True), tab_name=target_tab)
        if not updated:
            raise HTTPException(status_code=404, detail="Cook not found")
        return {"success": True, "cook": updated}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update cook: {str(e)}")

@app.delete("/api/cooks/{cook_id}")
def delete_cook(cook_id: str, tab: Optional[str] = None):
    """Removes a cook from the roster and synchronizes to Google Sheets & Master Template."""
    try:
        success = service.delete_cook(cook_id, tab_name=tab)
        if not success:
            raise HTTPException(status_code=404, detail="Cook not found")
        return {"success": True, "message": "Cook deleted and sheet updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete cook: {str(e)}")

# -----------------------------------------------------------------------------
# Export Endpoint
# -----------------------------------------------------------------------------
@app.get("/api/export")
def export_excel(tab: Optional[str] = None):
    """Exports the month's transactions as an Excel spreadsheet."""
    try:
        target_tab = tab or service.current_tab_name
        output = service.generate_excel_export(target_tab)
        filename = f"Kitchen_Accountability_{target_tab.replace(' ', '_')}.xlsx"
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export Excel: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Kitchen Accountability ERP Server on http://127.0.0.1:{port}")
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True)
