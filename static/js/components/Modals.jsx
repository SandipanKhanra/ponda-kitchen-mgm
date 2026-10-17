// =============================================================================
// All Modal Dialogs (Orders, Vendors, Cooks, and Sheet Cloning)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Modals = (() => {
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
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
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

  // 4. Add Vendor Bill Modal
  function AddVendorEntryModal({ isOpen, availableVendors = [], defaultVendor = '', onClose, onSubmit, isSubmitting }) {
    const [selectedVendor, setSelectedVendor] = useState(defaultVendor || (availableVendors[0] || ''));
    const [newVendorName, setNewVendorName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(toIsoDate(null));
    const [notes, setNotes] = useState('');

    useEffect(() => {
      if (defaultVendor) {
        setSelectedVendor(defaultVendor);
      } else if (availableVendors.length > 0) {
        setSelectedVendor(availableVendors[0]);
      }
    }, [defaultVendor, availableVendors]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      const finalVendor = selectedVendor === '__new__' ? newVendorName.trim() : selectedVendor;
      if (!finalVendor) return;
      onSubmit({
        vendor_name: finalVendor,
        amount: parseFloat(amount || 0),
        date: toSheetDate(date),
        notes: notes.trim()
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Add Vendor Bill Entry</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor *</label>
                <select
                  required
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  {availableVendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="__new__">+ Register New Vendor...</option>
                </select>
              </div>

              {selectedVendor === '__new__' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>New Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter vendor / shop name"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Bill Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetables, Oil, Ghee, Spices"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Writing & Syncing...' : 'Save Entry & Sync to Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 5. Register New Vendor Modal
  function RegisterVendorModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [initialAmount, setInitialAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSubmit({
        vendor_name: name.trim(),
        initial_amount: parseFloat(initialAmount || 0)
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Register New Vendor</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balaji Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Initial Opening Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional, default 0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Registering...' : 'Add to Available Vendors'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 6. Edit Vendor Modal
  function EditVendorModal({ isOpen, vendor, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
      if (vendor) {
        setName(vendor.vendor_name || '');
        setAmount(vendor.amount || '');
      }
    }, [vendor]);

    if (!isOpen || !vendor) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(vendor.row_number, {
        vendor_name: name.trim(),
        amount: parseFloat(amount || 0)
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Edit Vendor: {vendor.vendor_name}</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Direct Sheet Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Updating Google Sheet...' : 'Update in Google Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 7. Vendor Bills Itemized Modal
  function VendorBillsModal({ isOpen, vendorName, bills = [], onClose, onAddBill, onDeleteBill }) {
    if (!isOpen || !vendorName) return null;

    const total = bills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div>
              <h3>Bills: {vendorName}</h3>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Total Calculated: ₹{formatCurrency(total)} ({bills.length} {bills.length === 1 ? 'bill' : 'bills'})
              </p>
            </div>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <div className="dialog-body">
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description / Notes</th>
                    <th>Amount (₹)</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No detailed bills logged yet for {vendorName}. Direct amount from sheet: ₹{formatCurrency(total)}
                      </td>
                    </tr>
                  ) : (
                    bills.map((b) => (
                      <tr key={b.id}>
                        <td>{b.date || '—'}</td>
                        <td>{b.notes || 'Grocery bill'}</td>
                        <td><span className="amount-display">₹{formatCurrency(b.amount)}</span></td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            onClick={() => onDeleteBill(b.id)}
                            title="Delete bill"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onAddBill(vendorName);
              }}
            >
              + Add Bill for {vendorName}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 8. Add Cook Modal
  function AddCookModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('Kitchen Cook');
    const [salary, setSalary] = useState('');
    const [festival, setFestival] = useState('1000');
    const [bonus, setBonus] = useState('0');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSubmit({
        name: name.trim(),
        role: role.trim(),
        base_salary: parseFloat(salary || 0),
        festival_allowance: parseFloat(festival || 0),
        yearly_bonus: parseFloat(bonus || 0)
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Add New Cook Profile</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Cook Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Prabhu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Head Cook / Assistant"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 15000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Festival Allowance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1000"
                    value={festival}
                    onChange={(e) => setFestival(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Yearly Bonus (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional, default 0"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Adding Cook & Syncing Sheet...' : 'Add Cook Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 9. Edit Cook Modal
  function EditCookModal({ isOpen, cook, onClose, onSubmit, isSubmitting }) {
    const [salary, setSalary] = useState('');
    const [festival, setFestival] = useState('');
    const [bonus, setBonus] = useState('');
    const [role, setRole] = useState('');

    useEffect(() => {
      if (cook) {
        setSalary(cook.base_salary || '');
        setFestival(cook.festival_allowance || 0);
        setBonus(cook.yearly_bonus || 0);
        setRole(cook.role || '');
      }
    }, [cook]);

    if (!isOpen || !cook) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(cook.id, {
        name: cook.name,
        base_salary: parseFloat(salary || 0),
        festival_allowance: parseFloat(festival || 0),
        yearly_bonus: parseFloat(bonus || 0),
        role: role.trim()
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Edit Payroll: {cook.name}</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Base Monthly Salary (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Festival Allowance (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={festival}
                    onChange={(e) => setFestival(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Yearly Bonus (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Updating Payroll & Sheet...' : 'Save Payroll Details'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 10. Create New Sheet Tab Modal
  function CreateSheetModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [sheetName, setSheetName] = useState('');
    const suggestions = ['May 26', 'June 26', 'July 26', 'August 26'];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!sheetName.trim()) return;
      onSubmit(sheetName.trim());
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Create New Month Sheet</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Clones the <strong>Master_Template</strong> structure into a brand new monthly worksheet.
              </p>
              <div className="form-group">
                <label>Sheet Tab Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. May 26"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '0.85rem' }}>
                <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggestions:</span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => setSheetName(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Cloning Master Template...' : 'Clone Template to Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return {
    AddOrderModal,
    EditOrderModal,
    DeleteOrderModal,
    AddVendorEntryModal,
    RegisterVendorModal,
    EditVendorModal,
    VendorBillsModal,
    AddCookModal,
    EditCookModal,
    CreateSheetModal
  };
})();

Object.assign(window.KitchenComponents, window.KitchenComponents.Modals);

