// =============================================================================
// Common Reusable UI Components (Spinners, Badges, Modals)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Common = (() => {
  const { React } = window;

  function SpinnerModern({ size = 36 }) {
    return <div className="spinner-modern" style={{ width: size, height: size }} />;
  }

  function BtnSpinner() {
    return <span className="btn-spinner" />;
  }

  function TableLoadingCell({ colSpan = 11, message = "Synchronizing data with Google Sheet..." }) {
    return (
      <tr>
        <td colSpan={colSpan} className="table-loading-cell">
          <div className="loading-state-box">
            <SpinnerModern />
            <div className="loading-state-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{message}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  function MobileLoadingBox({ message = "Synchronizing data with Google Sheet..." }) {
    return (
      <div className="loading-state-box mobile-loading-box">
        <SpinnerModern />
        <div className="loading-state-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  function StatusBadge({ mode, spreadsheetTitle, isSyncing }) {
    let badgeClass = 'status-badge status-loading';
    let text = 'Connecting...';

    if (isSyncing) {
      badgeClass = 'status-badge status-syncing';
      text = 'Syncing Google Sheets...';
    } else if (mode === 'google_sheets') {
      badgeClass = 'status-badge status-google';
      text = `Google Sheets: ${spreadsheetTitle || 'Connected'}`;
    } else if (mode === 'local_excel') {
      badgeClass = 'status-badge status-excel';
      text = 'Local Excel Mode';
    }

    return (
      <div id="statusBadge" className={badgeClass} title="Connection status">
        <span className="status-dot"></span>
        <span id="statusText">{text}</span>
      </div>
    );
  }

  function TypeBadge({ type }) {
    const t = (type || 'Order').trim();
    const lower = t.toLowerCase();
    let badgeClass = 'badge badge-order';
    if (lower === 'sponsor') badgeClass = 'badge badge-sponsor';
    if (lower.includes('coupon')) badgeClass = 'badge badge-in-progress';
    return <span className={badgeClass}>{t}</span>;
  }

  function PaymentBadge({ paymentThrough }) {
    const pay = (paymentThrough || 'Cash').trim();
    const isCash = pay.toLowerCase().includes('cash');
    return <span className={`badge ${isCash ? 'badge-cash' : 'badge-gpay'}`}>{pay}</span>;
  }

  function PaymentStatusBadge({ paymentReceived }) {
    const rcvd = (paymentReceived || '').trim().toLowerCase();
    const isPaid = rcvd === 'yes' || rcvd === 'paid' || rcvd === 'done' || rcvd === 'y';
    return (
      <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>
        {isPaid ? 'Paid' : 'Pending'}
      </span>
    );
  }

  const memo = React.memo || ((c) => c);

  return {
    SpinnerModern: memo(SpinnerModern),
    BtnSpinner: memo(BtnSpinner),
    TableLoadingCell: memo(TableLoadingCell),
    MobileLoadingBox: memo(MobileLoadingBox),
    StatusBadge: memo(StatusBadge),
    TypeBadge: memo(TypeBadge),
    PaymentBadge: memo(PaymentBadge),
    PaymentStatusBadge: memo(PaymentStatusBadge)
  };
})();

Object.assign(window.KitchenComponents, window.KitchenComponents.Common);

