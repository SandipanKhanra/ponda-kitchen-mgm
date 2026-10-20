// =============================================================================
// Donation Analytics Section Component (Interactive SVG Donut & Bifurcations)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Analytics = window.KitchenComponents.Analytics || {};

window.KitchenComponents.Analytics.AnalyticsSection = (() => {
  const { React } = window;
  const { useState, useMemo } = React;

  const DEFAULT_COLORS = [
    "#4f46e5", "#10b981", "#0284c7", "#f59e0b", "#ec4899",
    "#8b5cf6", "#14b8a6", "#f97316", "#64748b", "#84cc16"
  ];

  const BIFURCATION_TABS = [
    { id: 'type', label: 'By Type' },
    { id: 'payment', label: 'Payment Mode' },
    { id: 'program', label: 'Program' },
    { id: 'status', label: 'Status' },
    { id: 'menu', label: 'Menu' },
  ];

  function AnalyticsSection({ metrics = {} }) {
    const [activeBifurcation, setActiveBifurcation] = useState('type');

    const constants = window.KitchenConstants || {};
    const chartColors = constants.CHART_COLORS || DEFAULT_COLORS;

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

    const chartItems = useMemo(() => {
      return items.map(([label, value], i) => {
        let color = chartColors[i % chartColors.length];
        if (activeBifurcation === 'status') {
          const lbl = label.toLowerCase();
          if (lbl === 'paid' || lbl === 'received') color = '#10b981';
          else if (lbl === 'pending') color = '#f59e0b';
        }
        return {
          id: `bifurcation-${label}`,
          label,
          value,
          color,
          secondaryLabel: null
        };
      });
    }, [items, activeBifurcation, chartColors]);

    const KC = window.KitchenComponents || {};
    const StatsCards = KC.Orders?.StatsCards?.StatsCards || KC.Orders?.StatsCards || KC.StatsCards || (() => null);
    const ModernDonutChart = KC.Common?.ModernDonutChart || KC.ModernDonutChart || (() => null);

    const tabsHeader = (
      <div className="bifurcation-tabs" role="tablist" aria-label="Bifurcation filters">
        {BIFURCATION_TABS.map((tab) => (
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
    );

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

        {/* Modern Interactive Donut Chart */}
        <ModernDonutChart
          title="Collections Breakdown"
          subtitle="Interactive donation revenue bifurcation across channels"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--primary)' }}>
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
          }
          headerActions={tabsHeader}
          items={chartItems}
          total={total}
          defaultCenterLabel={title}
          defaultCenterSub="Total Collections"
          emptyMessage="No transaction data recorded for this category yet."
        />
      </div>
    );
  }

  return React.memo ? React.memo(AnalyticsSection) : AnalyticsSection;
})();

window.KitchenComponents.AnalyticsSection = window.KitchenComponents.Analytics.AnalyticsSection;
