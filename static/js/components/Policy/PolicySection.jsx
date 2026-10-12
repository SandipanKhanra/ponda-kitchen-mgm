// =============================================================================
// Kitchen Policy & Rules Section Component (Mobile-Optimized React 18)
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
        {/* Header Toolbar */}
        <section className="section-toolbar">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>ISKCON Ponda &bull; Kitchen Policy &amp; Accountability</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Official administrative guidelines, duty assignments, and profit incentive matrix (2025-26)
            </p>
          </div>
        </section>

        <div className="policy-grid">
          {/* Section 1: Standard Kitchen Rules */}
          <div className="policy-card">
            <div className="policy-card-header">
              <span className="policy-num-badge">1</span>
              <div>
                <h3 className="policy-section-title">Standard Kitchen Rules</h3>
                <span className="policy-section-sub">Vaishnava kitchen hygiene, seva discipline and bhoga offering protocols</span>
              </div>
            </div>
            <ul className="policy-list">
              <li>Strict adherence to Vaishnava kitchen hygiene and cleanliness standards at all times.</li>
              <li>Only pure, untasted vegetarian bhoga ingredients offered in devotion to Sri Sri Radha Govinda.</li>
              <li>All grocery purchases, vegetable purchases, and vendor expenses must be recorded on the day of purchase.</li>
              <li>Sponsorships and order collections must be collected in advance or on the program day itself.</li>
            </ul>
          </div>

          {/* Section 2: Key Personnel Duties */}
          <div className="policy-card">
            <div className="policy-card-header">
              <span className="policy-num-badge">2</span>
              <div>
                <h3 className="policy-section-title">Key Personnel Duties</h3>
                <span className="policy-section-sub">Kitchen operations, cooking seva, and prasadam stewardship</span>
              </div>
            </div>
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
          </div>

          {/* Section 3: Committee Signatures */}
          <div className="policy-card full-width">
            <div className="policy-card-header">
              <span className="policy-num-badge">3</span>
              <div>
                <h3 className="policy-section-title">Committee Signatures</h3>
                <span className="policy-section-sub">Approved governing administration and department coordinators (2025-26)</span>
              </div>
            </div>
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

          {/* Section 4: Cook Profit Share Matrix */}
          <div className="policy-card full-width">
            <div className="policy-card-header">
              <span className="policy-num-badge">4</span>
              <div>
                <h3 className="policy-section-title">Section 3 Policy Matrix (Cook Profit Share)</h3>
                <span className="policy-section-sub">Dynamic per-order profit incentive calculated across devotee attendance tiers</span>
              </div>
            </div>

            <div className="table-scroll-hint">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              <span>Swipe table horizontally to view all devotee tiers (10 to 100)</span>
            </div>

            <div className="table-scroll-wrapper">
              <table className="data-table matrix-policy-table">
                <thead>
                  <tr>
                    <th className="sticky-col">Menu Type</th>
                    <th>Rate / Devotee</th>
                    {devoteeTiers.map((t) => (
                      <th key={t}>{t} Devotees</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {menuTypes.map((menu) => (
                    <tr key={menu}>
                      <td className="sticky-col"><strong>{menu}</strong></td>
                      <td><span className="badge badge-cash">₹{MENU_PRICES[menu]}</span></td>
                      {devoteeTiers.map((tier, idx) => {
                        const amount = INCENTIVE_MATRIX[menu][idx];
                        return (
                          <td key={tier}>
                            <span className="matrix-amount">
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
          </div>

          {/* Section 5: Official Policy Document */}
          <div className="policy-card full-width">
            <div className="policy-card-header">
              <span className="policy-num-badge">5</span>
              <div>
                <h3 className="policy-section-title">Official Policy Document</h3>
                <span className="policy-section-sub">Signed administrative policy resolution and bylaws (PDF format)</span>
              </div>
            </div>

            {/* Mobile-Friendly PDF Card with Direct Action */}
            <div className="pdf-doc-card">
              <div className="pdf-doc-info">
                <div className="pdf-doc-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="pdf-doc-title">ISKCON_Ponda_Kitchen_Policy.pdf</div>
                  <div className="pdf-doc-meta">
                    <span className="pdf-doc-badge">Official Signed Resolution</span>
                    <span>&bull;</span>
                    <span>Temple Administration 2025-26</span>
                  </div>
                </div>
              </div>
              <a
                href="/static/docs/ISKCON_Ponda_Kitchen_Policy.pdf"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary pdf-open-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <span>Open Official PDF ↗</span>
              </a>
            </div>

            {/* Desktop Inline Viewer (Hidden on mobile devices to prevent touch scroll traps) */}
            <div className="pdf-embed-wrapper hide-mobile">
              <object
                data="/static/docs/ISKCON_Ponda_Kitchen_Policy.pdf"
                type="application/pdf"
                width="100%"
                height="480px"
              >
                <div className="pdf-fallback-box">
                  <p>Your browser does not support inline PDF viewing.</p>
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
