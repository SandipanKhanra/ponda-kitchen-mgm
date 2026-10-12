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

  return { SyncBanner };
})();

