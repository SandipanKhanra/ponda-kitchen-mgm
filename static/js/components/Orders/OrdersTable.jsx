// =============================================================================
// Orders & Sponsors Desktop / Tablet Table View
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersTable = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;
  const Common = window.KitchenComponents?.Common || window.KitchenComponents || {};
  const TypeBadge = Common.TypeBadge || (() => null);
  const PaymentBadge = Common.PaymentBadge || (() => null);
  const PaymentStatusBadge = Common.PaymentStatusBadge || (() => null);
  const TableLoadingCell = Common.TableLoadingCell || (() => null);

  function OrdersTable({
    records = [],
    isLoading = false,
    onEditRecord,
    onDeleteRecord
  }) {
    const scrollWrapperRef = React.useRef(null);

    React.useEffect(() => {
      const el = scrollWrapperRef.current;
      if (!el) return;

      const onWheel = (e) => {
        if (el.scrollWidth > el.clientWidth) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
            const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
            const atRight = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth && e.deltaY > 0;
            if (!atLeft && !atRight) {
              el.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }
        }
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <div className="table-scroll-wrapper" id="recordsTableWrapper" ref={scrollWrapperRef}>
        <table className="data-table orders-table" aria-label="Transactions table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '95px' }}>Date</th>
              <th scope="col">Person / Sponsor</th>
              <th scope="col">Program / Occasion</th>
              <th scope="col">Type</th>
              <th scope="col">Devotees</th>
              <th scope="col">Menu</th>
              <th scope="col">Cook Share</th>
              <th scope="col">Amount (₹)</th>
              <th scope="col">Payment Mode</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right" style={{ width: '85px' }}>Actions</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {isLoading ? (
              <TableLoadingCell colSpan={11} message="Syncing transactions from Google Sheet..." />
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                  No matching records found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isOrder = (r.type || '').trim().toLowerCase() === 'order';
                const devCount = isOrder && r.number_of_devotees ? r.number_of_devotees : '—';
                const menuType = isOrder && r.menu_type ? r.menu_type : '—';
                const inc = isOrder && r.cook_incentive && r.cook_incentive > 0 ? `₹${formatCurrency(r.cook_incentive)}` : '—';

                return (
                  <tr key={r.id}>
                    <td>
                      <span className="order-date-text">{r.date}</span>
                    </td>
                    <td>
                      <div className="order-person-name">{r.person_name}</div>
                      {r.notes ? (
                        <div className="order-notes-subtitle" title={r.notes}>
                          📝 {r.notes}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="order-program-text">{r.program || '—'}</span>
                    </td>
                    <td>
                      <TypeBadge type={r.type} />
                    </td>
                    <td>
                      <span className="order-devotees-count">{devCount}</span>
                    </td>
                    <td>
                      <span className="category-tag">{menuType}</span>
                    </td>
                    <td>
                      <span className="order-cook-share">{inc}</span>
                    </td>
                    <td>
                      <span className="amount-display order-amount-text">₹{formatCurrency(r.amount)}</span>
                    </td>
                    <td>
                      <PaymentBadge paymentThrough={r.payment_through} />
                    </td>
                    <td>
                      <PaymentStatusBadge paymentReceived={r.payment_received} />
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit entry"
                          aria-label={`Edit entry ${r.person_name}`}
                          onClick={() => onEditRecord(r)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete entry"
                          aria-label={`Delete entry ${r.person_name}`}
                          onClick={() => onDeleteRecord(r)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
    );
  }

  return React.memo ? React.memo(OrdersTable) : OrdersTable;
})();

window.KitchenComponents.OrdersTable = window.KitchenComponents.Orders.OrdersTable;

