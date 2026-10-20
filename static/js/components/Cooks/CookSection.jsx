// =============================================================================
// Cook Management & Payroll Section Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Cooks = window.KitchenComponents.Cooks || {};

window.KitchenComponents.Cooks.CookSection = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;
  const SpinnerModern = window.KitchenComponents?.Common?.SpinnerModern || window.KitchenComponents?.SpinnerModern || (() => <div className="spinner-modern" />);

  function CookSection({
    cooksData = {},
    currentTab = '',
    isLoading = false,
    onOpenAddCook,
    onOpenEditCook,
    onDeleteCook
  }) {
    const cooks = cooksData.cooks || [];
    const cookCount = cooksData.cook_count || cooks.length;
    const incentivePool = cooksData.total_cook_incentive || 0;
    const totalPayroll = cooksData.total_payroll || 0;

    return (
      <div id="pageCooks" className="app-page active">
        {/* Cook Management Header */}
        <section className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>Cook Management &amp; Profit Sharing</h2>
              <span className="badge badge-cash" id="cookCurrentTabBadge" style={{ fontSize: '0.85rem' }}>
                {currentTab}
              </span>
            </div>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Monthly compensation calculated dynamically using Policy Section 3 Matrix
            </p>
          </div>
          <div className="section-header-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddCook}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add New Cook</span>
            </button>
          </div>
        </section>

        {/* Cook Stats Grid */}
        <section className="stats-grid" aria-label="Cook Statistics">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Registered Cooks</span>
              <span id="statCookCount" className="stat-value">{cookCount}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M16 8l-8 8" />
                <path d="M12 16h4" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Matrix Order Incentive Pool</span>
              <span id="statCookIncentivePool" className="stat-value" style={{ fontSize: '1.2rem' }}>
                ₹{formatCurrency(incentivePool)} per cook
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-green">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Monthly Payroll</span>
              <span id="statTotalPayroll" className="stat-value">₹{formatCurrency(totalPayroll)}</span>
            </div>
          </div>
        </section>

        {/* Cook Cards Grid */}
        <section className="cook-cards-grid" id="cookCardsGrid">
          {isLoading ? (
            <div className="loading-state-box cook-loading-box" style={{ gridColumn: '1 / -1' }}>
              <SpinnerModern />
              <div className="loading-state-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
                <span>Calculating cook payroll and incentives from Sheet...</span>
              </div>
            </div>
          ) : cooks.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '3.5rem' }}>
              No cooks configured yet. Click &quot;Add New Cook&quot; above.
            </div>
          ) : (
            cooks.map((c) => {
              const totalPayout = (c.base_salary || 0) + (c.matrix_share || 0) + (c.festival_allowance || 0) + (c.yearly_bonus || 0);

              return (
                <div key={c.id || c.name} className="cook-card">
                  <div className="cook-card-header">
                    <div>
                      <div className="cook-name">{c.name}</div>
                      <div className="cook-role-badge">{c.role || 'Kitchen Cook'}</div>
                    </div>
                    <div className="cook-share-pill" style={{ background: 'var(--success-bg)', color: 'var(--success)', borderColor: '#a7f3d0' }}>
                      Order Incentive
                    </div>
                  </div>

                  <div className="cook-salary-breakdown">
                    <div className="salary-line">
                      <span className="salary-line-label">Base Monthly Salary:</span>
                      <span className="salary-line-value">₹{formatCurrency(c.base_salary)}</span>
                    </div>
                    <div className="salary-line highlight-incentive">
                      <span className="salary-line-label">Order Incentive (Devotees &amp; Menu):</span>
                      <span className="salary-line-value" style={{ color: 'var(--primary)', fontWeight: 800 }}>
                        ₹{formatCurrency(c.matrix_share)}
                      </span>
                    </div>
                    <div className="salary-line">
                      <span className="salary-line-label">Festival Allowance:</span>
                      <span className="salary-line-value">₹{formatCurrency(c.festival_allowance)}</span>
                    </div>
                    {c.yearly_bonus > 0 && (
                      <div className="salary-line">
                        <span className="salary-line-label">Yearly Bonus:</span>
                        <span className="salary-line-value">₹{formatCurrency(c.yearly_bonus)}</span>
                      </div>
                    )}
                  </div>

                  <div className="cook-total-payout">
                    <span className="payout-label">Total Monthly Payout:</span>
                    <span className="payout-amount">₹{formatCurrency(totalPayout)}</span>
                  </div>

                  <div className="cook-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => onOpenEditCook(c)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      <span>Edit Payroll</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteCook(c.id, c.name)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    );
  }

  return React.memo ? React.memo(CookSection) : CookSection;
})();

window.KitchenComponents.CookSection = window.KitchenComponents.Cooks.CookSection;

