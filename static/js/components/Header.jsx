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

