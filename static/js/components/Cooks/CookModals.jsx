// =============================================================================
// Cooks Domain Modals (Add Cook Profile, Edit Cook Payroll)
// SOLID: Single Responsibility Principle (SRP) for Cook & Payroll Management
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Cooks = window.KitchenComponents.Cooks || {};

(() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  // 1. Add Cook Profile Modal
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

  // 2. Edit Cook Payroll Modal
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

  window.KitchenComponents.Cooks.AddCookModal = AddCookModal;
  window.KitchenComponents.Cooks.EditCookModal = EditCookModal;

  window.KitchenComponents.AddCookModal = AddCookModal;
  window.KitchenComponents.EditCookModal = EditCookModal;
})();

