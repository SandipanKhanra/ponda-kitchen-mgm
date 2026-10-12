// =============================================================================
// Kitchen Accountability ERP - Consolidated App Bundle (React 18)
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

  return {
    SpinnerModern,
    BtnSpinner,
    TableLoadingCell,
    MobileLoadingBox,
    StatusBadge,
    TypeBadge,
    PaymentBadge,
    PaymentStatusBadge
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="brand-title">Kitchen Accountability</h1>
            <p className="brand-subtitle">
              ISKCON Ponda &bull; Live Google Sheets ERP
            </p>
          </div>
        </div>

        <div className="topbar-actions">
          {/* Month Selector & New Sheet Button */}
          <div className="month-selector-wrapper">
            <label htmlFor="monthTabSelect" className="hide-mobile" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
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
              className="btn btn-secondary btn-sm"
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

  return Header;
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

  function Navigation({ activePage, onSelectPage }) {
    return (
      <nav className="main-nav-bar" aria-label="Main Navigation">
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

  return Navigation;
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

  return SyncBanner;
})();

window.KitchenComponents.SyncBanner.SyncBanner = window.KitchenComponents.SyncBanner;



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

  return StatsCards;
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
    return (
      <section className="controls-toolbar">
        <div className="search-filter-group">
          {/* Search Input */}
          <div className="search-box">
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            />
          </div>

          {/* 4 Dropdown Filters (2x2 Grid on Mobile) */}
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
        </div>

        {/* Action Button Group */}
        <div className="action-btn-group">
          {/* Refresh Button with Spinner Animation */}
          <button
            id="refreshBtn"
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
            className="btn btn-primary"
            onClick={onOpenAddModal}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Entry</span>
          </button>
        </div>
      </section>
    );
  }

  return OrdersToolbar;
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
    return (
      <div className="table-scroll-wrapper" id="recordsTableWrapper">
        <table className="data-table" aria-label="Transactions table">
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
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{r.date}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.person_name}</div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{r.program || '—'}</span>
                    </td>
                    <td>
                      <TypeBadge type={r.type} />
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{devCount}</span>
                    </td>
                    <td>
                      <span className="category-tag">{menuType}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{inc}</span>
                    </td>
                    <td>
                      <span className="amount-display">₹{formatCurrency(r.amount)}</span>
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

  return OrdersTable;
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

  return OrdersMobileCards;
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

    const effectivePageSize = pageSize === 'all' ? total : parseInt(pageSize, 10);
    const maxPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(total / effectivePageSize)) : 1;
    const startIndex = (currentPage - 1) * effectivePageSize;
    const countOnPage = pageSize === 'all' ? total : Math.min(effectivePageSize, total - startIndex);
    const end = startIndex + countOnPage;

    const startP = Math.max(1, currentPage - 2);
    const endP = Math.min(maxPages, currentPage + 2);
    const pageNumbers = [];
    for (let p = startP; p <= endP; p++) {
      pageNumbers.push(p);
    }

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

  return Pagination;
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
  const { formatCurrency } = window.KitchenConstants;
  const TableLoadingCell = window.KitchenComponents?.Common?.TableLoadingCell || window.KitchenComponents?.TableLoadingCell || (() => null);

  function VendorSection({
    vendorsData = {},
    isLoading = false,
    onOpenRegisterVendor,
    onOpenAddBill,
    onOpenEditVendor,
    onDeleteVendor,
    onViewVendorBills,
    onDeleteVendorEntry
  }) {
    const vendors = vendorsData.vendors || [];
    const availableVendors = vendorsData.available_vendors || [];
    const allEntries = vendorsData.all_entries || [];
    const totalExpenses = vendorsData.total_vendor_expenses || 0;
    const netDifference = vendorsData.net_difference || 0;

    return (
      <div id="pageVendors" className="app-page active">
        {/* Vendor Header Actions */}
        <section className="section-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="section-title" style={{ margin: 0 }}>Vendor Management &amp; Expense Tracking</h2>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Live synchronization with Google Sheets Columns N-P &amp; itemized grocery bills
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onOpenRegisterVendor}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Vendor Bills</span>
              <span id="statVendorTotal" className="stat-value">₹{formatCurrency(totalExpenses)}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-blue">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Active Vendors</span>
              <span id="statVendorCount" className="stat-value">{availableVendors.length}</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-emerald">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-label">Net Balance (Surplus / Deficit)</span>
              <span
                id="statNetDifference"
                className="stat-value"
                style={{ color: netDifference >= 0 ? 'var(--success)' : 'var(--danger)' }}
              >
                ₹{formatCurrency(netDifference)}
              </span>
            </div>
          </div>
        </section>

        {/* 1. Available Vendors Summary Table */}
        <section className="table-container" aria-label="Available Vendors">
          <div className="table-header-bar">
            <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Available Vendors (Sheet Summary)</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Columns N &bull; O &bull; P</span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Sheet Row</th>
                  <th>Vendor Name</th>
                  <th>Total Amount (₹)</th>
                  <th>Itemized Bills</th>
                  <th className="text-right" style={{ width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody id="vendorTableBody">
                {isLoading ? (
                  <TableLoadingCell colSpan={5} message="Syncing vendors from Google Sheet..." />
                ) : vendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      No vendors recorded yet. Click &quot;Add Vendor Bill&quot; to record bills.
                    </td>
                  </tr>
                ) : (
                  vendors.map((v) => {
                    const billBadge = v.bill_count > 0 ? (
                      <span
                        className="badge badge-yes"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onViewVendorBills(v.vendor_name)}
                        title="Click to view itemized bills"
                      >
                        {v.bill_count} {v.bill_count === 1 ? 'bill' : 'bills'} &nearr;
                      </span>
                    ) : (
                      <span className="badge badge-pending">Direct / None</span>
                    );

                    return (
                      <tr key={v.row_number}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Row {v.row_number}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                            {v.vendor_name}
                          </div>
                        </td>
                        <td>
                          <span className="amount-display">₹{formatCurrency(v.amount)}</span>
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
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-icon-danger"
                              onClick={() => onDeleteVendor(v.row_number, v.vendor_name)}
                              title="Clear vendor row from sheet"
                              aria-label={`Clear ${v.vendor_name}`}
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
        </section>

        {/* 2. Itemized Grocery Bill Entries Log */}
        <section className="table-container" aria-label="Itemized Bill Entries">
          <div className="table-header-bar">
            <div>
              <h3 className="section-title" style={{ fontSize: '1.15rem' }}>Detailed Bill Log</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                Itemized invoices auto-summed into Sheet Column P
              </p>
            </div>
            <span className="record-count-badge" id="vendorEntriesCountLabel">
              {allEntries.length} {allEntries.length === 1 ? 'bill' : 'bills'}
            </span>
          </div>

          <div className="table-scroll-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Date</th>
                  <th>Vendor</th>
                  <th>Description / Notes</th>
                  <th>Amount (₹)</th>
                  <th className="text-right" style={{ width: '70px' }}>Actions</th>
                </tr>
              </thead>
              <tbody id="vendorEntriesTableBody">
                {isLoading ? (
                  <TableLoadingCell colSpan={5} message="Loading bill entries..." />
                ) : allEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                      No bill entries logged yet for this month. Click &quot;Add Vendor Bill&quot; above.
                    </td>
                  </tr>
                ) : (
                  allEntries.map((e) => (
                    <tr key={e.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{e.date || '—'}</span>
                      </td>
                      <td>
                        <span className="badge badge-cash" style={{ fontSize: '0.85rem' }}>{e.vendor_name}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-main)' }}>{e.notes || 'Grocery bill'}</span>
                      </td>
                      <td>
                        <span className="amount-display">₹{formatCurrency(e.amount)}</span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn-icon btn-icon-danger"
                          onClick={() => onDeleteVendorEntry(e.id)}
                          title="Delete bill and recalculate vendor total"
                          aria-label={`Delete bill of ₹${e.amount} for ${e.vendor_name}`}
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
        </section>
      </div>
    );
  }

  return VendorSection;
})();

window.KitchenComponents.VendorSection = window.KitchenComponents.Vendors.VendorSection;



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
          <div>
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

  return CookSection;
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



// --- Component: static/js/components/Policy/PolicySection.jsx ---
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


// --- Component: static/js/components/Modals.jsx ---
// =============================================================================
// All Modal Dialogs (Orders, Vendors, Cooks, and Sheet Cloning)
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.Modals = (() => {
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
    const [date, setDate] = useState(toIsoDate(null));
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
            <h3>Add New Transaction</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required placeholder="e.g. Ramesh Prabhu" value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" placeholder="e.g. Sunday Feast, Appearance Day" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Coupon">Coupon</option>
                  </select>
                </div>
              </div>

              {isOrder && (
                <div className="form-grid" style={{ background: 'var(--border-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
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

                  {liveIncentive > 0 && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
                      <div className="incentive-preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <strong>Section 3 Cook Incentive:</strong> ₹{formatCurrency(liveIncentive)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          (₹{formatCurrency(liveIncentive)} added to each cook)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Amount (₹) *</label>
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
                  <label>Payment Channel</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select value={received} onChange={(e) => setReceived(e.target.value)}>
                    <option value="Yes">Paid (Received)</option>
                    <option value="No">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Notes / Comments</label>
                  <input type="text" placeholder="Optional reference notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Writing to Google Sheet...' : 'Sync to Google Sheet'}</span>
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
            <h3>Edit Transaction</h3>
            <button type="button" className="btn-icon" onClick={onClose} aria-label="Close dialog">&times;</button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="dialog-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Person / Sponsor Name *</label>
                  <input type="text" required value={person} onChange={(e) => setPerson(e.target.value)} />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Program / Occasion</label>
                  <input type="text" value={program} onChange={(e) => setProgram(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Transaction Type *</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="Order">Order</option>
                    <option value="Sponsor">Sponsor</option>
                    <option value="Coupon">Coupon</option>
                  </select>
                </div>
              </div>

              {isOrder && (
                <div className="form-grid" style={{ background: 'var(--border-subtle)', padding: '0.85rem', borderRadius: 'var(--radius-sm)' }}>
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

                  {liveIncentive > 0 && (
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
                      <div className="incentive-preview-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>
                          <strong>Section 3 Cook Incentive:</strong> ₹{formatCurrency(liveIncentive)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          (₹{formatCurrency(liveIncentive)} added to each cook)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Payment Channel</label>
                  <select value={payment} onChange={(e) => setPayment(e.target.value)}>
                    <option value="Cash">Cash</option>
                    <option value="Gpay">GPay</option>
                  </select>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Payment Status *</label>
                  <select value={received} onChange={(e) => setReceived(e.target.value)}>
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
                {isSubmitting ? <BtnSpinner /> : null}
                <span>{isSubmitting ? 'Updating in Google Sheet...' : 'Update in Google Sheet'}</span>
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

  // 4. Add Vendor Bill Modal
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

  // 5. Register New Vendor Modal
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

  // 6. Edit Vendor Modal
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
            <h3>Edit Vendor (Row {vendor.row_number})</h3>
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

  // 7. Vendor Bills Itemized Modal
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

  // 8. Add Cook Modal
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

  // 9. Edit Cook Modal
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

  // 10. Create New Sheet Tab Modal
  function CreateSheetModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [sheetName, setSheetName] = useState('');
    const suggestions = ['May 26', 'June 26', 'July 26', 'August 26'];

    if (!isOpen) return null;

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!sheetName.trim()) return;
      onSubmit(sheetName.trim());
    };

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

Object.assign(window.KitchenComponents, window.KitchenComponents.Modals);



// --- Component: static/js/App.jsx ---
// =============================================================================
// Kitchen Accountability ERP - Root Application Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};

window.KitchenComponents.App = (() => {
  const { React } = window;
  const { useState, useEffect, useMemo, useCallback } = React;

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

    // -------------------------------------------------------------------------
    // Data States
    // -------------------------------------------------------------------------
    const [allRecords, setAllRecords] = useState([]);
    const [metrics, setMetrics] = useState({});
    const [isRecordsLoading, setIsRecordsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
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

    // Month Selector Change
    const handleTabChange = useCallback(async (newTab) => {
      setCurrentTab(newTab);
      localStorage.setItem('selectedTab', newTab);
      setCurrentPage(1);
      window.showToast(`Switched to month: ${newTab}`, 'info');
      try {
        await api.selectTab(newTab);
      } catch (err) {
        console.error('selectTab error:', err);
      }
    }, []);

    // Force Refresh Action
    const handleRefresh = useCallback(async () => {
      setIsRefreshing(true);
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
        setIsRefreshing(false);
        setSyncStatus((prev) => ({ ...prev, isSyncing: false }));
        fetchStatus();
      }
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
    // In-Memory Filtering & Pagination
    // -------------------------------------------------------------------------
    const filteredRecords = useMemo(() => {
      const q = searchQuery.trim().toLowerCase();
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

        if (typeFilter !== 'All') {
          if ((r.type || '').toLowerCase() !== typeFilter.toLowerCase()) return false;
        }

        if (paymentFilter !== 'All') {
          if (!(r.payment_through || '').toLowerCase().includes(paymentFilter.toLowerCase())) return false;
        }

        if (statusFilter !== 'All') {
          const rcvdRaw = (r.payment_received || '').trim().toLowerCase();
          const isPaid = rcvdRaw === 'yes' || rcvdRaw === 'paid' || rcvdRaw === 'done' || rcvdRaw === 'y';
          if ((statusFilter === 'Paid' || statusFilter === 'Yes') && !isPaid) return false;
          if ((statusFilter === 'Pending' || statusFilter === 'No') && isPaid) return false;
        }

        if (menuFilter !== 'All') {
          if (!(r.menu_type || '').toLowerCase().includes(menuFilter.toLowerCase())) return false;
        }

        return true;
      });
    }, [allRecords, searchQuery, typeFilter, paymentFilter, statusFilter, menuFilter]);

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
        <Navigation activePage={activePage} onSelectPage={setActivePage} />

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
              <section className="table-container" aria-label="Records Table">
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
                <div className={mobileRecordView === 'cards' ? 'hide-mobile' : ''}>
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

  return App;
})();

window.KitchenComponents.App.App = window.KitchenComponents.App;


// --- Component: static/js/index.jsx ---
// =============================================================================
// Kitchen Accountability ERP - Application Entry Point
// =============================================================================

(() => {
  const { React, ReactDOM } = window;
  const App = window.KitchenComponents?.App?.App || window.KitchenComponents?.App;

  const rootElement = document.getElementById('root');
  if (rootElement && App) {
    if (ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(App));
    } else {
      ReactDOM.render(React.createElement(App), rootElement);
    }
  } else if (!rootElement) {
    console.error('Root element "#root" not found in DOM.');
  } else if (!App) {
    console.error('App component not found on window.KitchenComponents.');
  }
})();



