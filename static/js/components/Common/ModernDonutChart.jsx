// =============================================================================
// ModernDonutChart Component
// High-Fidelity Interactive SVG Donut / Pie Chart with Segmented Slices,
// Glassmorphic Center Ring, Dynamic Hover Re-centering & Visual Progress Bars
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Common = window.KitchenComponents.Common || {};

window.KitchenComponents.Common.ModernDonutChart = (() => {
  const { React } = window;
  const { useState, useMemo } = React;

  const RADIUS = 38;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  function ModernDonutChart({
    items = [],
    total = 0,
    defaultCenterLabel = 'Total',
    defaultCenterSub = '',
    currencyPrefix = '₹',
    emptyMessage = 'No transaction data recorded for this category yet.',
    title,
    subtitle,
    icon,
    headerActions,
    className = ''
  }) {
    const [hoveredId, setHoveredId] = useState(null);

    const formatCurrency = (val) => {
      if (window.KitchenConstants && window.KitchenConstants.formatCurrency) {
        return window.KitchenConstants.formatCurrency(val);
      }
      return Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
    };

    const calculatedTotal = useMemo(() => {
      if (total > 0) return total;
      return items.reduce((acc, it) => acc + (Number(it.value) || 0), 0);
    }, [items, total]);

    // Active hovered item or null
    const activeItem = useMemo(() => {
      if (!hoveredId) return null;
      return items.find((it) => it.id === hoveredId) || null;
    }, [hoveredId, items]);

    // Segmented Slices Math
    const slices = useMemo(() => {
      if (calculatedTotal <= 0 || items.length === 0) return [];

      const gap = items.length > 1 ? 2.2 : 0; // Segment gap in SVG circumference units
      let accumulatedOffset = 0;

      return items.map((item) => {
        const val = Number(item.value) || 0;
        const percentage = calculatedTotal > 0 ? val / calculatedTotal : 0;
        const sliceArc = percentage * CIRCUMFERENCE;

        // Gap subtraction for crisp modern segmented look
        const strokeLength = sliceArc > gap ? sliceArc - gap : sliceArc;
        const strokeDasharray = `${strokeLength} ${CIRCUMFERENCE - strokeLength}`;
        const strokeDashoffset = -accumulatedOffset;
        accumulatedOffset += sliceArc;

        return {
          ...item,
          val,
          percentage: (percentage * 100).toFixed(1),
          strokeDasharray,
          strokeDashoffset
        };
      });
    }, [items, calculatedTotal]);

    // Center display values based on hover state
    const displayAmount = activeItem ? activeItem.value : calculatedTotal;
    const displayLabel = activeItem ? activeItem.label : defaultCenterLabel;
    const displaySub = activeItem
      ? `${((activeItem.value / (calculatedTotal || 1)) * 100).toFixed(1)}% Share`
      : (defaultCenterSub || (items.length > 0 ? `${items.length} ${items.length === 1 ? 'entry' : 'entries'}` : ''));

    return (
      <div className={`modern-chart-card ${className}`}>
        {/* Optional Header with Title & Action Controls */}
        {(title || headerActions) && (
          <div className="modern-chart-header">
            <div className="modern-chart-title-group">
              {icon && <span className="modern-chart-icon">{icon}</span>}
              <div>
                {title && <h3 className="section-title" style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>}
                {subtitle && <p className="modern-chart-subtitle">{subtitle}</p>}
              </div>
            </div>
            {headerActions && <div className="modern-chart-actions">{headerActions}</div>}
          </div>
        )}

        {/* Main Visual Grid: Left Donut SVG, Right Interactive Legend Cards */}
        <div className="modern-chart-grid">
          {/* Left: Donut Chart Disc */}
          <div className="chart-wrapper">
            <svg viewBox="0 0 100 100" className="donut-svg" aria-label="Visual Distribution Chart">
              <defs>
                <filter id="activeSliceGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Background Concentric Subtle Track Ring */}
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="11"
                opacity="0.8"
              />

              {calculatedTotal === 0 || slices.length === 0 ? (
                <circle
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="11"
                  strokeDasharray="4 4"
                />
              ) : (
                slices.map((slice) => {
                  const isHovered = hoveredId === slice.id;
                  const isDimmed = Boolean(hoveredId && !isHovered);

                  return (
                    <circle
                      key={slice.id}
                      cx="50"
                      cy="50"
                      r={RADIUS}
                      fill="none"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 14 : 11}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      opacity={isDimmed ? 0.32 : 1}
                      filter={isHovered ? 'url(#activeSliceGlow)' : undefined}
                      style={{
                        cursor: 'pointer',
                        transition: 'stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease'
                      }}
                      onMouseEnter={() => setHoveredId(slice.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <title>{slice.label}: {currencyPrefix}{formatCurrency(slice.val)} ({slice.percentage}%)</title>
                    </circle>
                  );
                })
              )}
            </svg>

            {/* Glassmorphic Center Informational Disc */}
            <div className="donut-center-text">
              <span className="donut-center-amount">
                {currencyPrefix}{formatCurrency(displayAmount)}
              </span>
              <span className="donut-center-label" title={displayLabel}>
                {displayLabel}
              </span>
              {displaySub && (
                <span className={`donut-center-sub ${activeItem ? 'active-share' : ''}`}>
                  {displaySub}
                </span>
              )}
            </div>
          </div>

          {/* Right: Legend Breakdown List with Micro Progress Bars */}
          <div className="modern-legend-list" role="list" aria-label="Distribution Legend">
            {slices.length === 0 ? (
              <div className="modern-chart-empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.5, marginBottom: '0.4rem' }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p style={{ margin: 0 }}>{emptyMessage}</p>
              </div>
            ) : (
              slices.map((slice) => {
                const isHovered = hoveredId === slice.id;
                const isDimmed = Boolean(hoveredId && !isHovered);

                return (
                  <div
                    key={slice.id}
                    className={`modern-legend-item ${isHovered ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                    onMouseEnter={() => setHoveredId(slice.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    role="listitem"
                  >
                    <div className="legend-item-main">
                      <div className="legend-label-group">
                        <span
                          className="legend-color-dot"
                          style={{
                            backgroundColor: slice.color,
                            boxShadow: isHovered ? `0 0 8px ${slice.color}` : `0 0 0 1px rgba(0,0,0,0.06)`
                          }}
                        />
                        <div className="legend-names">
                          <span className="legend-primary-label">{slice.label}</span>
                          {slice.secondaryLabel && (
                            <span className="legend-sec-badge">{slice.secondaryLabel}</span>
                          )}
                        </div>
                      </div>

                      <div className="legend-value-group">
                        <span className="legend-amount">{currencyPrefix}{formatCurrency(slice.val)}</span>
                        <span
                          className="legend-pct-badge"
                          style={{
                            backgroundColor: `${slice.color}22`,
                            color: slice.color,
                            borderColor: `${slice.color}44`
                          }}
                        >
                          {slice.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Visual Proportion Progress Bar */}
                    <div className="legend-bar-track">
                      <div
                        className="legend-bar-fill"
                        style={{
                          width: `${slice.percentage}%`,
                          backgroundColor: slice.color
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return React.memo ? React.memo(ModernDonutChart) : ModernDonutChart;
})();

window.KitchenComponents.ModernDonutChart = window.KitchenComponents.Common.ModernDonutChart;

