// =============================================================================
// Kitchen Policy & Rules Section Component (Mobile-Optimized React 18)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Policy = window.KitchenComponents.Policy || {};

window.KitchenComponents.Policy.PolicySection = (() => {
  const { React } = window;
  const { INCENTIVE_MATRIX, MENU_PRICES, formatCurrency } =
    window.KitchenConstants;

  // Hoisted static data references to prevent allocation on re-render
  const DEVOTEE_TIERS = [
    "Upto 25",
    "From 26 to 50",
    "From 51 to 75",
    "From 76 to 100",
    "From 101 to 125",
    "From 126 to 150",
    "From 151 to 175",
    "From 176 to 200",
    "From 201 to 225",
    "From 226 to 250",
  ];
  const MENU_TYPES = ["Very Heavy", "Heavy", "Medium", "Light"];

  function PolicySection() {
    const devoteeTiers = DEVOTEE_TIERS;
    const menuTypes = MENU_TYPES;

    return (
      <div id="pagePolicy" className="app-page active">
        {/* Header Toolbar */}
        <section className="section-toolbar">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              ISKCON Ponda &bull; Kitchen Policy &amp; Accountability
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Official administrative guidelines, duty assignments, and profit
              incentive matrix (2025-26)
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
                <span className="policy-section-sub">
                  Vaishnava kitchen hygiene, seva discipline and bhoga offering
                  protocols
                </span>
              </div>
            </div>
            <ul className="policy-list">
              <li>
                Clean the kitchen before each new cooking begins; all cooking
                must be done after a proper bath and cleanliness.
              </li>
              <li>
                Only pure, untasted vegetarian bhoga ingredients offered first
                to Sri Sri Radha Gopinath. No unoffered prasadam allowed.
              </li>
              <li>
                Cooks should ensure bhoga is ready 15 mins prior to offering.
                Breakfast, lunch, and dinner prepared as per menu list and
                temple timing.
              </li>
              <li>
                All orders, tiffins, and sponsors must be reported to the
                Kitchen In-charge. Cooks cannot take independent orders without
                informing the in-charge.
              </li>
              <li>
                All grocery purchases, vegetable purchases, and vendor expenses
                must be recorded on the day of purchase.
              </li>
            </ul>
          </div>

          {/* Section 2: Key Personnel Duties */}
          <div className="policy-card">
            <div className="policy-card-header">
              <span className="policy-num-badge">2</span>
              <div>
                <h3 className="policy-section-title">
                  Cleaning &amp; Maintenance Responsibilities
                </h3>
                <span className="policy-section-sub">
                  Assigned areas and machines as per Section A.15 of Kitchen
                  Policy
                </span>
              </div>
            </div>
            <div className="duty-block">
              <div className="duty-name">
                Jitendra Prabhu (Kitchen In-charge)
              </div>
              <div className="duty-desc">
                Area: Prasadam Hall (must always be neat and clean), Store Room
                &bull; Machines: Big Vegetable Cutting Machine, Big Grinder, Two
                Weighing Machines
              </div>
            </div>
            <div className="duty-block">
              <div className="duty-name">Chittaranjan Prabhu (Cook)</div>
              <div className="duty-desc">
                Area: Main Kitchen, Wooden Chulha Area &bull; Machines: Fridge,
                Mixer
              </div>
            </div>
            <div className="duty-block">
              <div className="duty-name">Manoranjan Prabhu (Cook)</div>
              <div className="duty-desc">
                Area: Main Kitchen, Wooden Chulha Area &bull; Machines: Coconut
                Grater, Atta Making Machine
              </div>
            </div>
            <div className="duty-block">
              <div className="duty-name">Ranjan Prabhu (Cook)</div>
              <div className="duty-desc">
                Area: Main Kitchen, Wooden Chulha Area &bull; Machines: Tomato
                Puree Machine, Potato Peeler
              </div>
            </div>
          </div>

          {/* Section 3: Sub-Committee Confirmation & Approval */}
          <div className="policy-card full-width">
            <div className="policy-card-header">
              <span className="policy-num-badge">3</span>
              <div>
                <h3 className="policy-section-title">
                  Sub-Committee Confirmation &amp; Approval
                </h3>
                <span className="policy-section-sub">
                  Reviewed, confirmed, and approved by the Sub-Committee Members
                  (Official Policy Document)
                </span>
              </div>
            </div>
            <div className="committee-signatures-grid">
              <div className="signature-chip">
                <span className="sig-name">Sushant Caitanya Prabhu</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Anant Lila Prabhu</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Sankarshan Priya Prabhu</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Vishnu Charan Prabhu</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Sarva Lakshami Mataji</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
              <div className="signature-chip">
                <span className="sig-name">Rupesh Naik Prabhu</span>
                <span className="sig-role">Sub-Committee Member</span>
              </div>
            </div>
          </div>

          {/* Section 4: Scale of Incentive Matrix */}
          <div className="policy-card full-width">
            <div className="policy-card-header">
              <span className="policy-num-badge">4</span>
              <div>
                <h3 className="policy-section-title">
                  Scale of Incentive for Kitchen Employees Towards ISKCON Order
                  Prasad
                </h3>
                <span className="policy-section-sub">
                  Section 3 Policy Matrix: Allowances &amp; Incentives as per
                  attendee slabs (Upto 25, From 26 to 50, etc.)
                </span>
              </div>
            </div>

            <div className="table-scroll-hint">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="13 17 18 12 13 7"></polyline>
                <polyline points="6 17 11 12 6 7"></polyline>
              </svg>
              <span>
                Swipe table horizontally to view all attendee slabs (Upto 25,
                From 26 to 50... to 250)
              </span>
            </div>

            <div className="table-scroll-wrapper">
              <table className="data-table matrix-policy-table">
                <thead>
                  <tr>
                    <th className="sticky-col">Menus</th>
                    <th>Rate / Plate</th>
                    {devoteeTiers.map((t) => (
                      <th
                        key={t}
                        style={{ whiteSpace: "nowrap", textAlign: "center" }}
                      >
                        {t}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {menuTypes.map((menu) => (
                    <tr key={menu}>
                      <td className="sticky-col">
                        <strong>{menu}</strong>
                      </td>
                      <td>
                        <span className="badge badge-cash">
                          ₹{MENU_PRICES[menu]}/plate
                        </span>
                      </td>
                      {devoteeTiers.map((tier, idx) => {
                        const amount = INCENTIVE_MATRIX[menu][idx];
                        return (
                          <td key={tier} style={{ textAlign: "center" }}>
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
                <h3 className="policy-section-title">
                  Official Policy Document
                </h3>
                <span className="policy-section-sub">
                  Signed administrative policy resolution and bylaws (PDF
                  format)
                </span>
              </div>
            </div>

            {/* Mobile-Friendly PDF Card with Direct Action */}
            <div className="pdf-doc-card">
              <div className="pdf-doc-info">
                <div className="pdf-doc-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div>
                  <div className="pdf-doc-title">
                    ISKCON_Ponda_Kitchen_Policy.pdf
                  </div>
                  <div className="pdf-doc-meta">
                    <span className="pdf-doc-badge">
                      Official Signed Resolution
                    </span>
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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
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

  return React.memo ? React.memo(PolicySection) : PolicySection;
})();

window.KitchenComponents.PolicySection =
  window.KitchenComponents.Policy.PolicySection;
