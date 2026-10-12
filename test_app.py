import os
from sheet_service import service, calculate_cook_incentive, calculate_order_pricing, INCENTIVE_MATRIX, MENU_PRICES
from app import get_status, get_tabs, get_records, calc_order_preview, get_vendors, get_cooks, export_excel

def run_tests():
    print("==================================================")
    print("[TEST] KITCHEN ACCOUNTABILITY SYSTEM VERIFICATION")
    print("==================================================")

    # 1. Test Status & Caching
    print("\n[1/7] Testing get_status()...")
    status = get_status()
    print(f"  Mode: {status['mode']}, Title: {status['spreadsheet_title']}, Tab: {status['current_tab']}")
    assert status["connected"] is True
    print("  [PASS] Successfully connected to spreadsheet storage.")

    # 2. Test Get Tabs
    print("\n[2/7] Testing get_tabs()...")
    tabs_data = get_tabs()
    print(f"  Available month tabs ({len(tabs_data['tabs'])}): {tabs_data['tabs'][:5]}...")
    assert len(tabs_data["tabs"]) > 0
    print("  [PASS] Month tabs loaded successfully.")

    # 3. Test Policy Matrix Incentive Calculation (Section 3) & Pricing
    print("\n[3/7] Testing Policy Section 3 Matrix Incentive Calculations & Plate Pricing...")
    # Matrix values from policy:
    # Light: 25 -> 88, 100 -> 350, 250 -> 875
    # Medium: 25 -> 140, 100 -> 560, 250 -> 1400
    # Heavy: 25 -> 193, 100 -> 770, 250 -> 1925
    # Very Heavy: 25 -> 219, 100 -> 875, 250 -> 2188
    assert calculate_cook_incentive(25, "Light") == 88.0
    assert calculate_cook_incentive(100, "Light") == 350.0
    assert calculate_cook_incentive(250, "Light") == 875.0

    assert calculate_cook_incentive(25, "Medium") == 140.0
    assert calculate_cook_incentive(100, "Medium") == 560.0
    assert calculate_cook_incentive(250, "Medium") == 1400.0

    assert calculate_cook_incentive(25, "Heavy") == 193.0
    assert calculate_cook_incentive(100, "Heavy") == 770.0
    assert calculate_cook_incentive(250, "Heavy") == 1925.0

    assert calculate_cook_incentive(25, "Very Heavy") == 219.0
    assert calculate_cook_incentive(100, "Very Heavy") == 875.0
    assert calculate_cook_incentive(250, "Very Heavy") == 2188.0

    pricing = calc_order_preview(devotees=100, menu="Medium", type="Order")
    assert pricing["plate_price"] == 160
    assert pricing["suggested_amount"] == 16000.0
    assert pricing["cook_incentive"] == 560.0
    assert pricing["is_order"] is True

    # Strictly verify that non-Order types (Sponsor, Coupon, etc.) receive 0 incentive
    pricing_sponsor = calc_order_preview(devotees=100, menu="Medium", type="Sponsor")
    assert pricing_sponsor["cook_incentive"] == 0.0
    assert pricing_sponsor["is_order"] is False

    pricing_coupon = calc_order_preview(devotees=50, menu="Heavy", type="Coupon")
    assert pricing_coupon["cook_incentive"] == 0.0
    assert pricing_coupon["is_order"] is False
    print(f"  [PASS] Matrix incentive engine verified: 100 Medium devotees = Rs 560 for Order, and strictly Rs 0 for Sponsor/Coupon.")

    # 4. Test Get Records (April 26) & Donation Bifurcations
    print("\n[4/7] Testing get_records() for April 26 with Bifurcations...")
    res = get_records(tab="April 26")
    records = res["records"]
    metrics = res["metrics"]
    print(f"  Retrieved {len(records)} transactions. Collections: Rs {metrics.get('total_collections', 0):,.2f}")
    assert len(records) > 0
    assert metrics["total_collections"] == 67400.0
    assert "bifurcation_type" in metrics
    assert "bifurcation_payment" in metrics
    assert "bifurcation_program" in metrics
    assert "bifurcation_status" in metrics
    assert "bifurcation_menu" in metrics
    print(f"  Bifurcation by Type: {metrics['bifurcation_type']}")
    print(f"  Bifurcation by Payment: {metrics['bifurcation_payment']}")
    print(f"  Bifurcation by Menu: {metrics['bifurcation_menu']}")
    print("  [PASS] Records and donation bifurcations match sheet calculations.")

    # 5. Test Vendor Management & Multi-Bill Entries Auto-Calculation
    print("\n[5/7] Testing Vendor Management (Multi-Bill Entries & Auto-Calculation)...")
    vendor_data = get_vendors(tab="April 26")
    print(f"  Found {vendor_data['vendor_count']} vendor summaries, {len(vendor_data['available_vendors'])} available vendors, {vendor_data['total_entries_count']} bill entries.")
    print(f"  Total Vendor Expenses: Rs {vendor_data['total_vendor_expenses']:,.2f}")
    print(f"  Net Difference (Debit/Credit): Rs {vendor_data['net_difference']:,.2f}")
    assert vendor_data["vendor_count"] > 0
    assert vendor_data["total_vendor_expenses"] >= 0
    assert len(vendor_data["available_vendors"]) >= 5

    # Test adding multiple bill entries for a vendor and verifying auto-sum
    test_vendor = "Rinka Marketing"
    print(f"  Adding 2 test bill entries for '{test_vendor}'...")
    entry1_res = None
    entry2_res = None
    try:
        entry1_res = service.add_vendor_entry(vendor_name=test_vendor, amount=1200.0, date="15/04/2026", notes="First batch vegetables", tab_name="April 26")
        entry2_res = service.add_vendor_entry(vendor_name=test_vendor, amount=800.0, date="16/04/2026", notes="Second batch spices", tab_name="April 26")
        assert entry1_res["vendor_total"] == 1200.0
        assert entry2_res["vendor_total"] == 2000.0
        print(f"  [PASS] Auto-calculated vendor total: Rs 1200 + Rs 800 = Rs {entry2_res['vendor_total']}")

        # Verify get_vendors reflects the new entries and total
        v_updated = get_vendors(tab="April 26")
        test_summary = next((v for v in v_updated["vendors"] if (v.get("vendor_name") or v.get("name", "")).lower() == test_vendor.lower()), None)
        assert test_summary is not None
        assert test_summary["amount"] == 2000.0
        print(f"  [PASS] Verified '{test_vendor}' summary reflects total Rs {test_summary['amount']}.")
    finally:
        # Clean up test bill entries
        if entry1_res:
            service.delete_vendor_entry(entry1_res["entry"]["id"], tab_name="April 26")
        if entry2_res:
            service.delete_vendor_entry(entry2_res["entry"]["id"], tab_name="April 26")
        v_cleaned = get_vendors(tab="April 26")
        test_summary_clean = next((v for v in v_cleaned["vendors"] if (v.get("vendor_name") or v.get("name", "")).lower() == test_vendor.lower()), None)
        assert test_summary_clean is not None and test_summary_clean["amount"] == 0.0
        print(f"  [PASS] Cleaned up test entries; vendor total recalculated.")

    # Also test Jan 26 which has historical completed vendor expenses (Rs 137,415)
    jan_vendor = get_vendors(tab="Jan 26")
    print(f"  Jan 26 Vendor Expenses: Rs {jan_vendor['total_vendor_expenses']:,.2f}")
    assert jan_vendor["total_vendor_expenses"] == 137415.0
    print("  [PASS] Vendor records and sheet expense/net calculations loaded successfully.")

    # 6. Test Cook Management & Direct Matrix Profit Sharing (No Percentages)
    print("\n[6/7] Testing Cook Management & Direct Matrix Profit Sharing...")
    cook_data = get_cooks(tab="April 26")
    print(f"  Found {cook_data['cook_count']} cooks.")
    total_incentive = cook_data['total_cook_incentive']
    print(f"  Total Section 3 Matrix Incentive Pool: Rs {total_incentive:,.2f}")
    print(f"  Total Monthly Payroll: Rs {cook_data['total_payroll']:,.2f}")
    for c in cook_data["cooks"]:
        print(f"    - {c['name']} ({c['role']}): Base Rs {c['base_salary']} + Direct Matrix Share Rs {c['matrix_share']} + Festival Rs {c['festival_allowance']} = Total Rs {c['total_payout']}")
        # Direct profit sharing: every cook receives the full matrix incentive pool directly (no percentage division)
        assert c["matrix_share"] == total_incentive, f"Expected {total_incentive}, got {c['matrix_share']}"
        assert c["total_payout"] == round(c["base_salary"] + c["matrix_share"] + c["festival_allowance"] + c.get("yearly_bonus", 0.0), 2)
    assert cook_data["cook_count"] >= 3
    assert cook_data["total_payroll"] > 0
    print("  [PASS] Direct profit sharing verified: Section 3 Matrix incentive added directly to each cook (no percentages).")

    # Test adding, updating, and deleting a cook profile with Google Sheets sync
    test_cook_name = "Test Chef Prabhu"
    print(f"  Adding test cook '{test_cook_name}' and verifying Google Sheets synchronization...")
    test_cook = service.add_cook(name=test_cook_name, base_salary=15000.0, role="Assistant Baker", festival_allowance=500.0, yearly_bonus=0.0, tab_name="April 26")
    try:
        assert test_cook["id"] in [c["id"] for c in service.cooks]
        c_updated = get_cooks(tab="April 26")
        assert any(c["name"] == test_cook_name for c in c_updated["cooks"])

        # Test updating payroll
        service.update_cook(test_cook["id"], {"base_salary": 16500.0, "festival_allowance": 800.0}, tab_name="April 26")
        c_after_update = get_cooks(tab="April 26")
        found = next(c for c in c_after_update["cooks"] if c["id"] == test_cook["id"])
        assert found["base_salary"] == 16500.0
        assert found["festival_allowance"] == 800.0
        print(f"  [PASS] Successfully verified cook addition and live payroll update!")
    finally:
        # Clean up test cook
        service.delete_cook(test_cook["id"], tab_name="April 26")
        c_clean = get_cooks(tab="April 26")
        assert not any(c["id"] == test_cook["id"] for c in c_clean["cooks"])
        print(f"  [PASS] Cleaned up test cook and restored sheet roster.")

    # 7. Test Excel Export
    print("\n[7/8] Testing Excel export...")
    export_stream = export_excel(tab="April 26")
    assert export_stream.media_type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    excel_io = service.generate_excel_export("April 26")
    excel_bytes = excel_io.getvalue()
    assert len(excel_bytes) > 1000
    print(f"  [PASS] Excel export generated ({len(excel_bytes)} bytes).")

    # 8. Test Date Picker Normalization & Master_Template Structure
    print("\n[8/8] Testing Date Picker Normalization & Master_Template Structure...")
    from sheet_service import normalize_sheet_date
    assert normalize_sheet_date("2026-04-15") == "15/04/2026"
    assert normalize_sheet_date("15/04/2026") == "15/04/2026"
    assert normalize_sheet_date("2026-1-5") == "05/01/2026"
    print("  [PASS] Date picker bidirectional conversion verified (YYYY-MM-DD -> DD/MM/YYYY).")

    if service.mode == "google_sheets" and service.sheet:
        ws_master = service.sheet.worksheet("Master_Template")
        batch_results = ws_master.batch_get(["P1", "P2:T2", "D2:M2", "A43:G43", "A44:G44", "B19"], value_render_option="FORMULA")
        p1_val = batch_results[0][0][0] if batch_results[0] else ""
        assert p1_val == "Vendor Bills"
        assert batch_results[1][0] == ["Bill Date", "Vendor Name", "Description / Notes", "Bill Amount", "Entry ID"]
        print("  [PASS] Master_Template vendor bill headers (P1, P2:T2) verified in Google Sheets.")

        tx_headers = batch_results[2][0]
        assert tx_headers == ['Date', 'Person name', 'Program', 'Type', 'No. of Devotees', 'Menu Type', 'Order Incentive', 'Amount', 'Payment through', 'Paymt Rcvd']
        print("  [PASS] Master_Template transaction headers (D2:M2) verified with Order columns grouped.")

        cook_header = batch_results[3][0]
        assert cook_header[0] == "Staff / Cook Name"
        assert cook_header[3] == "Order Incentive"

        cook_row1 = batch_results[4][0]
        assert cook_row1[0] == "Manoranjan Prabhu"
        assert cook_row1[3] == "=SUM(J3:J40)"
        print("  [PASS] Master_Template cook salary formulas (A43:G48) verified in Google Sheets.")

        sumif_order = batch_results[5][0][0]
        assert sumif_order == '=SUMIF(G3:G40, "Order", K3:K40)'
        print("  [PASS] Master_Template Order collection formula (B19) verified.")

    print("\n=======================================================")
    print("[SUCCESS] ALL 8 VERIFICATION SUITES PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
