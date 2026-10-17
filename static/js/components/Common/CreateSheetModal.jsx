// =============================================================================
// Create New Month Sheet Modal (Template Cloning)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Common = window.KitchenComponents.Common || {};

window.KitchenComponents.Common.CreateSheetModal = (() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  function CreateSheetModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [sheetName, setSheetName] = useState('');

    useEffect(() => {
      if (isOpen) {
        setSheetName('');
      }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!sheetName.trim()) return;
      onSubmit(sheetName.trim());
    };

    const suggestions = ['May 26', 'June 26', 'July 26', 'Aug 26', 'Sept 26', 'Oct 26', 'Nov 26', 'Dec 26'];

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

  return CreateSheetModal;
})();

window.KitchenComponents.CreateSheetModal = window.KitchenComponents.Common.CreateSheetModal;

