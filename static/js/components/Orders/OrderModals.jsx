// =============================================================================
// Orders Domain Modals (Add, Edit, Delete Order / Sponsor / Coupon)
// SOLID: Single Responsibility Principle (SRP) for Order Transaction Modals
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

(() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const {
    formatCurrency,
    toIsoDate,
    toSheetDate,
    calculateIncentiveClient,
    calculateOrderPricingClient
  } = window.KitchenConstants;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  // 1. Add Order / Sponsor Modal
  function AddOrderModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [date, setDate] = useState(() => toIsoDate(null));
    const [person, setPerson] = useState('');
    const [program, setProgram] = useState('');
    const [type, setType] = useState('Order');
    const [payment, setPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    const [received, setReceived] = useState('Yes');
    const [notes, setNotes] = useState('');
    const [devotees, setDevotees] = useState('');
    const [menu, setMenu] = useState('Medium');

    const isOrder = type.trim().toLowerCase() === 'order';
    const numDevotees = parseInt(devotees, 10) || 0;
    const liveIncentive = isOrder ? calculateIncentiveClient(numDevotees, menu) : 0;

    // Reset when modal opens
    useEffect(() => {
      if (isOpen) {
        setDate(toIsoDate(null));
        setPerson('');
        setProgram('');
        setType('Order');
        setPayment('Cash');
        setAmount('');
        setReceived('Yes');
        setNotes('');
        setDevotees('');
        setMenu('Medium');
      }
    }, [isOpen]);

    // Auto-update amount for orders when devotees/menu changes
    useEffect(() => {
      if (isOrder && numDevotees > 0 && menu) {
        const calculatedAmount = calculateOrderPricingClient(numDevotees, menu);
        setAmount(calculatedAmount || '');
      }
    }, [isOrder, numDevotees, menu]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({
        date: toSheetDate(date),
        person_name: person.trim(),
        program: program.trim(),
        type,
        payment_through: payment,
        amount: parseFloat(amount || 0),
        payment_received: received,
        notes: notes.trim(),
        number_of_devotees: isOrder ? numDevotees : 0,
        menu_type: isOrder ? menu : ''
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="modal-title-group">
              <div className="modal-title-icon icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div>
                <h3 className="dialog-title">Add New Order Entry</h3>
                <p className="dialog-subtitle">Record feast order, sponsorship or coupon into Google Sheet</p>
              </div>
            </div>
            <button type="button" className="btn-icon modal-close-btn" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order (Feast Catering)</option>
                    <option value="Sponsor">Sponsor (Donation)</option>
                    <option value="Coupon">Coupon (Prasadam)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required placeholder="e.g. Ramesh Prabhu / Bhakta Amit" value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" placeholder="e.g. Sunday Feast, Appearance Day" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
              </div>

              {isOrder && (
                <div className="order-details-box">
                  <div className="order-details-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Feast Order Pricing &amp; Incentive</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Devotees *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 50"
                        value={devotees}
                        onChange={(e) => setDevotees(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Menu Tier *</label>
                      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
                        <option value="Light">Light (₹100 / plate)</option>
                        <option value="Medium">Medium (₹160 / plate)</option>
                        <option value="Heavy">Heavy (₹220 / plate)</option>
                        <option value="Very Heavy">Very Heavy (₹250 / plate)</option>
                      </select>
                    </div>
                  </div>

                  {liveIncentive > 0 && (
                    <div className="incentive-preview-box">
                      <div className="incentive-preview-main">
                        <span className="incentive-label">Section 3 Cook Incentive:</span>
                        <span className="incentive-badge">₹{formatCurrency(liveIncentive)}</span>
                      </div>
                      <span className="incentive-sub">(Added dynamically to each active cook)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Amount (₹) *
                    {isOrder && <span className="auto-calc-badge">Auto-Calculated</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={isOrder ? 'Auto-calculated for Orders' : 'Enter amount in ₹'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Channel *</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay / UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className={received === 'Yes' ? 'select-status-paid' : 'select-status-pending'}
                  >
                    <option value="Yes">Paid (Received)</option>
                    <option value="No">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Comments</label>
                  <input type="text" placeholder="Optional notes or receipt #" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <span>{isSubmitting ? 'Syncing to Sheet...' : 'Add Order Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Edit Order / Sponsor Modal
  function EditOrderModal({ isOpen, record, onClose, onSubmit, isSubmitting }) {
    const [date, setDate] = useState('');
    const [person, setPerson] = useState('');
    const [program, setProgram] = useState('');
    const [type, setType] = useState('Order');
    const [payment, setPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    const [received, setReceived] = useState('Yes');
    const [notes, setNotes] = useState('');
    const [devotees, setDevotees] = useState('');
    const [menu, setMenu] = useState('Medium');

    useEffect(() => {
      if (record) {
        const isOrd = (record.type || '').trim().toLowerCase() === 'order';
        setDate(toIsoDate(record.date));
        setPerson(record.person_name || '');
        setProgram(record.program || '');
        setType(record.type || 'Order');
        setPayment(record.payment_through || 'Cash');
        setAmount(record.amount || '');
        const rcvdRaw = (record.payment_received || '').trim().toLowerCase();
        const isPaid = rcvdRaw === 'yes' || rcvdRaw === 'paid' || rcvdRaw === 'done' || rcvdRaw === 'y';
        setReceived(isPaid ? 'Yes' : 'No');
        setNotes(record.notes || '');
        setDevotees(isOrd && record.number_of_devotees ? record.number_of_devotees : '');
        setMenu(isOrd && record.menu_type ? record.menu_type : 'Medium');
      }
    }, [record]);

    if (!isOpen || !record) return null;

    const isOrder = type.trim().toLowerCase() === 'order';
    const numDevotees = parseInt(devotees, 10) || 0;
    const liveIncentive = isOrder ? calculateIncentiveClient(numDevotees, menu) : 0;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(record.id, {
        date: toSheetDate(date),
        person_name: person.trim(),
        program: program.trim(),
        type,
        payment_through: payment,
        amount: parseFloat(amount || 0),
        payment_received: received,
        notes: notes.trim(),
        number_of_devotees: isOrder ? numDevotees : 0,
        menu_type: isOrder ? menu : ''
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="modal-title-group">
              <div className="modal-title-icon icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="dialog-title">Edit Order / Transaction</h3>
                <p className="dialog-subtitle">Update record #{record.id} and sync updates to Google Sheet</p>
              </div>
            </div>
            <button type="button" className="btn-icon modal-close-btn" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order (Feast Catering)</option>
                    <option value="Sponsor">Sponsor (Donation)</option>
                    <option value="Coupon">Coupon (Prasadam)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
              </div>

              {isOrder && (
                <div className="order-details-box">
                  <div className="order-details-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Feast Order Pricing &amp; Incentive</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Devotees</label>
                      <input
                        type="number"
                        min="1"
                        value={devotees}
                        onChange={(e) => setDevotees(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Menu Tier</label>
                      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
                        <option value="Light">Light (₹100 / plate)</option>
                        <option value="Medium">Medium (₹160 / plate)</option>
                        <option value="Heavy">Heavy (₹220 / plate)</option>
                        <option value="Very Heavy">Very Heavy (₹250 / plate)</option>
                      </select>
                    </div>
                  </div>

                  {liveIncentive > 0 && (
                    <div className="incentive-preview-box">
                      <div className="incentive-preview-main">
                        <span className="incentive-label">Section 3 Cook Incentive:</span>
                        <span className="incentive-badge">₹{formatCurrency(liveIncentive)}</span>
                      </div>
                      <span className="incentive-sub">(Added dynamically to each active cook)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Amount (₹) *
                    {isOrder && <span className="auto-calc-badge">Auto-Calculated</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Channel *</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay / UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className={received === 'Yes' ? 'select-status-paid' : 'select-status-pending'}
                  >
                    <option value="Yes">Paid (Received)</option>
                    <option value="No">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Comments</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <span>{isSubmitting ? 'Updating in Sheet...' : 'Save & Update in Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Delete Order Modal
  function DeleteOrderModal({ isOpen, record, onClose, onConfirm, isDeleting }) {
    if (!isOpen || !record) return null;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Confirm Deletion</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <div className="dialog-body">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to remove this record from the sheet?
            </p>
            <div style={{ background: 'var(--border-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong>{record.person_name}</strong> &bull; ₹{formatCurrency(record.amount)} ({record.date})
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? <BtnSpinner /> : null}
              <span>{isDeleting ? 'Removing from Sheet...' : 'Delete from Sheet'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.KitchenComponents.Orders.AddOrderModal = AddOrderModal;
  window.KitchenComponents.Orders.EditOrderModal = EditOrderModal;
  window.KitchenComponents.Orders.DeleteOrderModal = DeleteOrderModal;

  window.KitchenComponents.AddOrderModal = AddOrderModal;
  window.KitchenComponents.EditOrderModal = EditOrderModal;
  window.KitchenComponents.DeleteOrderModal = DeleteOrderModal;
})();

