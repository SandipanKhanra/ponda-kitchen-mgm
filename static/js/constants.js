// =============================================================================
// Kitchen Accountability ERP - Constants & Utility Helpers
// =============================================================================

window.KitchenConstants = (() => {
  const MENU_PRICES = {
    "Very Heavy": 250,
    "Heavy":      220,
    "Medium":     160,
    "Light":      100
  };

  const INCENTIVE_MATRIX = {
    "Very Heavy": [219, 438, 656, 875, 1094, 1313, 1531, 1750, 1969, 2188],
    "Heavy":      [193, 385, 578, 770, 963, 1115, 1348, 1540, 1733, 1925],
    "Medium":     [140, 280, 420, 560, 700, 840, 980, 1120, 1260, 1400],
    "Light":      [88, 175, 263, 350, 438, 525, 613, 700, 788, 875],
  };

  const CHART_COLORS = [
    "#4f46e5", "#10b981", "#0284c7", "#f59e0b", "#ec4899", 
    "#8b5cf6", "#14b8a6", "#f97316", "#64748b", "#84cc16"
  ];

  function formatCurrency(val) {
    return Number(val || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    });
  }

  function toIsoDate(sheetDate) {
    if (!sheetDate) {
      const today = new Date();
      return today.toISOString().split("T")[0];
    }
    const str = String(sheetDate).trim();
    if (str.includes("-") && str.split("-")[0].length === 4) {
      return str;
    }
    const parts = str.split(/[\/\-]/);
    if (parts.length === 3) {
      const dd = parts[0].padStart(2, "0");
      const mm = parts[1].padStart(2, "0");
      const yyyy = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      return `${yyyy}-${mm}-${dd}`;
    }
    return new Date().toISOString().split("T")[0];
  }

  function toSheetDate(isoDate) {
    if (!isoDate) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      return `${dd}/${mm}/${today.getFullYear()}`;
    }
    const str = String(isoDate).trim();
    if (str.includes("/") && str.split("/")[2]?.length === 4) {
      return str;
    }
    const parts = str.split("-");
    if (parts.length === 3 && parts[0].length === 4) {
      const [yyyy, mm, dd] = parts;
      return `${dd.padStart(2, "0")}/${mm.padStart(2, "0")}/${yyyy}`;
    }
    return str;
  }

  function calculateIncentiveClient(devotees, menuType) {
    const dev = parseInt(devotees, 10);
    if (isNaN(dev) || dev < 10) return 0;
    const bracket = Math.min(Math.floor(dev / 10), 10);
    const bracketIndex = bracket - 1;
    if (bracketIndex < 0) return 0;
    const tierRow = INCENTIVE_MATRIX[menuType];
    if (!tierRow) return 0;
    return tierRow[bracketIndex] || 0;
  }

  function calculateOrderPricingClient(devotees, menuType) {
    const dev = parseInt(devotees, 10) || 0;
    const pricePerPlate = MENU_PRICES[menuType] || 0;
    return dev * pricePerPlate;
  }

  return {
    MENU_PRICES,
    INCENTIVE_MATRIX,
    CHART_COLORS,
    formatCurrency,
    toIsoDate,
    toSheetDate,
    calculateIncentiveClient,
    calculateOrderPricingClient
  };
})();

