// =============================================================================
// Orders & Sponsors Mobile Cards View
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersMobileCards = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;
  const Common = window.KitchenComponents?.Common || window.KitchenComponents || {};
  const TypeBadge = Common.TypeBadge || (() => null);
  const PaymentBadge = Common.PaymentBadge || (() => null);
  const PaymentStatusBadge = Common.PaymentStatusBadge || (() => null);
  const MobileLoadingBox = Common.MobileLoadingBox || (() => null);

  function OrdersMobileCards({
    records = [],
    isLoading = false,
    onEditRecord,
    onDeleteRecord
  }) {
    if (isLoading) {
      return (
        <div className="mobile-cards-list" id="mobileCardsList">
          <MobileLoadingBox message="Syncing transactions from Google Sheet..." />
        </div>
      );
    }

    if (records.length === 0) {
      return (
        <div className="mobile-cards-list" id="mobileCardsList">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            No matching records found.
          </div>
        </div>
      );
    }

    return (
      <div className="mobile-cards-list" id="mobileCardsList">
        {records.map((r) => {
          const isOrder = (r.type || '').trim().toLowerCase() === 'order';
          const hasDetails = (isOrder && (r.number_of_devotees || r.menu_type || r.cook_incentive)) || r.notes;

          return (
            <div key={r.id} className="record-card">
              <div className="record-card-header">
                <div>
                  <div className="record-card-title">{r.person_name}</div>
                  <div className="record-card-meta">
                    <span>{r.date}</span>
                    <span>&bull;</span>
                    <span>{r.program || 'General'}</span>
                  </div>
                </div>
                <div>
                  <span className="amount-display" style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                    ₹{formatCurrency(r.amount)}
                  </span>
                </div>
              </div>

              {hasDetails && (
                <div className="record-card-details">
                  {isOrder && r.number_of_devotees ? (
                    <span>Devotees: <strong>{r.number_of_devotees}</strong></span>
                  ) : null}
                  {isOrder && r.menu_type ? (
                    <span>Menu: <strong>{r.menu_type}</strong></span>
                  ) : null}
                  {isOrder && r.cook_incentive ? (
                    <span>Incentive: <strong style={{ color: 'var(--primary)' }}>₹{formatCurrency(r.cook_incentive)}</strong></span>
                  ) : null}
                  {r.notes ? (
                    <span>Notes: <em>{r.notes}</em></span>
                  ) : null}
                </div>
              )}

              <div className="record-card-body">
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <TypeBadge type={r.type} />
                  <PaymentBadge paymentThrough={r.payment_through} />
                  <PaymentStatusBadge paymentReceived={r.payment_received} />
                </div>
                <div className="record-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    aria-label={`Edit ${r.person_name}`}
                    onClick={() => onEditRecord(r)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    aria-label={`Delete ${r.person_name}`}
                    onClick={() => onDeleteRecord(r)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return React.memo ? React.memo(OrdersMobileCards) : OrdersMobileCards;
})();

window.KitchenComponents.OrdersMobileCards = window.KitchenComponents.Orders.OrdersMobileCards;

