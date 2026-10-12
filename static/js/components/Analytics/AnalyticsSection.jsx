// =============================================================================
// Donation Analytics Section Component (Interactive SVG Donut & Bifurcations)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Analytics = window.KitchenComponents.Analytics || {};

window.KitchenComponents.Analytics.AnalyticsSection = (() => {
  const { React } = window;
  const { useState, useMemo } = React;
  const { CHART_COLORS, formatCurrency } = window.KitchenConstants;

  function AnalyticsSection({ metrics = {} }) {
    const [activeBifurcation, setActiveBifurcation] = useState('type'); // 'type', 'payment', 'program', 'status', 'menu'

    const { dataset, title } = useMemo(() => {
      let data = {};
      let t = 'Total';

      if (activeBifurcation === 'type') {
        data = metrics.bifurcation_type || {};
        t = 'By Type';
      } else if (activeBifurcation === 'payment') {
        data = metrics.bifurcation_payment || {};
        t = 'Payment';
      } else if (activeBifurcation === 'program') {
        data = metrics.bifurcation_program || {};
        t = 'Programs';
      } else if (activeBifurcation === 'status') {
        data = metrics.bifurcation_status || {};
        t = 'Status';
      } else if (activeBifurcation === 'menu') {
        data = metrics.bifurcation_menu || {};
        t = 'Menus';
      }

      return { dataset: data, title: t };
    }, [metrics, activeBifurcation]);

    const items = useMemo(() => {
      return Object.entries(dataset)
        .filter(([_, val]) => val > 0)
        .sort((a, b) => b[1] - a[1]);
    }, [dataset]);

    const total = useMemo(() => {
      return items.reduce((acc, [_, val]) => acc + val, 0);
    }, [items]);

    // Donut SVG Arc Math
    const radius = 38;
    const circumference = 2 * Math.PI * radius;

    let accumulatedOffset = 0;
    const slices = items.map(([label, value], i) => {
      const percentage = total > 0 ? value / total : 0;
      const strokeDasharray = `${percentage * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += percentage * circumference;

      let color = CHART_COLORS[i % CHART_COLORS.length];
      if (activeBifurcation === 'status') {
        const lbl = label.toLowerCase();
        if (lbl === 'paid' || lbl === 'received') color = '#10b981';
        else if (lbl === 'pending') color = '#f59e0b';
      }

      return {
        label,
        value,
        percentage: (percentage * 100).toFixed(1),
        color,
        strokeDasharray,
        strokeDashoffset
      };
    });

    return (
      <div id="pageAnalytics" className="app-page active">
        {/* Analytics Header */}
        <section className="section-toolbar">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Donation &amp; Revenue Analytics</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Bifurcation of collections across transaction types, payment channels and menus
            </p>
          </div>
        </section>

        {/* Analytics Visuals Grid */}
        <div className="analytics-grid">
          {/* Donut Chart Card */}
          <div className="analytics-card">
            <h3 className="analytics-card-title">Collections Breakdown</h3>
            <div className="donut-chart-container">
              <div className="donut-svg-wrapper">
                <svg viewBox="0 0 100 100" id="donutSvg" className="donut-svg">
                  {total === 0 || slices.length === 0 ? (
                    <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                  ) : (
                    slices.map((slice, i) => (
                      <circle
                        key={slice.label}
                        cx="50"
                        cy="50"
                        r={radius}
                        fill="none"
                        stroke={slice.color}
                        strokeWidth="12"
                        strokeDasharray={slice.strokeDasharray}
                        strokeDashoffset={slice.strokeDashoffset}
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                      />
                    ))
                  )}
                </svg>
                <div className="donut-center-info">
                  <span id="donutCenterAmount" className="center-amount">₹{formatCurrency(total)}</span>
                  <span id="donutCenterLabel" className="center-label">{title}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bifurcation Selector & Dynamic Legend */}
          <div className="analytics-card">
            <div className="bifurcation-tabs" role="tablist">
              {[
                { id: 'type', label: 'By Type' },
                { id: 'payment', label: 'Payment Mode' },
                { id: 'program', label: 'Program' },
                { id: 'status', label: 'Status' },
                { id: 'menu', label: 'Menu' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`bifurcation-tab-btn ${activeBifurcation === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveBifurcation(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="chart-legend-list" id="chartLegendList">
              {slices.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2rem' }}>
                  No data recorded for this category yet.
                </div>
              ) : (
                slices.map((slice) => (
                  <div key={slice.label} className="legend-item">
                    <div className="legend-label-group">
                      <span className="legend-dot" style={{ backgroundColor: slice.color }}></span>
                      <span className="legend-label">{slice.label}</span>
                    </div>
                    <div className="legend-values">
                      <span className="legend-amount">₹{formatCurrency(slice.value)}</span>
                      <span className="legend-pct">({slice.percentage}%)</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return { AnalyticsSection };
})();

