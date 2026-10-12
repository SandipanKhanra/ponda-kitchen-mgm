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

