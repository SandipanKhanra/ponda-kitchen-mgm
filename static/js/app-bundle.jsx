// =============================================================================
// Kitchen Accountability ERP - Consolidated App Bundle (React 19)
// =============================================================================

// --- Component: static/js/components/Common.jsx ---
// =============================================================================
// Common Reusable UI Components (Spinners, Badges, Modals)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Common = (() => {
  const { React } = window;

  function SpinnerModern({ size = 36 }) {
    return <div className="spinner-modern" style={{ width: size, height: size }} />;
  }

  function BtnSpinner() {
    return <span className="btn-spinner" />;
  }

  function TableLoadingCell({ colSpan = 11, message = "Synchronizing data with Google Sheet..." }) {
    return (
      <tr>
        <td colSpan={colSpan} className="table-loading-cell">
          <div className="loading-state-box">
            <SpinnerModern />
            <div className="loading-state-text">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>{message}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  function MobileLoadingBox({ message = "Synchronizing data with Google Sheet..." }) {
    return (
      <div className="loading-state-box mobile-loading-box">
        <SpinnerModern />
        <div className="loading-state-text">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>{message}</span>
        </div>
      </div>
    );
  }

  function StatusBadge({ mode, spreadsheetTitle, isSyncing }) {
    let badgeClass = 'status-badge status-loading';
    let text = 'Connecting...';

    if (isSyncing) {
      badgeClass = 'status-badge status-syncing';
      text = 'Syncing Google Sheets...';
    } else if (mode === 'google_sheets') {
      badgeClass = 'status-badge status-google';
      text = `Google Sheets: ${spreadsheetTitle || 'Connected'}`;
    } else if (mode === 'local_excel') {
      badgeClass = 'status-badge status-excel';
      text = 'Local Excel Mode';
    }

    return (
      <div id="statusBadge" className={badgeClass} title="Connection status">
        <span className="status-dot"></span>
        <span id="statusText">{text}</span>
      </div>
    );
  }

  function TypeBadge({ type }) {
    const t = (type || 'Order').trim();
    const lower = t.toLowerCase();
    let badgeClass = 'badge badge-order';
    if (lower === 'sponsor') badgeClass = 'badge badge-sponsor';
    if (lower.includes('coupon')) badgeClass = 'badge badge-in-progress';
    return <span className={badgeClass}>{t}</span>;
  }

  function PaymentBadge({ paymentThrough }) {
    const pay = (paymentThrough || 'Cash').trim();
    const isCash = pay.toLowerCase().includes('cash');
    return <span className={`badge ${isCash ? 'badge-cash' : 'badge-gpay'}`}>{pay}</span>;
  }

  function PaymentStatusBadge({ paymentReceived }) {
    const rcvd = (paymentReceived || '').trim().toLowerCase();
    const isPaid = rcvd === 'yes' || rcvd === 'paid' || rcvd === 'done' || rcvd === 'y';
    return (
      <span className={`badge ${isPaid ? 'badge-paid' : 'badge-pending'}`}>
        {isPaid ? 'Paid' : 'Pending'}
      </span>
    );
  }

  const memo = React.memo || ((c) => c);

  return {
    SpinnerModern: memo(SpinnerModern),
    BtnSpinner: memo(BtnSpinner),
    TableLoadingCell: memo(TableLoadingCell),
    MobileLoadingBox: memo(MobileLoadingBox),
    StatusBadge: memo(StatusBadge),
    TypeBadge: memo(TypeBadge),
    PaymentBadge: memo(PaymentBadge),
    PaymentStatusBadge: memo(PaymentStatusBadge)
  };
})();

Object.assign(window.KitchenComponents, window.KitchenComponents.Common);



// --- Component: static/js/components/Toast.jsx ---
// =============================================================================
// Toast Notification System
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Toast = (() => {
  const { useState, useEffect } = window.React;

  // Global emitter for triggering toasts from anywhere
  let toastSubscriber = null;

  window.showToast = (message, type = 'info') => {
    if (toastSubscriber) {
      toastSubscriber({ id: Date.now() + Math.random(), message, type });
    }
  };

  function ToastContainer() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
      toastSubscriber = (newToast) => {
        setToasts((prev) => [...prev, newToast]);
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 3800);
      };
      return () => {
        toastSubscriber = null;
      };
    }, []);

    if (toasts.length === 0) return null;

    return (
      <div className="toast-container" id="toastContainer">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {t.type === 'error' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            {t.type === 'info' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    );
  }

  return { ToastContainer };
})();

window.KitchenComponents.ToastContainer = window.KitchenComponents.Toast.ToastContainer;



// --- Component: static/js/components/Header.jsx ---
// =============================================================================
// Header Component (Topbar, Month Selector, New Sheet, Status & Theme)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Header = (() => {
  const { React } = window;
  const StatusBadge = window.KitchenComponents?.Common?.StatusBadge || window.KitchenComponents?.StatusBadge || (() => null);

  function Header({
    currentTab,
    availableTabs,
    onTabChange,
    onOpenCreateSheet,
    syncStatus,
    theme,
    onThemeToggle
  }) {
    return (
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          </div>
          <div className="brand-text">
            <h1 className="brand-title">Kitchen Accountability</h1>
            <p className="brand-subtitle">
              ISKCON Ponda &bull; Live Google Sheets ERP
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          {/* Month Selector & New Sheet Button */}
          <div className="month-selector-wrapper">
            <label htmlFor="monthTabSelect" className="month-select-label hide-mobile">
              Month:
            </label>
            <select
              id="monthTabSelect"
              className="month-tab-select"
              aria-label="Select month tab"
              value={currentTab}
              onChange={(e) => onTabChange(e.target.value)}
            >
              {availableTabs.map((tab) => (
                <option key={tab} value={tab}>{tab}</option>
              ))}
            </select>
            <button
              id="openNewSheetBtn"
              type="button"
              className="btn btn-secondary topbar-btn"
              title="Create new sheet tab using Master Template"
              onClick={onOpenCreateSheet}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Sheet</span>
            </button>
          </div>

          {/* Connection Status Badge */}
          <StatusBadge
            mode={syncStatus.mode}
            spreadsheetTitle={syncStatus.spreadsheet_title}
            isSyncing={syncStatus.isSyncing}
          />

          {/* Theme Toggle Button */}
          <button
            id="themeToggleBtn"
            type="button"
            className="theme-toggle-btn"
            aria-label={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
            title={theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'}
            onClick={onThemeToggle}
          >
            <svg className="sun-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg className="moon-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>
        </div>
      </header>
    );
  }

  return React.memo ? React.memo(Header) : Header;
})();

window.KitchenComponents.Header.Header = window.KitchenComponents.Header;


// --- Component: static/js/components/Navigation.jsx ---
// =============================================================================
// Navigation Component (Main 5-Tab Bar)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Navigation = (() => {
  const { React } = window;

  const TABS = [
    {
      id: 'transactions',
      label: 'Orders & Sponsors',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      )
    },
    {
      id: 'vendors',
      label: 'Vendor Management',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'cooks',
      label: 'Cook Management & Payroll',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'analytics',
      label: 'Donation Analytics',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
          <path d="M22 12A10 10 0 0 0 12 2v10z" />
        </svg>
      )
    },
    {
      id: 'policy',
      label: 'Kitchen Policy & Rules',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="9" y1="7" x2="15" y2="7" />
          <line x1="9" y1="11" x2="13" y2="11" />
        </svg>
      )
    }
  ];

  function Navigation({ activePage, onSelectPage, isNavPending = false }) {
    return (
      <nav
        className="main-nav-bar"
        aria-label="Main Navigation"
        style={{
          opacity: isNavPending ? 0.8 : 1,
          transition: 'opacity 0.15s ease'
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`nav-tab-btn ${activePage === tab.id ? 'active' : ''}`}
            data-page={tab.id}
            onClick={() => onSelectPage(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    );
  }

  return React.memo ? React.memo(Navigation) : Navigation;
})();

window.KitchenComponents.Navigation.Navigation = window.KitchenComponents.Navigation;



// --- Component: static/js/components/SyncBanner.jsx ---
// =============================================================================
// SyncBanner Component (Live Connection Notification Banner)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.SyncBanner = (() => {
  const { React } = window;

  function SyncBanner({ syncStatus, currentTab }) {
    const isGoogle = syncStatus.mode === 'google_sheets';
    const isLocal = syncStatus.mode === 'local_excel';

    if (!isGoogle && !isLocal) return null;

    const bg = isGoogle ? 'var(--success-bg)' : 'var(--warning-bg)';
    const borderColor = isGoogle ? '#a7f3d0' : '#fde68a';
    const textColor = isGoogle ? '#065f46' : '#92400e';

    return (
      <section
        id="connectionBanner"
        className="info-banner"
        style={{
          display: 'flex',
          backgroundColor: bg,
          borderColor: borderColor,
          color: textColor
        }}
      >
        <div className="banner-content">
          <svg className="banner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div id="bannerText">
            {isGoogle ? (
              <span>
                <strong>Live Sync Active:</strong> Changes sync instantly with <em>&quot;{syncStatus.spreadsheet_title || 'Kitchen Accountability'}&quot;</em> ({currentTab}).
              </span>
            ) : (
              <span>
                <strong>Local Excel Mode:</strong> Synchronized with local database.xlsx file.
              </span>
            )}
          </div>
        </div>
        <div id="bannerActionContainer">
          {isGoogle && syncStatus.google_sheet_url && (
            <a
              id="sheetLinkBtn"
              href={syncStatus.google_sheet_url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
              style={{ textDecoration: 'none' }}
            >
              Open Google Sheet ↗
            </a>
          )}
        </div>
      </section>
    );
  }

  return React.memo ? React.memo(SyncBanner) : SyncBanner;
})();

