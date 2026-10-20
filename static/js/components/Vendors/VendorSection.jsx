// =============================================================================
// Vendor Management Section Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Vendors = window.KitchenComponents.Vendors || {};

window.KitchenComponents.Vendors.VendorSection = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants || {};
  const TableLoadingCell =
    window.KitchenComponents?.Common?.TableLoadingCell ||
    window.KitchenComponents?.TableLoadingCell ||
    (() => null);
  const ModernDonutChart =
    window.KitchenComponents?.Common?.ModernDonutChart ||
    window.KitchenComponents?.ModernDonutChart ||
    (() => null);

  function VendorSection({
    vendorsData = {},
    isLoading = false,
    onOpenRegisterVendor,
    onOpenAddBill,
    onOpenEditVendor,
    onDeleteVendor,
    onViewVendorBills,
    onDeleteVendorEntry,
  }) {
    const vendors = vendorsData.vendors || [];
    const availableVendors = vendorsData.available_vendors || [];
    const allEntries = vendorsData.all_entries || [];
    const totalExpenses = vendorsData.total_vendor_expenses || 0;
    const netDifference = vendorsData.net_difference || 0;

    // Visual Vendor Purchase Breakdown (% of total budget spent per vendor)
    const vendorChartItems = React.useMemo(() => {
      if (!vendors || vendors.length === 0 || totalExpenses <= 0) return [];

      const colors = (window.KitchenConstants && window.KitchenConstants.CHART_COLORS) || [
        "#4f46e5", "#10b981", "#0284c7", "#f59e0b", "#ec4899",
        "#8b5cf6", "#14b8a6", "#f97316", "#64748b", "#84cc16"
      ];

      return [...vendors]
        .filter((v) => Number(v.amount) > 0)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .map((v, i) => {
          const count = Number(v.bill_count) || 0;
          return {
            id: `vendor-${v.row_number || i}-${v.vendor_name}`,
            label: v.vendor_name,
            value: Number(v.amount) || 0,
            color: colors[i % colors.length],
            secondaryLabel: count > 0 ? `${count} ${count === 1 ? 'bill' : 'bills'}` : 'Direct'
          };
        });
    }, [vendors, totalExpenses]);

    return (
      <div id="pageVendors" className="app-page active">
        {/* Vendor Header Actions */}
        <section
          className="section-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              Vendor Management &amp; Expense Tracking
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Live synchronization with Google Sheets Columns N-P &amp; itemized
              grocery bills
            </p>
          </div>
          <div className="section-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenRegisterVendor}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Register Vendor</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenAddBill(null)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Vendor Bill</span>
            </button>
          </div>
        </section>

        {/* Vendor Stats Grid */}
        <section className="stats-grid" aria-label="Vendor Statistics">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-amber">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vendor Bills</span>
              <span id="statVendorTotal" className="stat-value">
                ₹{formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Vendors</span>
              <span id="statVendorCount" className="stat-value">
                {availableVendors.length}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-emerald">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">
                Net Balance (Surplus / Deficit)
              </span>
              <span
                id="statNetDifference"
                className="stat-value"
                style={{
                  color:
                    netDifference >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                ₹{formatCurrency(netDifference)}
              </span>
            </div>
          </div>
        </section>

        {/* Vendor Purchase Distribution & Expense Share Donut Chart */}
        <section style={{ marginBottom: "1.75rem" }} aria-label="Vendor Expense Distribution">
          <ModernDonutChart
            title="Vendor Purchase Distribution (%)"
            subtitle="Visual share of grocery, supplies and kitchen purchases allocated per vendor"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--warning)" }}
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            }
            items={vendorChartItems}
            total={totalExpenses}
            defaultCenterLabel="Total Purchases"
            defaultCenterSub={
              vendorChartItems.length > 0
                ? `${vendorChartItems.length} Active Vendors`
                : "No Expenses"
            }
            emptyMessage="No vendor purchases or bills logged for this month yet. Use 'Add Vendor Bill' to start logging expenses."
          />
        </section>

        {/* 1. Available Vendors Summary Table */}
        <section className="table-container" aria-label="Available Vendors">
          <div className="table-header-bar">
            <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
              Available Vendors (Sheet Summary)
            </h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Columns N &bull; O &bull; P
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Total Amount (₹)</th>
                  <th>Itemized Bills</th>
                  <th className="text-right" style={{ width: "150px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="vendorTableBody">
                {isLoading ? (
                  <TableLoadingCell
                    colSpan={4}
                    message="Syncing vendors from Google Sheet..."
                  />
                ) : vendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        padding: "2.5rem",
                      }}
                    >
                      No vendors recorded yet. Click &quot;Add Vendor Bill&quot;
                      to record bills.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => {
                    const billBadge =
                      v.bill_count > 0 ? (
                        <span
                          className="badge badge-yes"
                          style={{ cursor: "pointer" }}
                          onClick={() => onViewVendorBills(v.vendor_name)}
                          title="Click to view itemized bills"
                        >
                          {v.bill_count} {v.bill_count === 1 ? "bill" : "bills"}{" "}
                          &nearr;
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          Direct / None
                        </span>
                      );

                    return (
                      <tr key={v.row_number}>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--text-main)",
                              fontSize: "1rem",
                            }}
                          >
                            {v.vendor_name}
                          </div>
                        </td>
                        <td>
                          <span className="amount-display">
                            ₹{formatCurrency(v.amount)}
                          </span>
                        </td>
                        <td>{billBadge}</td>
                        <td className="text-right">
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenAddBill(v.vendor_name)}
                              title={`Add bill for ${v.vendor_name}`}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              <span>Add Bill</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewVendorBills(v.vendor_name)}
                              title="View itemized bills"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Bills</span>
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => onOpenEditVendor(v)}
                              title="Edit vendor name / amount directly"
                              aria-label={`Edit ${v.vendor_name}`}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon-danger"
                              onClick={() =>
                                onDeleteVendor(v.row_number, v.vendor_name)
                              }
                              title="Clear vendor row from sheet"
                              aria-label={`Clear ${v.vendor_name}`}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Itemized Grocery Bill Entries Log */}
        <section className="table-container" aria-label="Itemized Bill Entries">
          <div className="table-header-bar">
            <div>
              <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
                Detailed Bill Log
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "0.825rem",
                }}
              >
                Itemized invoices auto-summed into Sheet Column P
              </p>
            </div>
            <span className="record-count-badge" id="vendorEntriesCountLabel">
              {allEntries.length} {allEntries.length === 1 ? "bill" : "bills"}
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Date</th>
                  <th>Vendor</th>
                  <th>Description / Notes</th>
                  <th>Amount (₹)</th>
                  <th className="text-right" style={{ width: "70px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="vendorEntriesTableBody">
                {isLoading ? (
                  <TableLoadingCell
                    colSpan={5}
                    message="Loading bill entries..."
                  />
                ) : allEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        padding: "2.5rem",
                      }}
                    >
                      No bill entries logged yet for this month. Click &quot;Add
                      Vendor Bill&quot; above.
                    </td>
                  </tr>
                ) : (
                  allEntries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-muted)",
                          }}
                        >
                          {e.date || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge badge-cash"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {e.vendor_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-main)" }}>
                          {e.notes || "Grocery bill"}
                        </span>
                      </td>
                      <td>
                        <span className="amount-display">
                          ₹{formatCurrency(e.amount)}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() => onDeleteVendorEntry(e.id)}
                          title="Delete bill and recalculate vendor total"
                          aria-label={`Delete bill of ₹${e.amount} for ${e.vendor_name}`}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return React.memo ? React.memo(VendorSection) : VendorSection;
})();

window.KitchenComponents.VendorSection =
  window.KitchenComponents.Vendors.VendorSection;
