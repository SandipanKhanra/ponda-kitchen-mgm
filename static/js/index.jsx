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

