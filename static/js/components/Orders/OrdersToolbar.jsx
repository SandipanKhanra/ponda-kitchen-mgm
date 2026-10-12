// =============================================================================
// Orders Toolbar (Search, 4 Filter Dropdowns, Sync Buttons, Add Entry)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersToolbar = (() => {
  const { React } = window;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  function OrdersToolbar({
    searchQuery,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    paymentFilter,
    onPaymentFilterChange,
    statusFilter,
    onStatusFilterChange,
    menuFilter,
    onMenuFilterChange,
    isRefreshing,
    onRefresh,
    isExporting,
    onExportExcel,
    onOpenAddModal
  }) {
    return (
      <section className="controls-toolbar">
        <div className="search-filter-group">
          {/* Search Input */}
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="searchInput"
              placeholder="Search person, program, date, amount..."
              aria-label="Search records"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* 4 Dropdown Filters (2x2 Grid on Mobile) */}
          <div className="select-group">
            <select
              id="typeFilter"
              aria-label="Filter by Type"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Order">Orders</option>
              <option value="Sponsor">Sponsors</option>
              <option value="Coupon">Coupons</option>
            </select>

            <select
              id="paymentFilter"
              aria-label="Filter by Payment Mode"
              value={paymentFilter}
              onChange={(e) => onPaymentFilterChange(e.target.value)}
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="Gpay">GPay</option>
            </select>

            <select
              id="statusFilter"
              aria-label="Filter by Payment Status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              id="menuFilter"
              aria-label="Filter by Menu Type"
              value={menuFilter}
              onChange={(e) => onMenuFilterChange(e.target.value)}
            >
              <option value="All">All Menus</option>
              <option value="Light">Light (100)</option>
              <option value="Medium">Medium (160)</option>
              <option value="Heavy">Heavy (220)</option>
              <option value="Very Heavy">Very Heavy (250)</option>
            </select>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="action-btn-group">
          {/* Refresh Button with Spinner Animation */}
          <button
            id="refreshBtn"
            className={`btn btn-secondary ${isRefreshing ? 'spinning' : ''}`}
            disabled={isRefreshing}
            title="Force refresh from Google Sheet"
            onClick={onRefresh}
          >
            {isRefreshing ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            )}
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* Export to Excel Button with Feedback */}
          <button
            id="exportExcelBtn"
            type="button"
            className="btn btn-secondary"
            disabled={isExporting}
            title="Download month as Excel"
            onClick={onExportExcel}
          >
            {isExporting ? <BtnSpinner /> : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            )}
            <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>

          {/* Add Entry Button */}
          <button
            id="openAddModalBtn"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            title="Add New Order or Sponsor Entry"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>+ Add Order Entry</span>
          </button>
        </div>
      </section>
    );
  }

  return OrdersToolbar;
})();

window.KitchenComponents.OrdersToolbar = window.KitchenComponents.Orders.OrdersToolbar;

