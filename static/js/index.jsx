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