window.KitchenComponents.SyncBanner.SyncBanner = window.KitchenComponents.SyncBanner;



// --- Component: static/js/components/Common/ModernDonutChart.jsx ---
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



// --- Component: static/js/components/Orders/StatsCards.jsx ---
// =============================================================================
// Orders & Sponsors KPI Stats Cards
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.StatsCards = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;

  function StatsCards({ metrics = {} }) {
    const totalCollections = metrics.total_collections || 0;
    const totalOrders = metrics.total_orders || 0;
    const totalSponsors = metrics.total_sponsors || 0;
    const cash = metrics.total_cash || 0;
    const gpay = metrics.total_gpay || 0;

    return (
      <section className="stats-grid" aria-label="Key Performance Indicators">
        <div className="stat-card">
          <div className="stat-icon-wrapper icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Collections</span>
            <span id="statTotalCollections" className="stat-value">₹{formatCurrency(totalCollections)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Orders</span>
            <span id="statTotalOrders" className="stat-value">₹{formatCurrency(totalOrders)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Sponsorships</span>
            <span id="statTotalSponsors" className="stat-value">₹{formatCurrency(totalSponsors)}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper icon-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-label">Payment Modes</span>
            <span id="statPaymentModes" className="stat-value" style={{ fontSize: '1.05rem' }}>
              Cash: ₹{formatCurrency(cash)} | GPay: ₹{formatCurrency(gpay)}
            </span>
          </div>
        </div>
      </section>
    );
  }

  return React.memo ? React.memo(StatsCards) : StatsCards;
})();

window.KitchenComponents.StatsCards = window.KitchenComponents.Orders.StatsCards;



