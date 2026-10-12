// =============================================================================
// Kitchen Accountability ERP - Application Entry Point
// =============================================================================

(() => {
  const { React, ReactDOM } = window;
  const { App } = window.KitchenComponents.App;

  const rootElement = document.getElementById('root');
  if (rootElement) {
    if (ReactDOM.createRoot) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(React.createElement(App));
    } else {
      ReactDOM.render(React.createElement(App), rootElement);
    }
  } else {
    console.error('Root element "#root" not found in DOM.');
  }
})();

