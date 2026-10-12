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

    const StatsCards = window.KitchenComponents?.StatsCards || (() => null);

    return (
      <div id="pageAnalytics" className="app-page active">
        {/* Page Header */}
        <section className="section-toolbar">
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Donation &amp; Revenue Analytics</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Bifurcation of collections across transaction types, payment channels, and menus
            </p>
          </div>
        </section>

        {/* Top Summary KPI Cards */}
        <div style={{ marginBottom: '1.5rem' }}>
          <StatsCards metrics={metrics} />
        </div>

        {/* Main Analytics Card */}
        <div className="analytics-section">
          {/* Analytics Header with Title & Bifurcation Tabs */}
          <div className="analytics-header">
            <div className="analytics-title-group">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)' }}>
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              <h3 className="section-title" style={{ margin: 0 }}>Collections Breakdown</h3>
            </div>

            <div className="bifurcation-tabs" role="tablist" aria-label="Bifurcation filters">
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
                  role="tab"
                  aria-selected={activeBifurcation === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analytics Visual Grid: Left Donut, Right Legend */}
          <div className="analytics-grid">
            {/* Left: Donut Chart with Centered Metric Info */}
            <div className="chart-wrapper">
              <svg viewBox="0 0 100 100" id="donutSvg" className="donut-svg" aria-label="Donut Chart">
                {total === 0 || slices.length === 0 ? (
                  <circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-color)" strokeWidth="14" />
                ) : (
                  slices.map((slice) => (
                    <circle
                      key={slice.label}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth="14"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      style={{ transition: 'stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
                    >
                      <title>{slice.label}: ₹{formatCurrency(slice.value)} ({slice.percentage}%)</title>
                    </circle>
                  ))
                )}
              </svg>

              <div className="donut-center-text">
                <span id="donutCenterAmount" className="donut-center-amount">₹{formatCurrency(total)}</span>
                <span id="donutCenterLabel" className="donut-center-label">{title}</span>
              </div>
            </div>

            {/* Right: Legend Breakdown List */}
            <div className="chart-legend-list" id="chartLegendList">
              {slices.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '2.5rem 1rem', background: 'var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  No transaction data recorded for this category yet.
                </div>
              ) : (
                slices.map((slice) => (
                  <div key={slice.label} className="legend-item">
                    <div className="legend-label-group">
                      <span className="legend-color-dot" style={{ backgroundColor: slice.color }}></span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{slice.label}</span>
                    </div>
                    <div className="legend-value-group">
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{formatCurrency(slice.value)}</span>
                      <span className="legend-pct-badge">{slice.percentage}%</span>
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

  return AnalyticsSection;
})();

window.KitchenComponents.AnalyticsSection = window.KitchenComponents.Analytics.AnalyticsSection;