// --- Component: static/js/components/Orders/OrdersToolbar.jsx ---
// =============================================================================
// Orders Toolbar (Search, 4 Filter Dropdowns, Sync Buttons, Add Entry)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersToolbar = (() => {
  const { React } = window;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  function OrdersToolbar({
    searchQuery,
    onSearchChange,
    typeFilter,
    onTypeFilterChange,
    paymentFilter,
    onPaymentFilterChange,
    statusFilter,
    onStatusFilterChange,
    menuFilter,
    onMenuFilterChange,
    isRefreshing,
    onRefresh,
    isExporting,
    onExportExcel,
    onOpenAddModal
  }) {
    const hasActiveFilters = typeFilter !== 'All' || paymentFilter !== 'All' || statusFilter !== 'All' || menuFilter !== 'All' || Boolean(searchQuery);

    const handleClearAllFilters = () => {
      onSearchChange('');
      onTypeFilterChange('All');
      onPaymentFilterChange('All');
      onStatusFilterChange('All');
      onMenuFilterChange('All');
    };

    return (
      <section className="controls-toolbar" aria-label="Orders and sponsors toolbar">
        {/* Tier 1: Search and Primary Actions Row */}
        <div className="toolbar-primary-row">
          {/* Search Input */}
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              id="searchInput"
              placeholder="Search person, program, date, amount..."
              aria-label="Search records"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search query"
                title="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Action Button Group */}
          <div className="action-btn-group">
            {/* Refresh Button with Spinner Animation */}
            <button
              id="refreshBtn"
              type="button"
              className={`btn btn-secondary ${isRefreshing ? 'spinning' : ''}`}
              disabled={isRefreshing}
              title="Force refresh from Google Sheet"
              onClick={onRefresh}
            >
              {isRefreshing ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinning">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            {/* Export to Excel Button with Feedback */}
            <button
              id="exportExcelBtn"
              type="button"
              className="btn btn-secondary"
              disabled={isExporting}
              title="Download month as Excel"
              onClick={onExportExcel}
            >
              {isExporting ? <BtnSpinner /> : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
              <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>

            {/* Add Entry Button */}
            <button
              id="openAddModalBtn"
              type="button"
              className="btn btn-primary"
              onClick={onOpenAddModal}
              title="Add New Order or Sponsor Entry"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Order Entry</span>
            </button>
          </div>
        </div>

        {/* Tier 2: 4 Dropdown Filters Row */}
        <div className="toolbar-filters-row">
          <div className="filters-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span>Filters:</span>
          </div>

          <div className="select-group">
            <select
              id="typeFilter"
              aria-label="Filter by Type"
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Order">Orders</option>
              <option value="Sponsor">Sponsors</option>
              <option value="Coupon">Coupons</option>
            </select>

            <select
              id="paymentFilter"
              aria-label="Filter by Payment Mode"
              value={paymentFilter}
              onChange={(e) => onPaymentFilterChange(e.target.value)}
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="Gpay">GPay</option>
            </select>

            <select
              id="statusFilter"
              aria-label="Filter by Payment Status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              id="menuFilter"
              aria-label="Filter by Menu Type"
              value={menuFilter}
              onChange={(e) => onMenuFilterChange(e.target.value)}
            >
              <option value="All">All Menus</option>
              <option value="Light">Light (100)</option>
              <option value="Medium">Medium (160)</option>
              <option value="Heavy">Heavy (220)</option>
              <option value="Very Heavy">Very Heavy (250)</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              className="btn-clear-filters"
              onClick={handleClearAllFilters}
              title="Reset all search queries and active filters"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  return React.memo ? React.memo(OrdersToolbar) : OrdersToolbar;
})();

window.KitchenComponents.OrdersToolbar = window.KitchenComponents.Orders.OrdersToolbar;


// --- Component: static/js/components/Orders/OrdersTable.jsx ---
// =============================================================================
// Orders & Sponsors Desktop / Tablet Table View
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersTable = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;
  const Common = window.KitchenComponents?.Common || window.KitchenComponents || {};
  const TypeBadge = Common.TypeBadge || (() => null);
  const PaymentBadge = Common.PaymentBadge || (() => null);
  const PaymentStatusBadge = Common.PaymentStatusBadge || (() => null);
  const TableLoadingCell = Common.TableLoadingCell || (() => null);

  function OrdersTable({
    records = [],
    isLoading = false,
    onEditRecord,
    onDeleteRecord
  }) {
    const scrollWrapperRef = React.useRef(null);

    React.useEffect(() => {
      const el = scrollWrapperRef.current;
      if (!el) return;

      const onWheel = (e) => {
        if (el.scrollWidth > el.clientWidth) {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
            const atLeft = el.scrollLeft <= 0 && e.deltaY < 0;
            const atRight = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth && e.deltaY > 0;
            if (!atLeft && !atRight) {
              el.scrollLeft += e.deltaY;
              e.preventDefault();
            }
          }
        }
      };

      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }, []);

    return (
      <div className="table-scroll-wrapper" id="recordsTableWrapper" ref={scrollWrapperRef}>
        <table className="data-table orders-table" aria-label="Transactions table">
          <thead>
            <tr>
              <th scope="col" style={{ width: '95px' }}>Date</th>
              <th scope="col">Person / Sponsor</th>
              <th scope="col">Program / Occasion</th>
              <th scope="col">Type</th>
              <th scope="col">Devotees</th>
              <th scope="col">Menu</th>
              <th scope="col">Cook Share</th>
              <th scope="col">Amount (₹)</th>
              <th scope="col">Payment Mode</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right" style={{ width: '85px' }}>Actions</th>
            </tr>
          </thead>
          <tbody id="tableBody">
            {isLoading ? (
              <TableLoadingCell colSpan={11} message="Syncing transactions from Google Sheet..." />
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                  No matching records found. Try adjusting your search or filters.
                </td>
              </tr>
            ) : (
              records.map((r) => {
                const isOrder = (r.type || '').trim().toLowerCase() === 'order';
                const devCount = isOrder && r.number_of_devotees ? r.number_of_devotees : '—';
                const menuType = isOrder && r.menu_type ? r.menu_type : '—';
                const inc = isOrder && r.cook_incentive && r.cook_incentive > 0 ? `₹${formatCurrency(r.cook_incentive)}` : '—';

                return (
                  <tr key={r.id}>
                    <td>
                      <span className="order-date-text">{r.date}</span>
                    </td>
                    <td>
                      <div className="order-person-name">{r.person_name}</div>
                      {r.notes ? (
                        <div className="order-notes-subtitle" title={r.notes}>
                          📝 {r.notes}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <span className="order-program-text">{r.program || '—'}</span>
                    </td>
                    <td>
                      <TypeBadge type={r.type} />
                    </td>
                    <td>
                      <span className="order-devotees-count">{devCount}</span>
                    </td>
                    <td>
                      <span className="category-tag">{menuType}</span>
                    </td>
                    <td>
                      <span className="order-cook-share">{inc}</span>
                    </td>
                    <td>
                      <span className="amount-display order-amount-text">₹{formatCurrency(r.amount)}</span>
                    </td>
                    <td>
                      <PaymentBadge paymentThrough={r.payment_through} />
                    </td>
                    <td>
                      <PaymentStatusBadge paymentReceived={r.payment_received} />
                    </td>
                    <td className="text-right">
                      <div className="action-buttons-cell">
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit entry"
                          aria-label={`Edit entry ${r.person_name}`}
                          onClick={() => onEditRecord(r)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          title="Delete entry"
                          aria-label={`Delete entry ${r.person_name}`}
                          onClick={() => onDeleteRecord(r)}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return React.memo ? React.memo(OrdersTable) : OrdersTable;
})();

window.KitchenComponents.OrdersTable = window.KitchenComponents.Orders.OrdersTable;



// --- Component: static/js/components/Orders/OrdersMobileCards.jsx ---
// =============================================================================
// Orders & Sponsors Mobile Cards View
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.OrdersMobileCards = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants;
  const Common = window.KitchenComponents?.Common || window.KitchenComponents || {};
  const TypeBadge = Common.TypeBadge || (() => null);
  const PaymentBadge = Common.PaymentBadge || (() => null);
  const PaymentStatusBadge = Common.PaymentStatusBadge || (() => null);
  const MobileLoadingBox = Common.MobileLoadingBox || (() => null);

  function OrdersMobileCards({
    records = [],
    isLoading = false,
    onEditRecord,
    onDeleteRecord
  }) {
    if (isLoading) {
      return (
        <div className="mobile-cards-list" id="mobileCardsList">
          <MobileLoadingBox message="Syncing transactions from Google Sheet..." />
        </div>
      );
    }

    if (records.length === 0) {
      return (
        <div className="mobile-cards-list" id="mobileCardsList">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            No matching records found.
          </div>
        </div>
      );
    }

    return (
      <div className="mobile-cards-list" id="mobileCardsList">
        {records.map((r) => {
          const isOrder = (r.type || '').trim().toLowerCase() === 'order';
          const hasDetails = (isOrder && (r.number_of_devotees || r.menu_type || r.cook_incentive)) || r.notes;

          return (
            <div key={r.id} className="record-card">
              <div className="record-card-header">
                <div>
                  <div className="record-card-title">{r.person_name}</div>
                  <div className="record-card-meta">
                    <span>{r.date}</span>
                    <span>&bull;</span>
                    <span>{r.program || 'General'}</span>
                  </div>
                </div>
                <div>
                  <span className="amount-display" style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                    ₹{formatCurrency(r.amount)}
                  </span>
                </div>
              </div>

              {hasDetails && (
                <div className="record-card-details">
                  {isOrder && r.number_of_devotees ? (
                    <span>Devotees: <strong>{r.number_of_devotees}</strong></span>
                  ) : null}
                  {isOrder && r.menu_type ? (
                    <span>Menu: <strong>{r.menu_type}</strong></span>
                  ) : null}
                  {isOrder && r.cook_incentive ? (
                    <span>Incentive: <strong style={{ color: 'var(--primary)' }}>₹{formatCurrency(r.cook_incentive)}</strong></span>
                  ) : null}
                  {r.notes ? (
                    <span>Notes: <em>{r.notes}</em></span>
                  ) : null}
                </div>
              )}

              <div className="record-card-body">
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <TypeBadge type={r.type} />
                  <PaymentBadge paymentThrough={r.payment_through} />
                  <PaymentStatusBadge paymentReceived={r.payment_received} />
                </div>
                <div className="record-card-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    aria-label={`Edit ${r.person_name}`}
                    onClick={() => onEditRecord(r)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    aria-label={`Delete ${r.person_name}`}
                    onClick={() => onDeleteRecord(r)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return React.memo ? React.memo(OrdersMobileCards) : OrdersMobileCards;
})();

window.KitchenComponents.OrdersMobileCards = window.KitchenComponents.Orders.OrdersMobileCards;



// --- Component: static/js/components/Orders/Pagination.jsx ---
// =============================================================================
// Pagination Controls Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.Pagination = (() => {
  const { React } = window;

  function Pagination({
    total = 0,
    currentPage = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange
  }) {
    if (total === 0) return null;

    const { startIndex, end, maxPages, pageNumbers } = React.useMemo(() => {
      const effectiveSize = pageSize === 'all' ? total : parseInt(pageSize, 10);
      const maxP = effectiveSize > 0 ? Math.max(1, Math.ceil(total / effectiveSize)) : 1;
      const startIdx = (currentPage - 1) * effectiveSize;
      const count = pageSize === 'all' ? total : Math.min(effectiveSize, total - startIdx);
      const endIdx = startIdx + count;

      const startP = Math.max(1, currentPage - 2);
      const endP = Math.min(maxP, currentPage + 2);
      const nums = [];
      for (let p = startP; p <= endP; p++) {
        nums.push(p);
      }
      return { startIndex: startIdx, end: endIdx, maxPages: maxP, pageNumbers: nums };
    }, [total, currentPage, pageSize]);

    return (
      <div className="pagination-wrapper" id="paginationWrapper">
        <div className="pagination-info" id="paginationInfo">
          Showing <strong>{startIndex + 1}</strong> to <strong>{end}</strong> of <strong>{total}</strong> entries
        </div>

        <div className="pagination-controls" id="paginationControls">
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First Page"
            aria-label="First page"
          >
            &laquo;
          </button>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
            aria-label="Previous page"
          >
            &lsaquo;
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              className={`page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === maxPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === maxPages}
            onClick={() => onPageChange(maxPages)}
            title="Last Page"
            aria-label="Last page"
          >
            &raquo;
          </button>
        </div>

        <div className="page-size-selector">
          <label htmlFor="pageSizeSelect" className="hide-mobile">Rows:</label>
          <select
            id="pageSizeSelect"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value)}
            aria-label="Select rows per page"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
        </div>
      </div>
    );
  }

  return React.memo ? React.memo(Pagination) : Pagination;
})();

window.KitchenComponents.Pagination = window.KitchenComponents.Orders.Pagination;



// --- Component: static/js/components/Vendors/VendorSection.jsx ---
// =============================================================================
// Vendor Management Section Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Vendors = window.KitchenComponents.Vendors || {};

window.KitchenComponents.Vendors.VendorSection = (() => {
  const { React } = window;
  const { formatCurrency } = window.KitchenConstants || {};
  const TableLoadingCell =
    window.KitchenComponents?.Common?.TableLoadingCell ||
    window.KitchenComponents?.TableLoadingCell ||
    (() => null);
  const ModernDonutChart =
    window.KitchenComponents?.Common?.ModernDonutChart ||
    window.KitchenComponents?.ModernDonutChart ||
    (() => null);

  function VendorSection({
    vendorsData = {},
    isLoading = false,
    onOpenRegisterVendor,
    onOpenAddBill,
    onOpenEditVendor,
    onDeleteVendor,
    onViewVendorBills,
    onDeleteVendorEntry,
  }) {
    const vendors = vendorsData.vendors || [];
    const availableVendors = vendorsData.available_vendors || [];
    const allEntries = vendorsData.all_entries || [];
    const totalExpenses = vendorsData.total_vendor_expenses || 0;
    const netDifference = vendorsData.net_difference || 0;

    // Visual Vendor Purchase Breakdown (% of total budget spent per vendor)
    const vendorChartItems = React.useMemo(() => {
      if (!vendors || vendors.length === 0 || totalExpenses <= 0) return [];

      const colors = (window.KitchenConstants && window.KitchenConstants.CHART_COLORS) || [
        "#4f46e5", "#10b981", "#0284c7", "#f59e0b", "#ec4899",
        "#8b5cf6", "#14b8a6", "#f97316", "#64748b", "#84cc16"
      ];

      return [...vendors]
        .filter((v) => Number(v.amount) > 0)
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .map((v, i) => {
          const count = Number(v.bill_count) || 0;
          return {
            id: `vendor-${v.row_number || i}-${v.vendor_name}`,
            label: v.vendor_name,
            value: Number(v.amount) || 0,
            color: colors[i % colors.length],
            secondaryLabel: count > 0 ? `${count} ${count === 1 ? 'bill' : 'bills'}` : 'Direct'
          };
        });
    }, [vendors, totalExpenses]);

    return (
      <div id="pageVendors" className="app-page active">
        {/* Vendor Header Actions */}
        <section
          className="section-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>
              Vendor Management &amp; Expense Tracking
            </h2>
            <p
              style={{
                margin: "0.25rem 0 0",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
              }}
            >
              Live synchronization with Google Sheets Columns N-P &amp; itemized
              grocery bills
            </p>
          </div>
          <div className="section-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenRegisterVendor}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <span>Register Vendor</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onOpenAddBill(null)}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Vendor Bill</span>
            </button>
          </div>
        </section>

        {/* Vendor Stats Grid */}
        <section className="stats-grid" aria-label="Vendor Statistics">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-amber">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vendor Bills</span>
              <span id="statVendorTotal" className="stat-value">
                ₹{formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Vendors</span>
              <span id="statVendorCount" className="stat-value">
                {availableVendors.length}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-emerald">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">
                Net Balance (Surplus / Deficit)
              </span>
              <span
                id="statNetDifference"
                className="stat-value"
                style={{
                  color:
                    netDifference >= 0 ? "var(--success)" : "var(--danger)",
                }}
              >
                ₹{formatCurrency(netDifference)}
              </span>
            </div>
          </div>
        </section>

        {/* Vendor Purchase Distribution & Expense Share Donut Chart */}
        <section style={{ marginBottom: "1.75rem" }} aria-label="Vendor Expense Distribution">
          <ModernDonutChart
            title="Vendor Purchase Distribution (%)"
            subtitle="Visual share of grocery, supplies and kitchen purchases allocated per vendor"
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--warning)" }}
              >
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
            }
            items={vendorChartItems}
            total={totalExpenses}
            defaultCenterLabel="Total Purchases"
            defaultCenterSub={
              vendorChartItems.length > 0
                ? `${vendorChartItems.length} Active Vendors`
                : "No Expenses"
            }
            emptyMessage="No vendor purchases or bills logged for this month yet. Use 'Add Vendor Bill' to start logging expenses."
          />
        </section>

        {/* 1. Available Vendors Summary Table */}
        <section className="table-container" aria-label="Available Vendors">
          <div className="table-header-bar">
            <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
              Available Vendors (Sheet Summary)
            </h3>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Columns N &bull; O &bull; P
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Total Amount (₹)</th>
                  <th>Itemized Bills</th>
                  <th className="text-right" style={{ width: "150px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="vendorTableBody">
                {isLoading ? (
                  <TableLoadingCell
                    colSpan={4}
                    message="Syncing vendors from Google Sheet..."
                  />
                ) : vendors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        padding: "2.5rem",
                      }}
                    >
                      No vendors recorded yet. Click &quot;Add Vendor Bill&quot;
                      to record bills.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => {
                    const billBadge =
                      v.bill_count > 0 ? (
                        <span
                          className="badge badge-yes"
                          style={{ cursor: "pointer" }}
                          onClick={() => onViewVendorBills(v.vendor_name)}
                          title="Click to view itemized bills"
                        >
                          {v.bill_count} {v.bill_count === 1 ? "bill" : "bills"}{" "}
                          &nearr;
                        </span>
                      ) : (
                        <span className="badge badge-pending">
                          Direct / None
                        </span>
                      );

                    return (
                      <tr key={v.row_number}>
                        <td>
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--text-main)",
                              fontSize: "1rem",
                            }}
                          >
                            {v.vendor_name}
                          </div>
                        </td>
                        <td>
                          <span className="amount-display">
                            ₹{formatCurrency(v.amount)}
                          </span>
                        </td>
                        <td>{billBadge}</td>
                        <td className="text-right">
                          <div className="action-buttons-cell">
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onOpenAddBill(v.vendor_name)}
                              title={`Add bill for ${v.vendor_name}`}
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                              </svg>
                              <span>Add Bill</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={() => onViewVendorBills(v.vendor_name)}
                              title="View itemized bills"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              <span>Bills</span>
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => onOpenEditVendor(v)}
                              title="Edit vendor name / amount directly"
                              aria-label={`Edit ${v.vendor_name}`}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon-danger"
                              onClick={() =>
                                onDeleteVendor(v.row_number, v.vendor_name)
                              }
                              title="Clear vendor row from sheet"
                              aria-label={`Clear ${v.vendor_name}`}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Itemized Grocery Bill Entries Log */}
        <section className="table-container" aria-label="Itemized Bill Entries">
          <div className="table-header-bar">
            <div>
              <h3 className="section-title" style={{ fontSize: "1.15rem" }}>
                Detailed Bill Log
              </h3>
              <p
                style={{
                  margin: 0,
                  color: "var(--text-muted)",
                  fontSize: "0.825rem",
                }}
              >
                Itemized invoices auto-summed into Sheet Column P
              </p>
            </div>
            <span className="record-count-badge" id="vendorEntriesCountLabel">
              {allEntries.length} {allEntries.length === 1 ? "bill" : "bills"}
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "100px" }}>Date</th>
                  <th>Vendor</th>
                  <th>Description / Notes</th>
                  <th>Amount (₹)</th>
                  <th className="text-right" style={{ width: "70px" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody id="vendorEntriesTableBody">
                {isLoading ? (
                  <TableLoadingCell
                    colSpan={5}
                    message="Loading bill entries..."
                  />
                ) : allEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        color: "var(--text-muted)",
                        padding: "2.5rem",
                      }}
                    >
                      No bill entries logged yet for this month. Click &quot;Add
                      Vendor Bill&quot; above.
                    </td>
                  </tr>
                ) : (
                  allEntries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text-muted)",
                          }}
                        >
                          {e.date || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge badge-cash"
                          style={{ fontSize: "0.85rem" }}
                        >
                          {e.vendor_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: "var(--text-main)" }}>
                          {e.notes || "Grocery bill"}
                        </span>
                      </td>
                      <td>
                        <span className="amount-display">
                          ₹{formatCurrency(e.amount)}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() => onDeleteVendorEntry(e.id)}
                          title="Delete bill and recalculate vendor total"
                          aria-label={`Delete bill of ₹${e.amount} for ${e.vendor_name}`}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return React.memo ? React.memo(VendorSection) : VendorSection;
})();

window.KitchenComponents.VendorSection =
  window.KitchenComponents.Vendors.VendorSection;


// --- Component: static/js/components/Cooks/CookSection.jsx ---
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



// --- Component: static/js/components/Analytics/AnalyticsSection.jsx ---
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


// --- Component: static/js/components/Policy/PolicySection.jsx ---
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


// --- Component: static/js/components/Common/CreateSheetModal.jsx ---
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



// --- Component: static/js/components/Orders/OrderModals.jsx ---
// =============================================================================
// Orders Domain Modals (Add, Edit, Delete Order / Sponsor / Coupon)
// SOLID: Single Responsibility Principle (SRP) for Order Transaction Modals
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

(() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const {
    formatCurrency,
    toIsoDate,
    toSheetDate,
    calculateIncentiveClient,
    calculateOrderPricingClient
  } = window.KitchenConstants;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  // 1. Add Order / Sponsor Modal
  function AddOrderModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [date, setDate] = useState(() => toIsoDate(null));
    const [person, setPerson] = useState('');
    const [program, setProgram] = useState('');
    const [type, setType] = useState('Order');
    const [payment, setPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    const [received, setReceived] = useState('Yes');
    const [notes, setNotes] = useState('');
    const [devotees, setDevotees] = useState('');
    const [menu, setMenu] = useState('Medium');

    const isOrder = type.trim().toLowerCase() === 'order';
    const numDevotees = parseInt(devotees, 10) || 0;
    const liveIncentive = isOrder ? calculateIncentiveClient(numDevotees, menu) : 0;

    // Reset when modal opens
    useEffect(() => {
      if (isOpen) {
        setDate(toIsoDate(null));
        setPerson('');
        setProgram('');
        setType('Order');
        setPayment('Cash');
        setAmount('');
        setReceived('Yes');
        setNotes('');
        setDevotees('');
        setMenu('Medium');
      }
    }, [isOpen]);

    // Auto-update amount for orders when devotees/menu changes
    useEffect(() => {
      if (isOrder && numDevotees > 0 && menu) {
        const calculatedAmount = calculateOrderPricingClient(numDevotees, menu);
        setAmount(calculatedAmount || '');
      }
    }, [isOrder, numDevotees, menu]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({
        date: toSheetDate(date),
        person_name: person.trim(),
        program: program.trim(),
        type,
        payment_through: payment,
        amount: parseFloat(amount || 0),
        payment_received: received,
        notes: notes.trim(),
        number_of_devotees: isOrder ? numDevotees : 0,
        menu_type: isOrder ? menu : ''
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="modal-title-group">
              <div className="modal-title-icon icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
              </div>
              <div>
                <h3 className="dialog-title">Add New Order Entry</h3>
                <p className="dialog-subtitle">Record feast order, sponsorship or coupon into Google Sheet</p>
              </div>
            </div>
            <button type="button" className="btn-icon modal-close-btn" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order (Feast Catering)</option>
                    <option value="Sponsor">Sponsor (Donation)</option>
                    <option value="Coupon">Coupon (Prasadam)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required placeholder="e.g. Ramesh Prabhu / Bhakta Amit" value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" placeholder="e.g. Sunday Feast, Appearance Day" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
              </div>

              {isOrder && (
                <div className="order-details-box">
                  <div className="order-details-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Feast Order Pricing &amp; Incentive</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Devotees *</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 50"
                        value={devotees}
                        onChange={(e) => setDevotees(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Menu Tier *</label>
                      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
                        <option value="Light">Light (₹100 / plate)</option>
                        <option value="Medium">Medium (₹160 / plate)</option>
                        <option value="Heavy">Heavy (₹220 / plate)</option>
                        <option value="Very Heavy">Very Heavy (₹250 / plate)</option>
                      </select>
                    </div>
                  </div>

                  {liveIncentive > 0 && (
                    <div className="incentive-preview-box">
                      <div className="incentive-preview-main">
                        <span className="incentive-label">Section 3 Cook Incentive:</span>
                        <span className="incentive-badge">₹{formatCurrency(liveIncentive)}</span>
                      </div>
                      <span className="incentive-sub">(Added dynamically to each active cook)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Amount (₹) *
                    {isOrder && <span className="auto-calc-badge">Auto-Calculated</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={isOrder ? 'Auto-calculated for Orders' : 'Enter amount in ₹'}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Channel *</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay / UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className={received === 'Yes' ? 'select-status-paid' : 'select-status-pending'}
                  >
                    <option value="Yes">Paid (Received)</option>
                    <option value="No">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Comments</label>
                  <input type="text" placeholder="Optional notes or receipt #" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <span>{isSubmitting ? 'Syncing to Sheet...' : 'Add Order Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Edit Order / Sponsor Modal
  function EditOrderModal({ isOpen, record, onClose, onSubmit, isSubmitting }) {
    const [date, setDate] = useState('');
    const [person, setPerson] = useState('');
    const [program, setProgram] = useState('');
    const [type, setType] = useState('Order');
    const [payment, setPayment] = useState('Cash');
    const [amount, setAmount] = useState('');
    const [received, setReceived] = useState('Yes');
    const [notes, setNotes] = useState('');
    const [devotees, setDevotees] = useState('');
    const [menu, setMenu] = useState('Medium');

    useEffect(() => {
      if (record) {
        const isOrd = (record.type || '').trim().toLowerCase() === 'order';
        setDate(toIsoDate(record.date));
        setPerson(record.person_name || '');
        setProgram(record.program || '');
        setType(record.type || 'Order');
        setPayment(record.payment_through || 'Cash');
        setAmount(record.amount || '');
        const rcvdRaw = (record.payment_received || '').trim().toLowerCase();
        const isPaid = rcvdRaw === 'yes' || rcvdRaw === 'paid' || rcvdRaw === 'done' || rcvdRaw === 'y';
        setReceived(isPaid ? 'Yes' : 'No');
        setNotes(record.notes || '');
        setDevotees(isOrd && record.number_of_devotees ? record.number_of_devotees : '');
        setMenu(isOrd && record.menu_type ? record.menu_type : 'Medium');
      }
    }, [record]);

    if (!isOpen || !record) return null;

    const isOrder = type.trim().toLowerCase() === 'order';
    const numDevotees = parseInt(devotees, 10) || 0;
    const liveIncentive = isOrder ? calculateIncentiveClient(numDevotees, menu) : 0;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(record.id, {
        date: toSheetDate(date),
        person_name: person.trim(),
        program: program.trim(),
        type,
        payment_through: payment,
        amount: parseFloat(amount || 0),
        payment_received: received,
        notes: notes.trim(),
        number_of_devotees: isOrder ? numDevotees : 0,
        menu_type: isOrder ? menu : ''
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="modal-title-group">
              <div className="modal-title-icon icon-blue">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div>
                <h3 className="dialog-title">Edit Order / Transaction</h3>
                <p className="dialog-subtitle">Update record #{record.id} and sync updates to Google Sheet</p>
              </div>
            </div>
            <button type="button" className="btn-icon modal-close-btn" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order (Feast Catering)</option>
                    <option value="Sponsor">Sponsor (Donation)</option>
                    <option value="Coupon">Coupon (Prasadam)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
              </div>

              {isOrder && (
                <div className="order-details-box">
                  <div className="order-details-header">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>Feast Order Pricing &amp; Incentive</span>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Number of Devotees</label>
                      <input
                        type="number"
                        min="1"
                        value={devotees}
                        onChange={(e) => setDevotees(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Menu Tier</label>
                      <select value={menu} onChange={(e) => setMenu(e.target.value)}>
                        <option value="Light">Light (₹100 / plate)</option>
                        <option value="Medium">Medium (₹160 / plate)</option>
                        <option value="Heavy">Heavy (₹220 / plate)</option>
                        <option value="Very Heavy">Very Heavy (₹250 / plate)</option>
                      </select>
                    </div>
                  </div>

                  {liveIncentive > 0 && (
                    <div className="incentive-preview-box">
                      <div className="incentive-preview-main">
                        <span className="incentive-label">Section 3 Cook Incentive:</span>
                        <span className="incentive-badge">₹{formatCurrency(liveIncentive)}</span>
                      </div>
                      <span className="incentive-sub">(Added dynamically to each active cook)</span>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>
                    Amount (₹) *
                    {isOrder && <span className="auto-calc-badge">Auto-Calculated</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Channel *</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay / UPI</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select
                    value={received}
                    onChange={(e) => setReceived(e.target.value)}
                    className={received === 'Yes' ? 'select-status-paid' : 'select-status-pending'}
                  >
                    <option value="Yes">Paid (Received)</option>
                    <option value="No">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Comments</label>
                  <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                <span>{isSubmitting ? 'Updating in Sheet...' : 'Save & Update in Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Delete Order Modal
  function DeleteOrderModal({ isOpen, record, onClose, onConfirm, isDeleting }) {
    if (!isOpen || !record) return null;

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Confirm Deletion</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <div className="dialog-body">
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Are you sure you want to remove this record from the sheet?
            </p>
            <div style={{ background: 'var(--border-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <strong>{record.person_name}</strong> &bull; ₹{formatCurrency(record.amount)} ({record.date})
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isDeleting}>Cancel</button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={isDeleting}>
              {isDeleting ? <BtnSpinner /> : null}
              <span>{isDeleting ? 'Removing from Sheet...' : 'Delete from Sheet'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.KitchenComponents.Orders.AddOrderModal = AddOrderModal;
  window.KitchenComponents.Orders.EditOrderModal = EditOrderModal;
  window.KitchenComponents.Orders.DeleteOrderModal = DeleteOrderModal;

  window.KitchenComponents.AddOrderModal = AddOrderModal;
  window.KitchenComponents.EditOrderModal = EditOrderModal;
  window.KitchenComponents.DeleteOrderModal = DeleteOrderModal;
})();



// --- Component: static/js/components/Vendors/VendorModals.jsx ---
// =============================================================================
// Vendors Domain Modals (Add Entry, Register, Direct Edit, Itemized Bills)
// SOLID: Single Responsibility Principle (SRP) for Vendor Operations
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Vendors = window.KitchenComponents.Vendors || {};

(() => {
  const { React } = window;
  const { useState, useEffect } = React;
  const {
    formatCurrency,
    toIsoDate,
    toSheetDate
  } = window.KitchenConstants;
  const BtnSpinner = window.KitchenComponents?.Common?.BtnSpinner || window.KitchenComponents?.BtnSpinner || (() => <span className="btn-spinner" />);

  // 1. Add Vendor Bill Entry Modal
  function AddVendorEntryModal({ isOpen, availableVendors = [], defaultVendor = '', onClose, onSubmit, isSubmitting }) {
    const [selectedVendor, setSelectedVendor] = useState(defaultVendor || (availableVendors[0] || ''));
    const [newVendorName, setNewVendorName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(toIsoDate(null));
    const [notes, setNotes] = useState('');

    useEffect(() => {
      if (defaultVendor) {
        setSelectedVendor(defaultVendor);
      } else if (availableVendors.length > 0) {
        setSelectedVendor(availableVendors[0]);
      }
    }, [defaultVendor, availableVendors]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      const finalVendor = selectedVendor === '__new__' ? newVendorName.trim() : selectedVendor;
      if (!finalVendor) return;
      onSubmit({
        vendor_name: finalVendor,
        amount: parseFloat(amount || 0),
        date: toSheetDate(date),
        notes: notes.trim()
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Add Vendor Bill Entry</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor *</label>
                <select
                  required
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                >
                  {availableVendors.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                  <option value="__new__">+ Register New Vendor...</option>
                </select>
              </div>

              {selectedVendor === '__new__' && (
                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>New Vendor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter vendor / shop name"
                    value={newVendorName}
                    onChange={(e) => setNewVendorName(e.target.value)}
                  />
                </div>
              )}

              <div className="form-grid" style={{ marginTop: '0.75rem' }}>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Bill Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Vegetables, Oil, Ghee, Spices"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Writing & Syncing...' : 'Save Entry & Sync to Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Register New Vendor Modal
  function RegisterVendorModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [initialAmount, setInitialAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!name.trim()) return;
      onSubmit({
        vendor_name: name.trim(),
        initial_amount: parseFloat(initialAmount || 0)
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Register New Vendor</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balaji Groceries"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Initial Opening Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Optional, default 0"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Registering...' : 'Add to Available Vendors'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Edit Vendor Direct Sheet Amount Modal
  function EditVendorModal({ isOpen, vendor, onClose, onSubmit, isSubmitting }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
      if (vendor) {
        setName(vendor.vendor_name || '');
        setAmount(vendor.amount || '');
      }
    }, [vendor]);

    if (!isOpen || !vendor) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(vendor.row_number, {
        vendor_name: name.trim(),
        amount: parseFloat(amount || 0)
      });
    };

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <h3>Edit Vendor: {vendor.vendor_name}</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-group">
                <label>Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Direct Sheet Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Updating Google Sheet...' : 'Update in Google Sheet'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 4. Vendor Bills Itemized Modal
  function VendorBillsModal({ isOpen, vendorName, bills = [], onClose, onAddBill, onDeleteBill }) {
    if (!isOpen || !vendorName) return null;

    const total = bills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
          <div className="dialog-header">
            <div>
              <h3>Bills: {vendorName}</h3>
              <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Total Calculated: ₹{formatCurrency(total)} ({bills.length} {bills.length === 1 ? 'bill' : 'bills'})
              </p>
            </div>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>
          <div className="dialog-body">
            <div className="table-scroll-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description / Notes</th>
                    <th>Amount (₹)</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                        No detailed bills logged yet for {vendorName}. Direct amount from sheet: ₹{formatCurrency(total)}
                      </td>
                    </tr>
                  ) : (
                    bills.map((b) => (
                      <tr key={b.id}>
                        <td>{b.date || '—'}</td>
                        <td>{b.notes || 'Grocery bill'}</td>
                        <td><span className="amount-display">₹{formatCurrency(b.amount)}</span></td>
                        <td className="text-right">
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger"
                            onClick={() => onDeleteBill(b.id)}
                            title="Delete bill"
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                onClose();
                onAddBill(vendorName);
              }}
            >
              + Add Bill for {vendorName}
            </button>
          </div>
        </div>
      </div>
    );
  }

  window.KitchenComponents.Vendors.AddVendorEntryModal = AddVendorEntryModal;
  window.KitchenComponents.Vendors.RegisterVendorModal = RegisterVendorModal;
  window.KitchenComponents.Vendors.EditVendorModal = EditVendorModal;
  window.KitchenComponents.Vendors.VendorBillsModal = VendorBillsModal;

  window.KitchenComponents.AddVendorEntryModal = AddVendorEntryModal;
  window.KitchenComponents.RegisterVendorModal = RegisterVendorModal;
  window.KitchenComponents.EditVendorModal = EditVendorModal;
  window.KitchenComponents.VendorBillsModal = VendorBillsModal;
})();



// --- Component: static/js/components/Cooks/CookModals.jsx ---
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



// --- Component: static/js/components/Modals.jsx ---
// =============================================================================
// Kitchen Accountability ERP - Modal Aggregation Facade
// SOLID: Single Responsibility Principle (SRP) & Interface Segregation (ISP)
// Aggregates segregated domain modals (Orders, Vendors, Cooks, Common) into
// unified namespace with 100% backward compatibility.
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Modals = (() => {
  const KC = window.KitchenComponents;

  // Retrieve segregated domain modals
  const AddOrderModal = KC.Orders?.AddOrderModal || KC.AddOrderModal;
  const EditOrderModal = KC.Orders?.EditOrderModal || KC.EditOrderModal;
  const DeleteOrderModal = KC.Orders?.DeleteOrderModal || KC.DeleteOrderModal;

  const AddVendorEntryModal = KC.Vendors?.AddVendorEntryModal || KC.AddVendorEntryModal;
  const RegisterVendorModal = KC.Vendors?.RegisterVendorModal || KC.RegisterVendorModal;
  const EditVendorModal = KC.Vendors?.EditVendorModal || KC.EditVendorModal;
  const VendorBillsModal = KC.Vendors?.VendorBillsModal || KC.VendorBillsModal;

  const AddCookModal = KC.Cooks?.AddCookModal || KC.AddCookModal;
  const EditCookModal = KC.Cooks?.EditCookModal || KC.EditCookModal;

  const CreateSheetModal = KC.Common?.CreateSheetModal || KC.CreateSheetModal;

  return {
    AddOrderModal,
    EditOrderModal,
    DeleteOrderModal,
    AddVendorEntryModal,
    RegisterVendorModal,
    EditVendorModal,
    VendorBillsModal,
    AddCookModal,
    EditCookModal,
    CreateSheetModal
  };
})();

// Re-export onto window.KitchenComponents root namespace for backward compatibility
Object.assign(window.KitchenComponents, window.KitchenComponents.Modals);


// --- Component: static/js/App.jsx ---
// =============================================================================
// Kitchen Accountability ERP - Root Application Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.App = (() => {
  const { React } = window;
  const {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useTransition,
    useDeferredValue
  } = React;

  const api = window.KitchenAPI;
  const KC = window.KitchenComponents || {};
  const Header = KC.Header?.Header || KC.Header || (() => null);
  const Navigation = KC.Navigation?.Navigation || KC.Navigation || (() => null);
  const SyncBanner = KC.SyncBanner?.SyncBanner || KC.SyncBanner || (() => null);
  const ToastContainer = KC.Toast?.ToastContainer || KC.ToastContainer || (() => null);
  const StatsCards = KC.Orders?.StatsCards?.StatsCards || KC.Orders?.StatsCards || KC.StatsCards || (() => null);
  const OrdersToolbar = KC.Orders?.OrdersToolbar?.OrdersToolbar || KC.Orders?.OrdersToolbar || KC.OrdersToolbar || (() => null);
  const OrdersTable = KC.Orders?.OrdersTable?.OrdersTable || KC.Orders?.OrdersTable || KC.OrdersTable || (() => null);
  const OrdersMobileCards = KC.Orders?.OrdersMobileCards?.OrdersMobileCards || KC.Orders?.OrdersMobileCards || KC.OrdersMobileCards || (() => null);
  const Pagination = KC.Orders?.Pagination?.Pagination || KC.Orders?.Pagination || KC.Pagination || (() => null);
  const VendorSection = KC.Vendors?.VendorSection?.VendorSection || KC.Vendors?.VendorSection || KC.VendorSection || (() => null);
  const CookSection = KC.Cooks?.CookSection?.CookSection || KC.Cooks?.CookSection || KC.CookSection || (() => null);
  const AnalyticsSection = KC.Analytics?.AnalyticsSection?.AnalyticsSection || KC.Analytics?.AnalyticsSection || KC.AnalyticsSection || (() => null);
  const PolicySection = KC.Policy?.PolicySection?.PolicySection || KC.Policy?.PolicySection || KC.PolicySection || (() => null);

  const Modals = KC.Modals || KC;
  const AddOrderModal = Modals.AddOrderModal || (() => null);
  const EditOrderModal = Modals.EditOrderModal || (() => null);
  const DeleteOrderModal = Modals.DeleteOrderModal || (() => null);
  const AddVendorEntryModal = Modals.AddVendorEntryModal || (() => null);
  const RegisterVendorModal = Modals.RegisterVendorModal || (() => null);
  const EditVendorModal = Modals.EditVendorModal || (() => null);
  const VendorBillsModal = Modals.VendorBillsModal || (() => null);
  const AddCookModal = Modals.AddCookModal || (() => null);
  const EditCookModal = Modals.EditCookModal || (() => null);
  const CreateSheetModal = Modals.CreateSheetModal || (() => null);

  function App() {
    // -------------------------------------------------------------------------
    // Theme State
    // -------------------------------------------------------------------------
    const [theme, setTheme] = useState(() => {
      return document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
    });

    const toggleTheme = useCallback(() => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      localStorage.setItem('theme', nextTheme);
      window.showToast(nextTheme === 'dark' ? 'Night mode enabled' : 'Day mode enabled', 'success');
    }, [theme]);

    // -------------------------------------------------------------------------
    // Global Navigation & Tab State
    // -------------------------------------------------------------------------
    const [activePage, setActivePage] = useState('transactions'); // 'transactions', 'vendors', 'cooks', 'analytics', 'policy'
    const [currentTab, setCurrentTab] = useState(() => localStorage.getItem('selectedTab') || 'April 26');
    const [availableTabs, setAvailableTabs] = useState(['April 26']);
    const [syncStatus, setSyncStatus] = useState({ mode: 'loading', spreadsheet_title: '', isSyncing: false });

    // React 19 Concurrent Transitions
    const [isNavPending, startNavTransition] = useTransition();
    const [isTabPending, startTabTransition] = useTransition();
    const [isRefreshing, startRefreshTransition] = useTransition();

    const handleSelectPage = useCallback((newPage) => {
      startNavTransition(() => {
        setActivePage(newPage);
      });
    }, []);

    // -------------------------------------------------------------------------
    // Data States
    // -------------------------------------------------------------------------
    const [allRecords, setAllRecords] = useState([]);
    const [metrics, setMetrics] = useState({});
    const [isRecordsLoading, setIsRecordsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    const [vendorsData, setVendorsData] = useState({ vendors: [], available_vendors: [], all_entries: [], total_vendor_expenses: 0, net_difference: 0 });
    const [isVendorsLoading, setIsVendorsLoading] = useState(false);

    const [cooksData, setCooksData] = useState({ cooks: [], cook_count: 0, total_cook_incentive: 0, total_payroll: 0 });
    const [isCooksLoading, setIsCooksLoading] = useState(false);

    // -------------------------------------------------------------------------
    // Filters & Pagination State
    // -------------------------------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All');
    const [paymentFilter, setPaymentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [menuFilter, setMenuFilter] = useState('All');
    const [mobileRecordView, setMobileRecordView] = useState('cards'); // 'cards' | 'table'
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState('10');

    // -------------------------------------------------------------------------
    // Modals State
    // -------------------------------------------------------------------------
    const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
    const [editOrderRecord, setEditOrderRecord] = useState(null);
    const [deleteOrderRecord, setDeleteOrderRecord] = useState(null);

    const [isAddVendorEntryOpen, setIsAddVendorEntryOpen] = useState(false);
    const [defaultVendorForBill, setDefaultVendorForBill] = useState('');
    const [isRegisterVendorOpen, setIsRegisterVendorOpen] = useState(false);
    const [editVendorRecord, setEditVendorRecord] = useState(null);
    const [activeVendorForBills, setActiveVendorForBills] = useState(null);

    const [isAddCookOpen, setIsAddCookOpen] = useState(false);
    const [editCookRecord, setEditCookRecord] = useState(null);

    const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);

    const [modalSubmitting, setModalSubmitting] = useState(false);

    // -------------------------------------------------------------------------
    // Data Fetching Functions
    // -------------------------------------------------------------------------
    const fetchStatus = useCallback(async () => {
      try {
        const data = await api.getStatus();
        setSyncStatus((prev) => ({
          ...prev,
          mode: data.mode,
          spreadsheet_title: data.spreadsheet_title,
          google_sheet_url: data.google_sheet_url
        }));

        if (data.available_tabs && data.available_tabs.length > 0) {
          setAvailableTabs(data.available_tabs);
          const saved = localStorage.getItem('selectedTab');
          if (saved && data.available_tabs.includes(saved)) {
            setCurrentTab(saved);
          } else if (data.current_tab) {
            setCurrentTab(data.current_tab);
          }
        }
      } catch (err) {
        console.error('fetchStatus error:', err);
        setSyncStatus((prev) => ({ ...prev, mode: 'local_excel' }));
      }
    }, []);

    const fetchRecords = useCallback(async (tab, forceRefresh = false) => {
      setIsRecordsLoading(true);
      try {
        const data = await api.getRecords(tab, forceRefresh);
        setAllRecords(data.records || []);
        setMetrics(data.metrics || {});
      } catch (err) {
        console.error('fetchRecords error:', err);
        window.showToast('Error loading records from Google Sheet', 'error');
      } finally {
        setIsRecordsLoading(false);
      }
    }, []);

    const fetchVendors = useCallback(async (tab) => {
      setIsVendorsLoading(true);
      try {
        const data = await api.getVendors(tab);
        setVendorsData(data || {});
      } catch (err) {
        console.error('fetchVendors error:', err);
      } finally {
        setIsVendorsLoading(false);
      }
    }, []);

    const fetchCooks = useCallback(async (tab) => {
      setIsCooksLoading(true);
      try {
        const data = await api.getCooks(tab);
        setCooksData(data || {});
      } catch (err) {
        console.error('fetchCooks error:', err);
      } finally {
        setIsCooksLoading(false);
      }
    }, []);

    // Initial Load
    useEffect(() => {
      fetchStatus();
    }, [fetchStatus]);

    // Fetch tab-dependent data when currentTab changes
    useEffect(() => {
      if (currentTab) {
        fetchRecords(currentTab);
        fetchVendors(currentTab);
        fetchCooks(currentTab);
      }
    }, [currentTab, fetchRecords, fetchVendors, fetchCooks]);

    // Month Selector Change with React 19 Concurrent Transition
    const handleTabChange = useCallback((newTab) => {
      startTabTransition(() => {
        setCurrentTab(newTab);
        localStorage.setItem('selectedTab', newTab);
        setCurrentPage(1);
      });
      window.showToast(`Switched to month: ${newTab}`, 'info');
      api.selectTab(newTab).catch((err) => {
        console.error('selectTab error:', err);
      });
    }, []);

    // Force Refresh Action with React 19 Async Action Transition
    const handleRefresh = useCallback(() => {
      startRefreshTransition(async () => {
        setSyncStatus((prev) => ({ ...prev, isSyncing: true }));
        try {
          await Promise.all([
            fetchRecords(currentTab, true),
            fetchVendors(currentTab),
            fetchCooks(currentTab)
          ]);
          window.showToast('Kitchen records freshly synchronized with Google Sheet!', 'success');
        } catch (err) {
          window.showToast(`Sync error: ${err.message}`, 'error');
        } finally {
          setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
          fetchStatus();
        }
      });
    }, [currentTab, fetchRecords, fetchVendors, fetchCooks, fetchStatus]);

    // Export to Excel Action
    const handleExportExcel = useCallback(() => {
      setIsExporting(true);
      window.showToast(`Generating Excel export for ${currentTab}...`, 'info');
      window.location.href = `/api/export?tab=${encodeURIComponent(currentTab)}`;
      setTimeout(() => {
        setIsExporting(false);
      }, 1800);
    }, [currentTab]);

    // -------------------------------------------------------------------------
    // React 19 Deferred Values & In-Memory Filtering
    // -------------------------------------------------------------------------
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const deferredTypeFilter = useDeferredValue(typeFilter);
    const deferredPaymentFilter = useDeferredValue(paymentFilter);
    const deferredStatusFilter = useDeferredValue(statusFilter);
    const deferredMenuFilter = useDeferredValue(menuFilter);

    // Indicator if deferred results are still reconciling
    const isFilterDeferred =
      searchQuery !== deferredSearchQuery ||
      typeFilter !== deferredTypeFilter ||
      paymentFilter !== deferredPaymentFilter ||
      statusFilter !== deferredStatusFilter ||
      menuFilter !== deferredMenuFilter;

    const filteredRecords = useMemo(() => {
      const q = deferredSearchQuery.trim().toLowerCase();
      return allRecords.filter((r) => {
        if (q) {
          const matchText = (
            (r.person_name || '') + ' ' +
            (r.program || '') + ' ' +
            (r.date || '') + ' ' +
            (r.notes || '') + ' ' +
            (r.menu_type || '') + ' ' +
            String(r.amount || '')
          ).toLowerCase();
          if (!matchText.includes(q)) return false;
        }

        if (deferredTypeFilter !== 'All') {
          if ((r.type || '').toLowerCase() !== deferredTypeFilter.toLowerCase()) return false;
        }

        if (deferredPaymentFilter !== 'All') {
          if (!(r.payment_through || '').toLowerCase().includes(deferredPaymentFilter.toLowerCase())) return false;
        }

        if (deferredStatusFilter !== 'All') {
          const rcvdRaw = (r.payment_received || '').trim().toLowerCase();
          const isPaid = rcvdRaw === 'yes' || rcvdRaw === 'paid' || rcvdRaw === 'done' || rcvdRaw === 'y';
          if ((deferredStatusFilter === 'Paid' || deferredStatusFilter === 'Yes') && !isPaid) return false;
          if ((deferredStatusFilter === 'Pending' || deferredStatusFilter === 'No') && isPaid) return false;
        }

        if (deferredMenuFilter !== 'All') {
          if (!(r.menu_type || '').toLowerCase().includes(deferredMenuFilter.toLowerCase())) return false;
        }

        return true;
      });
    }, [allRecords, deferredSearchQuery, deferredTypeFilter, deferredPaymentFilter, deferredStatusFilter, deferredMenuFilter]);

    const paginatedRecords = useMemo(() => {
      const effectiveSize = pageSize === 'all' ? filteredRecords.length : parseInt(pageSize, 10);
      const startIndex = (currentPage - 1) * effectiveSize;
      return pageSize === 'all' ? filteredRecords : filteredRecords.slice(startIndex, startIndex + effectiveSize);
    }, [filteredRecords, currentPage, pageSize]);

    // -------------------------------------------------------------------------
    // Order CRUD Actions
    // -------------------------------------------------------------------------
    const handleAddOrder = useCallback(async (payload) => {
      setModalSubmitting(true);
      try {
        await api.createRecord(currentTab, payload);
        window.showToast('Added transaction to Google Sheet!', 'success');
        setIsAddOrderOpen(false);
        await fetchRecords(currentTab, true);
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchRecords, fetchCooks]);

    const handleEditOrder = useCallback(async (recordId, payload) => {
      setModalSubmitting(true);
      try {
        await api.updateRecord(currentTab, recordId, payload);
        window.showToast('Updated transaction in Google Sheet!', 'success');
        setEditOrderRecord(null);
        await fetchRecords(currentTab, true);
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchRecords, fetchCooks]);

    const handleDeleteOrder = useCallback(async () => {
      if (!deleteOrderRecord) return;
      setModalSubmitting(true);
      try {
        await api.deleteRecord(currentTab, deleteOrderRecord.id);
        window.showToast('Removed transaction from Google Sheet!', 'success');
        setDeleteOrderRecord(null);
        await fetchRecords(currentTab, true);
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, deleteOrderRecord, fetchRecords, fetchCooks]);

    // -------------------------------------------------------------------------
    // Vendor CRUD Actions
    // -------------------------------------------------------------------------
    const handleAddVendorEntry = useCallback(async (payload) => {
      setModalSubmitting(true);
      try {
        await api.createVendorEntry(currentTab, payload);
        window.showToast(`Added ₹${payload.amount} bill for ${payload.vendor_name}!`, 'success');
        setIsAddVendorEntryOpen(false);
        await fetchVendors(currentTab);
        await fetchRecords(currentTab, true);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchVendors, fetchRecords]);

    const handleRegisterVendor = useCallback(async (payload) => {
      setModalSubmitting(true);
      try {
        await api.createVendor(currentTab, payload);
        window.showToast(`Registered new vendor "${payload.vendor_name}" in sheet!`, 'success');
        setIsRegisterVendorOpen(false);
        await fetchVendors(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchVendors]);

    const handleEditVendor = useCallback(async (rowNumber, payload) => {
      setModalSubmitting(true);
      try {
        await api.updateVendor(currentTab, rowNumber, payload);
        window.showToast(`Updated vendor in Row ${rowNumber}!`, 'success');
        setEditVendorRecord(null);
        await fetchVendors(currentTab);
        await fetchRecords(currentTab, true);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchVendors, fetchRecords]);

    const handleDeleteVendor = useCallback(async (rowNumber, vendorName) => {
      if (!window.confirm(`Are you sure you want to clear vendor "${vendorName}" at Row ${rowNumber}?`)) return;
      try {
        await api.deleteVendor(currentTab, rowNumber);
        window.showToast(`Cleared vendor entry from Row ${rowNumber}!`, 'success');
        await fetchVendors(currentTab);
        await fetchRecords(currentTab, true);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      }
    }, [currentTab, fetchVendors, fetchRecords]);

    const handleDeleteVendorEntry = useCallback(async (entryId) => {
      if (!window.confirm('Delete this vendor bill? The vendor total will be recalculated in Google Sheet.')) return;
      try {
        await api.deleteVendorEntry(currentTab, entryId);
        window.showToast('Bill entry removed and vendor total updated in Google Sheet!', 'success');
        await fetchVendors(currentTab);
        await fetchRecords(currentTab, true);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      }
    }, [currentTab, fetchVendors, fetchRecords]);

    // -------------------------------------------------------------------------
    // Cook CRUD Actions
    // -------------------------------------------------------------------------
    const handleAddCook = useCallback(async (payload) => {
      setModalSubmitting(true);
      try {
        await api.createCook(currentTab, payload);
        window.showToast(`Cook profile added for "${payload.name}" and synced to Sheet!`, 'success');
        setIsAddCookOpen(false);
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchCooks]);

    const handleEditCook = useCallback(async (cookId, payload) => {
      setModalSubmitting(true);
      try {
        await api.updateCook(currentTab, cookId, payload);
        window.showToast('Updated cook payroll and synchronized to Google Sheet!', 'success');
        setEditCookRecord(null);
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [currentTab, fetchCooks]);

    const handleDeleteCook = useCallback(async (cookId, name) => {
      if (!window.confirm(`Are you sure you want to remove cook "${name}"?`)) return;
      try {
        await api.deleteCook(cookId);
        window.showToast(`Removed cook "${name}" and updated Google Sheet!`, 'success');
        await fetchCooks(currentTab);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      }
    }, [currentTab, fetchCooks]);

    // -------------------------------------------------------------------------
    // Sheet Creation (Template Cloning)
    // -------------------------------------------------------------------------
    const handleCreateSheet = useCallback(async (newSheetName) => {
      setModalSubmitting(true);
      try {
        await api.createSheet(newSheetName, 'Master_Template');
        window.showToast(`Created new month sheet: "${newSheetName}"!`, 'success');
        setIsCreateSheetOpen(false);
        await fetchStatus();
        setCurrentTab(newSheetName);
        localStorage.setItem('selectedTab', newSheetName);
      } catch (err) {
        window.showToast(`Error: ${err.message}`, 'error');
      } finally {
        setModalSubmitting(false);
      }
    }, [fetchStatus]);

    // Active bills for detail modal
    const activeVendorBills = useMemo(() => {
      if (!activeVendorForBills) return [];
      return (vendorsData.all_entries || []).filter(
        (e) => (e.vendor_name || '').trim().toLowerCase() === activeVendorForBills.trim().toLowerCase()
      );
    }, [activeVendorForBills, vendorsData.all_entries]);

    return (
      <div className="app-layout">
        {/* Fixed / Sticky Top Section (Header + 5-Tab Navigation Bar) */}
        <div className="app-top-section">
          {/* Top Header */}
          <Header
            currentTab={currentTab}
            availableTabs={availableTabs}
            onTabChange={handleTabChange}
            onOpenCreateSheet={() => setIsCreateSheetOpen(true)}
            syncStatus={syncStatus}
            theme={theme}
            onThemeToggle={toggleTheme}
          />

          {/* 5-Tab Navigation Bar */}
          <Navigation activePage={activePage} onSelectPage={handleSelectPage} isNavPending={isNavPending} />
        </div>

        {/* Main Content Area */}
        <main className="main-container">
          {/* Live Sync Banner */}
          <SyncBanner syncStatus={syncStatus} currentTab={currentTab} />

          {/* PAGE 1: Orders & Sponsors */}
          {activePage === 'transactions' && (
            <div id="pageTransactions" className="app-page active">
              {/* KPI Stats Grid */}
              <StatsCards metrics={metrics} />

              {/* Controls Toolbar */}
              <OrdersToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                typeFilter={typeFilter}
                onTypeFilterChange={setTypeFilter}
                paymentFilter={paymentFilter}
                onPaymentFilterChange={setPaymentFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                menuFilter={menuFilter}
                onMenuFilterChange={setMenuFilter}
                isRefreshing={isRefreshing}
                onRefresh={handleRefresh}
                isExporting={isExporting}
                onExportExcel={handleExportExcel}
                onOpenAddModal={() => setIsAddOrderOpen(true)}
              />

              {/* Records Table & Cards Container */}
              <section
                className="table-container"
                aria-label="Records Table"
                style={{
                  opacity: isFilterDeferred ? 0.72 : 1,
                  transition: 'opacity 0.15s ease'
                }}
              >
                <div className="table-header-bar">
                  <h2 className="section-title">
                    <span id="currentMonthTitle">{currentTab}</span> Transactions
                  </h2>
                  <div className="table-header-actions">
                    {/* Mobile View Toggle */}
                    <div className="mobile-view-toggle hide-desktop" id="mobileViewToggle">
                      <button
                        type="button"
                        className={`view-toggle-btn ${mobileRecordView === 'cards' ? 'active' : ''}`}
                        onClick={() => setMobileRecordView('cards')}
                        title="Card View"
                        aria-label="Card View"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>Cards</span>
                      </button>
                      <button
                        type="button"
                        className={`view-toggle-btn ${mobileRecordView === 'table' ? 'active' : ''}`}
                        onClick={() => setMobileRecordView('table')}
                        title="Table View"
                        aria-label="Table View"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                        <span>Table</span>
                      </button>
                    </div>

                    <span className="record-count-badge" id="recordCountLabel">
                      {filteredRecords.length} {filteredRecords.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                {/* Desktop / Tablet Table */}
                <div className={`orders-table-wrapper ${mobileRecordView === 'cards' ? 'hide-mobile' : ''}`}>
                  <OrdersTable
                    records={paginatedRecords}
                    isLoading={isRecordsLoading}
                    onEditRecord={setEditOrderRecord}
                    onDeleteRecord={setDeleteOrderRecord}
                  />
                </div>

                {/* Mobile Cards List */}
                <div className={mobileRecordView === 'table' ? 'hide-mobile' : 'hide-desktop'}>
                  <OrdersMobileCards
                    records={paginatedRecords}
                    isLoading={isRecordsLoading}
                    onEditRecord={setEditOrderRecord}
                    onDeleteRecord={setDeleteOrderRecord}
                  />
                </div>

                {/* Pagination Controls */}
                <Pagination
                  total={filteredRecords.length}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                />
              </section>
            </div>
          )}

          {/* PAGE 2: Vendor Management */}
          {activePage === 'vendors' && (
            <VendorSection
              vendorsData={vendorsData}
              isLoading={isVendorsLoading}
              onOpenRegisterVendor={() => setIsRegisterVendorOpen(true)}
              onOpenAddBill={(vendorName) => {
                setDefaultVendorForBill(vendorName || '');
                setIsAddVendorEntryOpen(true);
              }}
              onOpenEditVendor={setEditVendorRecord}
              onDeleteVendor={handleDeleteVendor}
              onViewVendorBills={setActiveVendorForBills}
              onDeleteVendorEntry={handleDeleteVendorEntry}
            />
          )}

          {/* PAGE 3: Cook Management & Payroll */}
          {activePage === 'cooks' && (
            <CookSection
              cooksData={cooksData}
              currentTab={currentTab}
              isLoading={isCooksLoading}
              onOpenAddCook={() => setIsAddCookOpen(true)}
              onOpenEditCook={setEditCookRecord}
              onDeleteCook={handleDeleteCook}
            />
          )}

          {/* PAGE 4: Donation Analytics */}
          {activePage === 'analytics' && (
            <AnalyticsSection metrics={metrics} />
          )}

          {/* PAGE 5: Kitchen Policy & Rules */}
          {activePage === 'policy' && (
            <PolicySection />
          )}
        </main>

        {/* Global Toast Container */}
        <ToastContainer />

        {/* All Modals */}
        <AddOrderModal
          isOpen={isAddOrderOpen}
          onClose={() => setIsAddOrderOpen(false)}
          onSubmit={handleAddOrder}
          isSubmitting={modalSubmitting}
        />

        <EditOrderModal
          isOpen={Boolean(editOrderRecord)}
          record={editOrderRecord}
          onClose={() => setEditOrderRecord(null)}
          onSubmit={handleEditOrder}
          isSubmitting={modalSubmitting}
        />

        <DeleteOrderModal
          isOpen={Boolean(deleteOrderRecord)}
          record={deleteOrderRecord}
          onClose={() => setDeleteOrderRecord(null)}
          onConfirm={handleDeleteOrder}
          isDeleting={modalSubmitting}
        />

        <AddVendorEntryModal
          isOpen={isAddVendorEntryOpen}
          availableVendors={vendorsData.available_vendors || []}
          defaultVendor={defaultVendorForBill}
          onClose={() => setIsAddVendorEntryOpen(false)}
          onSubmit={handleAddVendorEntry}
          isSubmitting={modalSubmitting}
        />

        <RegisterVendorModal
          isOpen={isRegisterVendorOpen}
          onClose={() => setIsRegisterVendorOpen(false)}
          onSubmit={handleRegisterVendor}
          isSubmitting={modalSubmitting}
        />

        <EditVendorModal
          isOpen={Boolean(editVendorRecord)}
          vendor={editVendorRecord}
          onClose={() => setEditVendorRecord(null)}
          onSubmit={handleEditVendor}
          isSubmitting={modalSubmitting}
        />

        <VendorBillsModal
          isOpen={Boolean(activeVendorForBills)}
          vendorName={activeVendorForBills}
          bills={activeVendorBills}
          onClose={() => setActiveVendorForBills(null)}
          onAddBill={(v) => {
            setDefaultVendorForBill(v);
            setIsAddVendorEntryOpen(true);
          }}
          onDeleteBill={handleDeleteVendorEntry}
        />

        <AddCookModal
          isOpen={isAddCookOpen}
          onClose={() => setIsAddCookOpen(false)}
          onSubmit={handleAddCook}
          isSubmitting={modalSubmitting}
        />

        <EditCookModal
          isOpen={Boolean(editCookRecord)}
          cook={editCookRecord}
          onClose={() => setEditCookRecord(null)}
          onSubmit={handleEditCook}
          isSubmitting={modalSubmitting}
        />

        <CreateSheetModal
          isOpen={isCreateSheetOpen}
          onClose={() => setIsCreateSheetOpen(false)}
          onSubmit={handleCreateSheet}
          isSubmitting={modalSubmitting}
        />
      </div>
    );
  }

  return React.memo ? React.memo(App) : App;
})();

window.KitchenComponents.App.App = window.KitchenComponents.App;


// --- Component: static/js/index.jsx ---
// =============================================================================
// Kitchen Accountability ERP - Application Entry Point (React 19)
// =============================================================================

(() => {
  function mount() {
    const React = window.React;
    const ReactDOM = window.ReactDOM;
    const App =
      window.KitchenComponents?.App?.App || window.KitchenComponents?.App;
    const rootElement = document.getElementById("root");

    if (!rootElement) {
      console.error('[KitchenERP] Root element "#root" not found in DOM.');
      return;
    }
    if (!App) {
      console.error(
        "[KitchenERP] App component not found on window.KitchenComponents.",
      );
      return;
    }
    if (!React || !ReactDOM) {
      console.warn("[KitchenERP] Waiting for React runtime initialization...");
      return;
    }

    if (!rootElement.__reactRoot && ReactDOM.createRoot) {
      rootElement.__reactRoot = ReactDOM.createRoot(rootElement);
      rootElement.__reactRoot.render(React.createElement(App));
      console.info(
        `[KitchenERP] Mounted successfully with React ${React.version || "19"}`,
      );
    } else if (rootElement.__reactRoot) {
      rootElement.__reactRoot.render(React.createElement(App));
    } else {
      ReactDOM.render(React.createElement(App), rootElement);
    }
  }

  if (window.React && window.ReactDOM) {
    mount();
  } else {
    window.addEventListener("react19-ready", mount, { once: true });
    // Safe fallback timeout
    setTimeout(() => {
      const root = document.getElementById("root");
      if (root && root.querySelector(".spinner-modern")) {
        mount();
      }
    }, 200);
  }
})();


