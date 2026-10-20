// =============================================================================
// Orders & Sponsors KPI Stats Cards
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.StatsCards = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;

  function StatsCards({ metrics = {} }) {
    const totalCollections = metrics.total_collections || 0;
    const totalOrders = metrics.total_orders || 0;
    const totalSponsors = metrics.total_sponsors || 0;
    const cash = metrics.total_cash || 0;
    const gpay = metrics.total_gpay || 0;

    return (
      <section className="stats-grid" aria-label="Key Performance Indicators">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Collections</span>
            <span id="statTotalCollections" className="stat-value">₹{formatCurrency(totalCollections)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span id="statTotalOrders" className="stat-value">₹{formatCurrency(totalOrders)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Sponsorships</span>
            <span id="statTotalSponsors" className="stat-value">₹{formatCurrency(totalSponsors)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Payment Modes</span>
            <span id="statPaymentModes" className="stat-value" style={{ fontSize: '1.05rem' }}>
              Cash: ₹{formatCurrency(cash)} | GPay: ₹{formatCurrency(gpay)}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return React.memo ? React.memo(StatsCards) : StatsCards;
})();

window.KitchenComponents.StatsCards = window.KitchenComponents.Orders.StatsCards;

