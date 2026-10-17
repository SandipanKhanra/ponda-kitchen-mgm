// =============================================================================
// Vendors Domain Modals (Add Entry, Register, Direct Edit, Itemized Bills)
// SOLID: Single Responsibility Principle (SRP) for Vendor Operations
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Vendors = window.KitchenComponents.Vendors || {};

(() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const {
    formatCurrency,
    toIsoDate,
    toSheetDate
  } = window.KitchenConstants;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  // 1. Add Vendor Bill Entry Modal
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

  // 2. Register New Vendor Modal
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

  // 3. Edit Vendor Direct Sheet Amount Modal
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

  // 4. Vendor Bills Itemized Modal
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

  window.KitchenComponents.Vendors.AddVendorEntryModal = AddVendorEntryModal;
  window.KitchenComponents.Vendors.RegisterVendorModal = RegisterVendorModal;
  window.KitchenComponents.Vendors.EditVendorModal = EditVendorModal;
  window.KitchenComponents.Vendors.VendorBillsModal = VendorBillsModal;

  window.KitchenComponents.AddVendorEntryModal = AddVendorEntryModal;
  window.KitchenComponents.RegisterVendorModal = RegisterVendorModal;
  window.KitchenComponents.EditVendorModal = EditVendorModal;
  window.KitchenComponents.VendorBillsModal = VendorBillsModal;
})();

