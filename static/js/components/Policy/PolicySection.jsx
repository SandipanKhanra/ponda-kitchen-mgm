// =============================================================================
// Kitchen Policy & Rules Section Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Policy = window.KitchenComponents.Policy || {};

window.KitchenComponents.Policy.PolicySection = (() => {
  const { React } = window;
  const { INCENTIVE_MATRIX, MENU_PRICES, formatCurrency } = window.KitchenConstants;

  function PolicySection() {
    const devoteeTiers = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const menuTypes = ["Very Heavy", "Heavy", "Medium", "Light"];

    return (
      <div id="pagePolicy" className="app-page active">
        {/* Header */}
        <section className="section-toolbar">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>ISKCON Ponda &bull; Kitchen Policy &amp; Accountability</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Official administrative guidelines, duty assignments, and profit incentive matrix (2025-26)
            </p>
          </div>
        </section>

        <div className="policy-grid">
          {/* Section 1: Rules & Responsibilities */}
          <div className="policy-card">
            <h3 className="policy-section-title">1. Standard Kitchen Rules</h3>
            <ul className="policy-list">
              <li>Strict adherence to Vaishnava kitchen hygiene and cleanliness standards at all times.</li>
              <li>Only pure, untasted vegetarian bhoga ingredients offered in devotion to Sri Sri Radha Govinda.</li>
              <li>All grocery purchases, vegetable purchases, and vendor expenses must be recorded on the day of purchase.</li>
              <li>Sponsorships and order collections must be collected in advance or on the program day itself.</li>
            </ul>

            <h3 className="policy-section-title" style={{ marginTop: '1.5rem' }}>2. Key Personnel Duties</h3>
            <div className="duty-block">
              <div className="duty-name">Manoranjan Pr (Head Cook)</div>
              <div className="duty-desc">Menu formulation, feast recipe preparation, devotee cooking operations, inventory stewardship.</div>
            </div>
            <div className="duty-block">
              <div className="duty-name">Chittaranjan Pr (Assistant Cook)</div>
              <div className="duty-desc">Assisting primary preparations, vegetable processing, subji cooking, spice blending and prasadam maintenance.</div>
            </div>
            <div className="duty-block">
              <div className="duty-name">Ranjan Pr (Assistant Cook)</div>
              <div className="duty-desc">Serving setup, cooking assistance, kitchen sanitization, utensil supervision and inventory checking.</div>
            </div>

            <h3 className="policy-section-title" style={{ marginTop: '1.5rem' }}>3. Committee Signatures</h3>
            <div className="committee-signatures-grid">
              <div className="signature-chip">
                <span className="sig-name">H.G. Mukunda Dasa</span>
                <span className="sig-role">Temple President</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">H.G. Brajaraj Dasa</span>
                <span className="sig-role">General Manager</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">H.G. Radha Vallabh Dasa</span>
                <span className="sig-role">Finance Coordinator</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Manoranjan Pr</span>
                <span className="sig-role">Kitchen Head</span>
              </div>
            </div>
          </div>

          {/* Section 2: Cook Incentive Matrix Table */}
          <div className="policy-card">
            <h3 className="policy-section-title">4. Section 3 Policy Matrix (Cook Profit Share)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Calculated dynamically per order and distributed directly to each cook as monthly profit sharing:
            </p>

            <div className="table-scroll-wrapper">
              <table className="data-table matrix-policy-table">
                <thead>
                  <tr>
                    <th>Menu Type</th>
                    <th>Rate / Devotee</th>
                    {devoteeTiers.map((t) => (
                      <th key={t}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {menuTypes.map((menu) => (
                    <tr key={menu}>
                      <td><strong>{menu}</strong></td>
                      <td><span className="badge badge-cash">₹{MENU_PRICES[menu]}</span></td>
                      {devoteeTiers.map((tier, idx) => {
                        const amount = INCENTIVE_MATRIX[menu][idx];
                        return (
                          <td key={tier}>
                            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>
                              ₹{formatCurrency(amount)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official PDF Document Embed */}
            <h3 className="policy-section-title" style={{ marginTop: '1.75rem' }}>5. Official Policy Document (PDF)</h3>
            <div style={{ marginTop: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <object
                data="/static/docs/ISKCON_Ponda_Kitchen_Policy.pdf"
                type="application/pdf"
                width="100%"
                height="450px"
              >
                <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-surface)' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Your browser does not support inline PDF viewing.
                  </p>
                  <a
                    href="/static/docs/ISKCON_Ponda_Kitchen_Policy.pdf"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Download Kitchen Policy PDF &nearr;
                  </a>
                </div>
              </object>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return PolicySection;
})();

window.KitchenComponents.PolicySection = window.KitchenComponents.Policy.PolicySection;

