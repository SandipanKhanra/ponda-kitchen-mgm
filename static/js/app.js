// =============================================================================
// Kitchen Accountability ERP - Frontend Client Application
// Connected live to Google Sheets: "Kitchen Accountability 2025-26"
// =============================================================================

// State Variables
let allRecords = [];
let filteredRecords = [];
let deleteTargetId = null;
let currentTab = "April 26";
let availableTabs = [];
let currentMetrics = {};
let activeBifurcation = "type"; // 'type', 'payment', 'program', 'status', 'menu'
let activePage = "transactions"; // 'transactions', 'vendors', 'cooks', 'analytics'

let currentVendors = [];
let availableVendors = [];
let allVendorEntries = [];
let currentVendorForDetail = "";
let currentCooks = [];

// Pagination State
let currentPage = 1;
let pageSize = 10;

// Section 3 Policy Matrix: Prices and Cook Incentives
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

// DOM Elements
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");
const connectionBanner = document.getElementById("connectionBanner");
const bannerText = document.getElementById("bannerText");
const sheetLinkBtn = document.getElementById("sheetLinkBtn");
const monthTabSelect = document.getElementById("monthTabSelect");
const currentMonthTitle = document.getElementById("currentMonthTitle");
const exportExcelBtn = document.getElementById("exportExcelBtn");

// KPI Stats
const statTotalCollections = document.getElementById("statTotalCollections");
const statTotalOrders = document.getElementById("statTotalOrders");
const statTotalSponsors = document.getElementById("statTotalSponsors");
const statPaymentModes = document.getElementById("statPaymentModes");
const statTotalIncentive = document.getElementById("statTotalIncentive");
const shareManoranjan = document.getElementById("shareManoranjan");
const shareChittaranjan = document.getElementById("shareChittaranjan");
const shareRanjan = document.getElementById("shareRanjan");

// Filters & Controls
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const paymentFilter = document.getElementById("paymentFilter");
const statusFilter = document.getElementById("statusFilter");
const menuFilter = document.getElementById("menuFilter");
const refreshBtn = document.getElementById("refreshBtn");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");
const recordCountLabel = document.getElementById("recordCountLabel");

const tableBody = document.getElementById("tableBody");
const mobileCardsList = document.getElementById("mobileCardsList");
const emptyState = document.getElementById("emptyState");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const paginationWrapper = document.getElementById("paginationWrapper");
const paginationInfo = document.getElementById("paginationInfo");
const paginationControls = document.getElementById("paginationControls");

// Donut Chart DOM
const donutSvg = document.getElementById("donutSvg");
const donutCenterAmount = document.getElementById("donutCenterAmount");
const donutCenterLabel = document.getElementById("donutCenterLabel");
const chartLegendList = document.getElementById("chartLegendList");

// Date Converter Helpers (bidirectional YYYY-MM-DD <-> DD/MM/YYYY)
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
window.toIsoDate = toIsoDate;

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
window.toSheetDate = toSheetDate;

function openAddRecordModal() {
  const dateInput = document.getElementById("addDate");
  if (dateInput) dateInput.value = toIsoDate(null);
  toggleOrderFields("add");
  openDialog("addModal");
}
window.openAddRecordModal = openAddRecordModal;

// =============================================================================
// Lifecycle & Event Setup
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initApp();

  // In-memory instant filtering
  if (searchInput) searchInput.addEventListener("input", debounce(applyFiltersAndPaginate, 150));
  if (typeFilter) typeFilter.addEventListener("change", applyFiltersAndPaginate);
  if (paymentFilter) paymentFilter.addEventListener("change", applyFiltersAndPaginate);
  if (statusFilter) statusFilter.addEventListener("change", applyFiltersAndPaginate);
  if (menuFilter) menuFilter.addEventListener("change", applyFiltersAndPaginate);

  if (monthTabSelect) {
    monthTabSelect.addEventListener("change", async (e) => {
      currentTab = e.target.value;
      if (currentMonthTitle) currentMonthTitle.textContent = currentTab;
      if (exportExcelBtn) exportExcelBtn.href = `/api/export?tab=${encodeURIComponent(currentTab)}`;
      await switchMonthTab(currentTab);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      refreshBtn.classList.add("spinning");
      await fetchRecords(true);
      await fetchVendors();
      await fetchCooks();
      refreshBtn.classList.remove("spinning");
      showToast("Kitchen records freshly synchronized with Google Sheet!", "success");
    });
  }

  if (openAddModalBtn) {
    openAddModalBtn.addEventListener("click", openAddRecordModal);
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", executeDelete);
  }
});

function initTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  updateThemeAria(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", active);
      localStorage.setItem("theme", active);
      updateThemeAria(active);
      renderDonutChart();
      showToast(active === "dark" ? "Night mode enabled" : "Day mode enabled", "success");
    });
  }
}

function updateThemeAria(theme) {
  if (themeToggleBtn) {
    const isDark = theme === "dark";
    themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to day mode" : "Switch to night mode");
    themeToggleBtn.setAttribute("title", isDark ? "Switch to day mode" : "Switch to night mode");
  }
}

async function initApp() {
  await fetchStatus();
  await fetchRecords();
  await fetchVendors();
  await fetchCooks();
}

// =============================================================================
// Multi-Page Tab Navigation
// =============================================================================
function switchPage(pageId) {
  activePage = pageId;

  // Highlight active navigation tab button
  document.querySelectorAll(".nav-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-page") === pageId);
  });

  // Toggle active page view
  const pages = {
    transactions: document.getElementById("pageTransactions"),
    vendors: document.getElementById("pageVendors"),
    cooks: document.getElementById("pageCooks"),
    analytics: document.getElementById("pageAnalytics"),
    policy: document.getElementById("pagePolicy"),
  };

  Object.entries(pages).forEach(([k, el]) => {
    if (el) el.classList.toggle("active", k === pageId);
  });

  // Refresh page-specific components
  if (pageId === "vendors") {
    fetchVendors();
  } else if (pageId === "cooks") {
    fetchCooks();
  } else if (pageId === "analytics") {
    renderDonutChart();
  } else if (pageId === "transactions") {
    applyFiltersAndPaginate();
  }
}

// =============================================================================
// API Calls (Batch Protected & Cached)
// =============================================================================
async function fetchStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();

    if (statusBadge) {
      statusBadge.classList.remove("status-loading", "status-google", "status-excel");

      if (data.mode === "google_sheets") {
        statusBadge.classList.add("status-google");
        statusText.textContent = `Google Sheets: ${data.spreadsheet_title || "Connected"}`;

        if (connectionBanner) {
          connectionBanner.style.display = "flex";
          connectionBanner.style.backgroundColor = "var(--success-bg)";
          connectionBanner.style.borderColor = "#a7f3d0";
        }
        if (bannerText) {
          bannerText.innerHTML = `<strong>Live Sync Active:</strong> Changes sync instantly with <em>"${escapeHtml(data.spreadsheet_title)}"</em> (${escapeHtml(data.current_tab)}).`;
        }
        if (sheetLinkBtn && data.google_sheet_url) {
          sheetLinkBtn.href = data.google_sheet_url;
        }
      } else {
        statusBadge.classList.add("status-excel");
        statusText.textContent = "Local Excel Mode";
        if (connectionBanner) {
          connectionBanner.style.display = "flex";
          connectionBanner.style.backgroundColor = "var(--warning-bg)";
          connectionBanner.style.borderColor = "#fde68a";
        }
        if (bannerText) {
          bannerText.innerHTML = "<strong>Local Excel Mode:</strong> Synchronized with local database.xlsx file.";
        }
      }
    }

    if (data.available_tabs && data.available_tabs.length > 0) {
      availableTabs = data.available_tabs;
      const savedTab = localStorage.getItem("selectedTab");
      if (savedTab && availableTabs.includes(savedTab)) {
        currentTab = savedTab;
        if (currentTab !== data.current_tab) {
          fetch("/api/tabs/select", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tab: currentTab }),
          }).catch(console.error);
        }
      } else {
        currentTab = data.current_tab || availableTabs[0];
      }

      if (monthTabSelect) {
        monthTabSelect.innerHTML = "";
        availableTabs.forEach((tab) => {
          const opt = document.createElement("option");
          opt.value = tab;
          opt.textContent = tab;
          if (tab === currentTab) opt.selected = true;
          monthTabSelect.appendChild(opt);
        });
      }
      if (currentMonthTitle) currentMonthTitle.textContent = currentTab;
      if (exportExcelBtn) exportExcelBtn.href = `/api/export?tab=${encodeURIComponent(currentTab)}`;
      updateCookTabLabels();
    }
  } catch (err) {
    console.error("fetchStatus error:", err);
    if (statusBadge) {
      statusBadge.classList.add("status-excel");
      statusText.textContent = "Offline Mode";
    }
  }
}

function updateCookTabLabels() {
  const badge = document.getElementById("cookCurrentTabBadge");
  if (badge) badge.textContent = currentTab;
  const editTab = document.getElementById("editCookTabName");
  if (editTab) editTab.textContent = currentTab;
  const addTab = document.getElementById("addCookTabName");
  if (addTab) addTab.textContent = currentTab;
}

async function switchMonthTab(tabName) {
  try {
    currentTab = tabName;
    localStorage.setItem("selectedTab", tabName);
    if (currentMonthTitle) currentMonthTitle.textContent = currentTab;
    if (monthTabSelect) monthTabSelect.value = currentTab;
    if (exportExcelBtn) exportExcelBtn.href = `/api/export?tab=${encodeURIComponent(currentTab)}`;
    updateCookTabLabels();

    await fetch("/api/tabs/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tab: tabName }),
    });
    currentPage = 1;
    await fetchRecords(false);
    if (activePage === "vendors") await fetchVendors();
    if (activePage === "cooks") await fetchCooks();
    showToast(`Switched to month: ${tabName}`, "success");
  } catch (err) {
    console.error("switchMonthTab error:", err);
  }
}

async function fetchRecords(forceRefresh = false) {
  try {
    const params = new URLSearchParams();
    if (currentTab) params.append("tab", currentTab);
    if (forceRefresh) params.append("refresh", "true");

    const res = await fetch(`/api/records?${params.toString()}`);
    const data = await res.json();

    allRecords = data.records || [];
    currentMetrics = data.metrics || {};

    renderMetrics(currentMetrics);
    renderDonutChart();
    applyFiltersAndPaginate();
  } catch (err) {
    console.error("fetchRecords error:", err);
    showToast("Error retrieving records", "error");
  }
}

// =============================================================================
// In-Memory Filtering & Pagination
// =============================================================================
function applyFiltersAndPaginate() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const typeVal = typeFilter ? typeFilter.value : "All";
  const payVal = paymentFilter ? paymentFilter.value : "All";
  const statusVal = statusFilter ? statusFilter.value : "All";
  const menuVal = menuFilter ? menuFilter.value : "All";

  filteredRecords = allRecords.filter((r) => {
    if (query) {
      const matchText = (
        (r.person_name || "") + " " +
        (r.program || "") + " " +
        (r.date || "") + " " +
        (r.notes || "") + " " +
        (r.menu_type || "") + " " +
        String(r.amount || "")
      ).toLowerCase();
      if (!matchText.includes(query)) return false;
    }

    if (typeVal && typeVal !== "All") {
      if ((r.type || "").toLowerCase() !== typeVal.toLowerCase()) return false;
    }

    if (payVal && payVal !== "All") {
      if (!(r.payment_through || "").toLowerCase().includes(payVal.toLowerCase())) return false;
    }

    if (statusVal && statusVal !== "All") {
      const isYes = (r.payment_received || "").toLowerCase() === "yes";
      if (statusVal === "Yes" && !isYes) return false;
      if (statusVal === "Pending" && isYes) return false;
    }

    if (menuVal && menuVal !== "All") {
      if (!(r.menu_type || "").toLowerCase().includes(menuVal.toLowerCase())) return false;
    }

    return true;
  });

  const total = filteredRecords.length;
  if (recordCountLabel) recordCountLabel.textContent = `${total} item${total === 1 ? "" : "s"}`;

  const effectivePageSize = pageSize === "all" ? total : parseInt(pageSize, 10);
  const maxPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(total / effectivePageSize)) : 1;
  if (currentPage > maxPages) currentPage = maxPages;

  const startIndex = (currentPage - 1) * effectivePageSize;
  const pageRecords = pageSize === "all" ? filteredRecords : filteredRecords.slice(startIndex, startIndex + effectivePageSize);

  renderRecordsTable(pageRecords);
  renderPagination(total, startIndex, pageRecords.length, maxPages);
}

function renderRecordsTable(records) {
  if (!tableBody) return;

  if (records.length === 0) {
    tableBody.innerHTML = "";
    if (mobileCardsList) mobileCardsList.innerHTML = "";
    if (emptyState) emptyState.style.display = "block";
    return;
  }

  if (emptyState) emptyState.style.display = "none";

  // Desktop / Tablet Table
  tableBody.innerHTML = records
    .map((r) => {
      const isOrder = (r.type || "").trim().toLowerCase() === "order";
      const isSponsor = (r.type || "").trim().toLowerCase() === "sponsor";
      const isCoupon = (r.type || "").trim().toLowerCase().includes("coupon");
      let typeBadgeClass = "badge-order";
      if (isSponsor) typeBadgeClass = "badge-sponsor";
      if (isCoupon) typeBadgeClass = "badge-in-progress";
      const typeBadge = `<span class="badge ${typeBadgeClass}">${escapeHtml(r.type || "Order")}</span>`;

      const isCash = (r.payment_through || "").toLowerCase().includes("cash");
      const payBadge = `<span class="badge ${isCash ? "badge-cash" : "badge-gpay"}">${escapeHtml(r.payment_through || "Cash")}</span>`;

      const isReceived = (r.payment_received || "").toLowerCase() === "yes";
      const statusBadgeHtml = `<span class="badge ${isReceived ? "badge-yes" : "badge-pending"}">${isReceived ? "Yes" : "Pending"}</span>`;

      const devCount = isOrder && r.number_of_devotees ? r.number_of_devotees : "—";
      const menuType = isOrder && r.menu_type ? escapeHtml(r.menu_type) : "—";
      const incentiveStr = isOrder && r.cook_incentive && r.cook_incentive > 0 ? `₹${formatCurrency(r.cook_incentive)}` : "—";

      return `
        <tr>
          <td><span style="font-weight:600; color:var(--text-muted);">${escapeHtml(r.date)}</span></td>
          <td>
            <div style="font-weight:700; color:var(--text-main);">${escapeHtml(r.person_name)}</div>
          </td>
          <td>
            <span style="color:var(--text-muted); font-size:0.875rem;">${escapeHtml(r.program || "—")}</span>
          </td>
          <td>${typeBadge}</td>
          <td><span style="font-weight:600;">${devCount}</span></td>
          <td><span class="category-tag">${menuType}</span></td>
          <td><span style="color:var(--primary); font-weight:700;">${incentiveStr}</span></td>
          <td>
            <span class="amount-display">₹${formatCurrency(r.amount)}</span>
          </td>
          <td>${payBadge}</td>
          <td>${statusBadgeHtml}</td>
          <td class="text-right">
            <div class="action-buttons-cell">
              <button 
                class="btn-icon" 
                onclick='openEditModal(${JSON.stringify(r)})' 
                title="Edit entry"
                aria-label="Edit entry ${escapeHtml(r.person_name)}"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button 
                class="btn-icon btn-icon-danger" 
                onclick='openDeleteModal("${r.id}", "${escapeHtml(r.person_name)}", ${r.amount})' 
                title="Delete entry"
                aria-label="Delete entry ${escapeHtml(r.person_name)}"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");

  // Mobile Cards List
  if (mobileCardsList) {
    mobileCardsList.innerHTML = records
      .map((r) => {
        const isOrder = (r.type || "").trim().toLowerCase() === "order";
        const isSponsor = (r.type || "").trim().toLowerCase() === "sponsor";
        const isCoupon = (r.type || "").trim().toLowerCase().includes("coupon");
        let typeBadgeClass = "badge-order";
        if (isSponsor) typeBadgeClass = "badge-sponsor";
        if (isCoupon) typeBadgeClass = "badge-in-progress";
        const typeBadge = `<span class="badge ${typeBadgeClass}">${escapeHtml(r.type || "Order")}</span>`;

        const isCash = (r.payment_through || "").toLowerCase().includes("cash");
        const payBadge = `<span class="badge ${isCash ? "badge-cash" : "badge-gpay"}">${escapeHtml(r.payment_through || "Cash")}</span>`;

        const isReceived = (r.payment_received || "").toLowerCase() === "yes";
        const statusBadgeHtml = `<span class="badge ${isReceived ? "badge-yes" : "badge-pending"}">${isReceived ? "Yes" : "Pending"}</span>`;

        const hasDetails = (isOrder && (r.number_of_devotees || r.menu_type || r.cook_incentive)) || r.notes;

        return `
          <div class="record-card">
            <div class="record-card-header">
              <div>
                <div class="record-card-title">${escapeHtml(r.person_name)}</div>
                <div class="record-card-meta">
                  <span>${escapeHtml(r.date)}</span>
                  <span>&bull;</span>
                  <span>${escapeHtml(r.program || "General")}</span>
                </div>
              </div>
              <div>
                <span class="amount-display" style="font-size:1.15rem; color:var(--primary);">₹${formatCurrency(r.amount)}</span>
              </div>
            </div>
            ${hasDetails ? `
              <div class="record-card-details">
                ${isOrder && r.number_of_devotees ? `<span>Devotees: <strong>${r.number_of_devotees}</strong></span>` : ""}
                ${isOrder && r.menu_type ? `<span>Menu: <strong>${escapeHtml(r.menu_type)}</strong></span>` : ""}
                ${isOrder && r.cook_incentive ? `<span>Incentive: <strong style="color:var(--primary);">₹${formatCurrency(r.cook_incentive)}</strong></span>` : ""}
                ${r.notes ? `<span>Notes: <em>${escapeHtml(r.notes)}</em></span>` : ""}
              </div>
            ` : ""}
            <div class="record-card-body">
              <div style="display:flex; gap:0.35rem; flex-wrap:wrap; align-items:center;">
                ${typeBadge}
                ${payBadge}
                ${statusBadgeHtml}
              </div>
              <div class="record-card-actions">
                <button type="button" class="btn btn-secondary btn-sm" onclick="openEditModalById('${r.id}')" aria-label="Edit record">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>Edit</span>
                </button>
                <button type="button" class="btn btn-danger btn-sm" onclick="openDeleteModalById('${r.id}')" aria-label="Delete record">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

function openEditModalById(id) {
  const rec = allRecords.find((r) => String(r.id) === String(id));
  if (rec) openEditModal(rec);
}
window.openEditModalById = openEditModalById;

function openDeleteModalById(id) {
  const rec = allRecords.find((r) => String(r.id) === String(id));
  if (rec) openDeleteModal(rec.id, rec.person_name, rec.amount);
}
window.openDeleteModalById = openDeleteModalById;

function switchRecordView(view) {
  const cardsList = document.getElementById("mobileCardsList");
  const tableWrapper = document.getElementById("recordsTableWrapper");
  const btnCards = document.getElementById("cardViewBtn");
  const btnTable = document.getElementById("tableViewBtn");

  if (view === "table") {
    if (cardsList) cardsList.classList.add("force-hide");
    if (tableWrapper) tableWrapper.classList.add("force-show");
    if (btnCards) btnCards.classList.remove("active");
    if (btnTable) btnTable.classList.add("active");
  } else {
    if (cardsList) cardsList.classList.remove("force-hide");
    if (tableWrapper) tableWrapper.classList.remove("force-show");
    if (btnCards) btnCards.classList.add("active");
    if (btnTable) btnTable.classList.remove("active");
  }
}
window.switchRecordView = switchRecordView;

function renderPagination(total, startIndex, countOnPage, maxPages) {
  if (!paginationInfo || !paginationControls) return;

  if (total === 0) {
    paginationInfo.textContent = "Showing 0 to 0 of 0 entries";
    paginationControls.innerHTML = "";
    return;
  }

  const end = startIndex + countOnPage;
  paginationInfo.textContent = `Showing ${startIndex + 1} to ${end} of ${total} entries`;

  let html = "";
  html += `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(1)" title="First Page">&laquo;</button>`;
  html += `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})" title="Previous Page">&lsaquo;</button>`;

  const startP = Math.max(1, currentPage - 2);
  const endP = Math.min(maxPages, currentPage + 2);

  for (let p = startP; p <= endP; p++) {
    html += `<button class="page-btn ${p === currentPage ? "active" : ""}" onclick="goToPage(${p})">${p}</button>`;
  }

  html += `<button class="page-btn ${currentPage === maxPages ? "disabled" : ""} onclick="goToPage(${currentPage + 1})" title="Next Page">&rsaquo;</button>`;
  html += `<button class="page-btn ${currentPage === maxPages ? "disabled" : ""} onclick="goToPage(${maxPages})" title="Last Page">&raquo;</button>`;

  paginationControls.innerHTML = html;
}

function goToPage(p) {
  currentPage = p;
  applyFiltersAndPaginate();
}

function changePageSize(val) {
  pageSize = val;
  currentPage = 1;
  applyFiltersAndPaginate();
}

// =============================================================================
// Metrics & Bifurcation Visualizations (Pie / Donut SVG Chart)
// =============================================================================
function renderMetrics(m) {
  if (statTotalCollections) statTotalCollections.textContent = `₹${formatCurrency(m.total_collections || 0)}`;
  if (statTotalOrders) statTotalOrders.textContent = `₹${formatCurrency(m.total_orders || 0)}`;
  if (statTotalSponsors) statTotalSponsors.textContent = `₹${formatCurrency(m.total_sponsors || 0)}`;
  if (statPaymentModes) {
    const cashStr = `Cash: ₹${formatCurrency(m.total_cash || 0)}`;
    const gpayStr = `GPay: ₹${formatCurrency(m.total_gpay || 0)}`;
    statPaymentModes.textContent = `${cashStr} | ${gpayStr}`;
  }

  // Policy Section 3 Cook Incentives (Direct Matrix Profit added to each person)
  const totalInc = m.total_cook_incentive || 0;
  if (statTotalIncentive) statTotalIncentive.textContent = `₹${formatCurrency(totalInc)}`;
  if (shareManoranjan) shareManoranjan.textContent = `₹${formatCurrency(totalInc)}`;
  if (shareChittaranjan) shareChittaranjan.textContent = `₹${formatCurrency(totalInc)}`;
  if (shareRanjan) shareRanjan.textContent = `₹${formatCurrency(totalInc)}`;
}

function setBifurcation(mode) {
  activeBifurcation = mode;
  document.querySelectorAll(".bifurcation-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-bifurcation") === mode);
  });
  renderDonutChart();
}

function renderDonutChart() {
  if (!donutSvg || !chartLegendList) return;

  let dataset = {};
  let title = "Total";

  if (activeBifurcation === "type") {
    dataset = currentMetrics.bifurcation_type || {};
    title = "By Type";
  } else if (activeBifurcation === "payment") {
    dataset = currentMetrics.bifurcation_payment || {};
    title = "Payment";
  } else if (activeBifurcation === "program") {
    dataset = currentMetrics.bifurcation_program || {};
    title = "Programs";
  } else if (activeBifurcation === "status") {
    dataset = currentMetrics.bifurcation_status || {};
    title = "Status";
  } else if (activeBifurcation === "menu") {
    dataset = currentMetrics.bifurcation_menu || {};
    title = "Menus";
  }

  const items = Object.entries(dataset)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = items.reduce((acc, [_, val]) => acc + val, 0);

  if (donutCenterAmount) donutCenterAmount.textContent = `₹${formatCurrency(total)}`;
  if (donutCenterLabel) donutCenterLabel.textContent = title;

  if (total === 0 || items.length === 0) {
    donutSvg.innerHTML = `<circle cx="50" cy="50" r="38" fill="none" stroke="var(--border-color)" stroke-width="12" />`;
    chartLegendList.innerHTML = `<div style="text-align:center; color:var(--text-muted); font-size:0.875rem; padding:1rem;">No data recorded for this category yet.</div>`;
    return;
  }

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;
  let svgPaths = "";
  let legendHtml = "";

  items.forEach(([label, value], i) => {
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const pct = total > 0 ? (value / total) * 100 : 0;
    const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedAngle;

    svgPaths += `
      <circle 
        cx="50" cy="50" r="${radius}" 
        fill="none" 
        stroke="${color}" 
        stroke-width="14" 
        stroke-dasharray="${strokeDasharray}" 
        stroke-dashoffset="${strokeDashoffset}"
        style="transition: stroke 0.3s ease;"
      >
        <title>${escapeHtml(label)}: ₹${formatCurrency(value)} (${pct.toFixed(1)}%)</title>
      </circle>
    `;

    accumulatedAngle += (pct / 100) * circumference;

    legendHtml += `
      <div class="legend-item">
        <div class="legend-label-group">
          <span class="legend-color-dot" style="background-color: ${color};"></span>
          <span style="font-weight:600; color:var(--text-main);">${escapeHtml(label)}</span>
        </div>
        <div class="legend-value-group">
          <span style="font-weight:700; color:var(--text-main);">₹${formatCurrency(value)}</span>
          <span class="legend-pct-badge">${pct.toFixed(1)}%</span>
        </div>
      </div>
    `;
  });

  donutSvg.innerHTML = svgPaths;
  chartLegendList.innerHTML = legendHtml;
}

// =============================================================================
// Auto-Calculation & Incentive Matrix (Section 3 Policy)
// =============================================================================
function calculateIncentiveClient(devotees, menu) {
  if (!devotees || devotees <= 0 || !menu) return 0.0;
  let menuKey = null;
  const mClean = menu.toLowerCase();
  for (const k of ["Very Heavy", "Heavy", "Medium", "Light"]) {
    if (mClean.includes(k.toLowerCase())) {
      menuKey = k;
      break;
    }
  }
  if (!menuKey) return 0.0;
  const rates = INCENTIVE_MATRIX[menuKey];
  const idx = Math.floor((devotees - 1) / 25);
  if (idx < rates.length) return rates[idx];
  const extra = idx - rates.length + 1;
  const step = rates[1] - rates[0];
  return rates[rates.length - 1] + extra * step;
}

function onDevoteesOrMenuChange(prefix) {
  const typeInput = document.getElementById(`${prefix}Type`);
  const isOrder = typeInput ? typeInput.value.trim().toLowerCase() === "order" : true;
  if (!isOrder) return;

  const devInput = document.getElementById(`${prefix}Devotees`);
  const menuInput = document.getElementById(`${prefix}Menu`);
  const amtInput = document.getElementById(`${prefix}Amount`);

  if (!devInput || !menuInput) return;

  const devotees = parseInt(devInput.value, 10) || 0;
  const menu = menuInput.value;

  // Auto calculate suggested amount from devotees & plate price for Orders
  if (devotees > 0 && menu) {
    let pricePerPlate = 0;
    const mClean = menu.toLowerCase();
    for (const [key, price] of Object.entries(MENU_PRICES)) {
      if (mClean.includes(key.toLowerCase())) {
        pricePerPlate = price;
        break;
      }
    }
    if (pricePerPlate > 0 && amtInput) {
      amtInput.value = devotees * pricePerPlate;
    }
  }

  updateLiveIncentive(prefix);
}

function updateLiveIncentive(prefix) {
  const typeInput = document.getElementById(`${prefix}Type`);
  const isOrder = typeInput ? typeInput.value.trim().toLowerCase() === "order" : true;
  const previewBox = document.getElementById(`${prefix}IncentivePreview`);
  if (!previewBox) return;

  if (!isOrder) {
    previewBox.style.display = "none";
    return;
  }

  const devInput = document.getElementById(`${prefix}Devotees`);
  const menuInput = document.getElementById(`${prefix}Menu`);
  const valEl = document.getElementById(`${prefix}IncentiveVal`);
  const splitEl = document.getElementById(`${prefix}IncentiveSplit`);

  if (!devInput || !menuInput) return;

  const devotees = parseInt(devInput.value, 10) || 0;
  const menu = menuInput.value;

  if (devotees > 0 && menu) {
    const inc = calculateIncentiveClient(devotees, menu);
    if (inc > 0) {
      previewBox.style.display = "flex";
      valEl.textContent = `₹${formatCurrency(inc)}`;
      splitEl.textContent = `(₹${formatCurrency(inc)} added directly to each cook)`;
      return;
    }
  }
  previewBox.style.display = "none";
}

function toggleOrderFields(prefix) {
  const typeVal = document.getElementById(`${prefix}Type`).value;
  const devGroup = document.getElementById(`${prefix}DevoteesGroup`);
  const menuGroup = document.getElementById(`${prefix}MenuGroup`);
  const devInput = document.getElementById(`${prefix}Devotees`);
  const menuInput = document.getElementById(`${prefix}Menu`);
  const previewBox = document.getElementById(`${prefix}IncentivePreview`);
  const amtInput = document.getElementById(`${prefix}Amount`);
  const isOrder = typeVal.trim().toLowerCase() === "order";

  if (devGroup) devGroup.style.display = isOrder ? "block" : "none";
  if (menuGroup) menuGroup.style.display = isOrder ? "block" : "none";

  if (!isOrder) {
    if (devInput) devInput.value = "";
    if (menuInput) menuInput.value = "";
    if (previewBox) previewBox.style.display = "none";
    if (amtInput && !amtInput.value) amtInput.placeholder = "Enter amount (₹)";
  } else {
    if (amtInput && !amtInput.value) amtInput.placeholder = "Auto-calculated for Orders, or manual for others";
    updateLiveIncentive(prefix);
  }
}

// =============================================================================
// Orders & Sponsors Handlers: Add, Edit, Delete
// =============================================================================
async function handleAddSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("saveAddBtn");
  btn.disabled = true;
  btn.textContent = "Writing to Google Sheet...";

  const typeVal = document.getElementById("addType").value;
  const isOrder = typeVal.trim().toLowerCase() === "order";

  const payload = {
    date: toSheetDate(document.getElementById("addDate").value),
    person_name: document.getElementById("addPerson").value.trim(),
    program: document.getElementById("addProgram").value.trim(),
    type: typeVal,
    payment_through: document.getElementById("addPayment").value,
    amount: parseFloat(document.getElementById("addAmount").value || 0),
    payment_received: document.getElementById("addReceived").value,
    notes: document.getElementById("addNotes").value.trim(),
    number_of_devotees: isOrder ? (parseInt(document.getElementById("addDevotees").value, 10) || 0) : 0,
    menu_type: isOrder ? document.getElementById("addMenu").value : "",
  };

  try {
    const res = await fetch(`/api/records?tab=${encodeURIComponent(currentTab)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add entry");

    showToast("Added transaction to Google Sheet!", "success");
    closeDialog("addModal");
    document.getElementById("addRecordForm").reset();
    await fetchRecords(true);
    await fetchCooks(); // update cook shares
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Sync to Google Sheet";
  }
}

function openEditModal(record) {
  const isOrder = (record.type || "").trim().toLowerCase() === "order";
  document.getElementById("editRecordId").value = record.id;
  document.getElementById("editDate").value = toIsoDate(record.date);
  document.getElementById("editPerson").value = record.person_name;
  document.getElementById("editProgram").value = record.program || "";
  document.getElementById("editType").value = record.type || "Order";
  document.getElementById("editPayment").value = record.payment_through || "Cash";
  document.getElementById("editAmount").value = record.amount;
  document.getElementById("editReceived").value = record.payment_received || "Yes";
  document.getElementById("editNotes").value = record.notes || "";
  document.getElementById("editDevotees").value = isOrder && record.number_of_devotees ? record.number_of_devotees : "";
  document.getElementById("editMenu").value = isOrder && record.menu_type ? record.menu_type : "";

  toggleOrderFields("edit");
  openDialog("editModal");
}

async function handleEditSubmit(e) {
  e.preventDefault();
  const recordId = document.getElementById("editRecordId").value;
  const btn = document.getElementById("saveEditBtn");
  btn.disabled = true;
  btn.textContent = "Updating Google Sheet...";

  const typeVal = document.getElementById("editType").value;
  const isOrder = typeVal.trim().toLowerCase() === "order";

  const updates = {
    date: toSheetDate(document.getElementById("editDate").value),
    person_name: document.getElementById("editPerson").value.trim(),
    program: document.getElementById("editProgram").value.trim(),
    type: typeVal,
    payment_through: document.getElementById("editPayment").value,
    amount: parseFloat(document.getElementById("editAmount").value || 0),
    payment_received: document.getElementById("editReceived").value,
    notes: document.getElementById("editNotes").value.trim(),
    number_of_devotees: isOrder ? (parseInt(document.getElementById("editDevotees").value, 10) || 0) : 0,
    menu_type: isOrder ? document.getElementById("editMenu").value : "",
  };

  try {
    const res = await fetch(`/api/records/${recordId}?tab=${encodeURIComponent(currentTab)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update entry");

    showToast("Updated transaction in Google Sheet!", "success");
    closeDialog("editModal");
    await fetchRecords(true);
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Update in Google Sheet";
  }
}

function openDeleteModal(recordId, personName, amount) {
  deleteTargetId = recordId;
  const summaryEl = document.getElementById("deleteRecordSummary");
  if (summaryEl) {
    summaryEl.innerHTML = `<strong>${escapeHtml(personName)}</strong> &bull; ₹${formatCurrency(amount)}`;
  }
  openDialog("deleteModal");
}

async function executeDelete() {
  if (!deleteTargetId) return;
  const btn = confirmDeleteBtn;
  btn.disabled = true;
  btn.textContent = "Removing from Sheet...";

  try {
    const res = await fetch(`/api/records/${deleteTargetId}?tab=${encodeURIComponent(currentTab)}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete entry");

    showToast("Removed transaction from Google Sheet!", "success");
    closeDialog("deleteModal");
    deleteTargetId = null;
    await fetchRecords(true);
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Delete from Sheet";
  }
}

// =============================================================================
// Vendor Management (Available Vendors, Multi-Bill Entries & Direct Sheet Sync)
// =============================================================================
async function fetchVendors() {
  const tbody = document.getElementById("vendorTableBody");
  const entriesTbody = document.getElementById("vendorEntriesTableBody");
  const statTotal = document.getElementById("statVendorTotal");
  const statCount = document.getElementById("statVendorCount");
  const statNetDiff = document.getElementById("statNetDifference");
  const entriesCountLabel = document.getElementById("vendorEntriesCountLabel");
  const dropdown = document.getElementById("vendorSelectDropdown");

  try {
    const res = await fetch(`/api/vendors?tab=${encodeURIComponent(currentTab)}`);
    const data = await res.json();
    currentVendors = data.vendors || [];
    availableVendors = data.available_vendors || [];
    allVendorEntries = data.all_entries || [];

    if (statTotal) statTotal.textContent = `₹${formatCurrency(data.total_vendor_expenses || 0)}`;
    if (statCount) statCount.textContent = availableVendors.length;
    if (statNetDiff) {
      const net = data.net_difference || 0;
      statNetDiff.textContent = `₹${formatCurrency(net)}`;
      statNetDiff.style.color = net >= 0 ? "var(--success)" : "var(--danger)";
    }
    if (entriesCountLabel) {
      entriesCountLabel.textContent = `${allVendorEntries.length} ${allVendorEntries.length === 1 ? 'bill' : 'bills'}`;
    }

    // Populate Vendor Dropdown in Add Entry Modal
    if (dropdown) {
      const prevSelected = dropdown.value;
      dropdown.innerHTML = "";
      availableVendors.forEach((v) => {
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        if (v === prevSelected) opt.selected = true;
        dropdown.appendChild(opt);
      });
      const newOpt = document.createElement("option");
      newOpt.value = "__new__";
      newOpt.textContent = "Register New Vendor...";
      dropdown.appendChild(newOpt);
    }

    // 1. Populate Available Vendors Summary Table
    if (tbody) {
      if (currentVendors.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">No vendors recorded yet. Click "Add Vendor Bill" to record bills.</td></tr>`;
      } else {
        tbody.innerHTML = currentVendors.map((v) => {
          const billBadge = v.bill_count > 0 
            ? `<span class="badge badge-yes" style="cursor:pointer;" onclick="viewVendorBills('${escapeHtml(v.vendor_name)}')">${v.bill_count} ${v.bill_count === 1 ? 'bill' : 'bills'} ↗</span>`
            : `<span class="badge badge-pending">Direct / None</span>`;

          return `
            <tr>
              <td><span style="font-weight:700; color:var(--text-muted);">Row ${v.row_number}</span></td>
              <td>
                <div style="font-weight:700; color:var(--text-main); font-size:1rem;">${escapeHtml(v.vendor_name)}</div>
              </td>
              <td><span class="amount-display">₹${formatCurrency(v.amount)}</span></td>
              <td>${billBadge}</td>
              <td class="text-right">
                <div class="action-buttons-cell">
                  <button class="btn btn-secondary btn-sm" onclick="openAddBillForVendor('${escapeHtml(v.vendor_name)}')" title="Add bill for ${escapeHtml(v.vendor_name)}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    <span>Add Bill</span>
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="viewVendorBills('${escapeHtml(v.vendor_name)}')" title="View itemized bills">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Bills</span>
                  </button>
                  <button class="btn-icon" onclick='openEditVendorModal(${JSON.stringify(v)})' title="Edit vendor name / amount directly">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-icon btn-icon-danger" onclick='deleteVendor(${v.row_number}, "${escapeHtml(v.vendor_name)}")' title="Clear vendor row from sheet">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("");
      }
    }

    // 2. Populate Bill Entries Log Table
    if (entriesTbody) {
      if (allVendorEntries.length === 0) {
        entriesTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:2rem;">No bill entries logged yet for this month. Click "Add Vendor Bill" above.</td></tr>`;
      } else {
        entriesTbody.innerHTML = allVendorEntries.map((e) => `
          <tr>
            <td><span style="font-weight:600; color:var(--text-muted);">${escapeHtml(e.date || "—")}</span></td>
            <td><span class="badge badge-cash" style="font-size:0.85rem;">${escapeHtml(e.vendor_name)}</span></td>
            <td><span style="color:var(--text-main);">${escapeHtml(e.notes || "Grocery bill")}</span></td>
            <td><span class="amount-display">₹${formatCurrency(e.amount)}</span></td>
            <td class="text-right">
              <button class="btn-icon btn-icon-danger" onclick="deleteVendorEntry('${e.id}')" title="Delete bill and update vendor total">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </td>
          </tr>
        `).join("");
      }
    }

  } catch (err) {
    console.error("fetchVendors error:", err);
    showToast("Error retrieving vendor records", "error");
  }
}

// Open modal to add a bill entry
function openAddVendorEntryModal(preselectedVendor = null) {
  const dateInput = document.getElementById("vendorEntryDate");
  const amtInput = document.getElementById("vendorEntryAmount");
  const notesInput = document.getElementById("vendorEntryNotes");
  const dropdown = document.getElementById("vendorSelectDropdown");
  const inlineGroup = document.getElementById("newVendorInlineGroup");
  const inlineInput = document.getElementById("newVendorInlineName");

  if (dateInput) dateInput.value = toIsoDate(null);
  if (amtInput) amtInput.value = "";
  if (notesInput) notesInput.value = "";
  if (inlineInput) inlineInput.value = "";
  if (inlineGroup) inlineGroup.style.display = "none";

  if (dropdown && preselectedVendor) {
    dropdown.value = preselectedVendor;
  }
  openDialog("addVendorEntryModal");
}

function openAddBillForVendor(vendorName) {
  openAddVendorEntryModal(vendorName);
}

function onVendorDropdownChange() {
  const dropdown = document.getElementById("vendorSelectDropdown");
  const inlineGroup = document.getElementById("newVendorInlineGroup");
  const inlineInput = document.getElementById("newVendorInlineName");
  if (!dropdown || !inlineGroup) return;

  if (dropdown.value === "__new__") {
    inlineGroup.style.display = "block";
    if (inlineInput) inlineInput.focus();
  } else {
    inlineGroup.style.display = "none";
  }
}

async function handleAddVendorEntrySubmit(e) {
  e.preventDefault();
  const dropdown = document.getElementById("vendorSelectDropdown");
  const inlineInput = document.getElementById("newVendorInlineName");
  const amtInput = document.getElementById("vendorEntryAmount");
  const dateInput = document.getElementById("vendorEntryDate");
  const notesInput = document.getElementById("vendorEntryNotes");
  const btn = document.getElementById("saveVendorEntryBtn");

  let vendorName = dropdown.value;
  if (vendorName === "__new__") {
    vendorName = inlineInput.value.trim();
  }
  const amount = parseFloat(amtInput.value || 0);
  const date = toSheetDate(dateInput.value);
  const notes = notesInput.value.trim();

  if (!vendorName) {
    showToast("Please enter or select a vendor name", "error");
    return;
  }
  if (!amount || amount <= 0) {
    showToast("Please enter a valid bill amount", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Writing & Syncing...";

  try {
    const res = await fetch("/api/vendors/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_name: vendorName,
        amount: amount,
        date: date,
        notes: notes,
        tab: currentTab
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to add vendor bill");

    showToast(`Added ₹${formatCurrency(amount)} bill for ${vendorName} and updated sheet!`, "success");
    closeDialog("addVendorEntryModal");
    await fetchVendors();
    await fetchRecords(true); // update Net Debit/Credit
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Entry & Sync to Sheet";
  }
}

async function deleteVendorEntry(entryId) {
  if (!confirm("Are you sure you want to delete this vendor bill? The vendor total will be recalculated and updated in Google Sheet.")) return;

  try {
    const res = await fetch(`/api/vendors/entries/${entryId}?tab=${encodeURIComponent(currentTab)}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete bill entry");

    showToast("Bill entry removed and vendor total updated in Google Sheet!", "success");
    await fetchVendors();
    await fetchRecords(true);

    // Refresh vendor detail modal if open
    if (currentVendorForDetail) {
      viewVendorBills(currentVendorForDetail);
    }
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// Register a New Vendor Name
function openRegisterVendorModal() {
  const nameInput = document.getElementById("registerVendorName");
  const amtInput = document.getElementById("registerVendorInitialAmount");
  if (nameInput) nameInput.value = "";
  if (amtInput) amtInput.value = "";
  openDialog("registerVendorModal");
}

async function handleRegisterVendorSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("registerVendorName");
  const amtInput = document.getElementById("registerVendorInitialAmount");
  const btn = document.getElementById("saveRegisterVendorBtn");

  const vendorName = nameInput.value.trim();
  const initialAmount = parseFloat(amtInput.value || 0);

  if (!vendorName) return;

  btn.disabled = true;
  btn.textContent = "Registering...";

  try {
    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendor_name: vendorName,
        initial_amount: initialAmount,
        tab: currentTab
      })
    });

    if (!res.ok) throw new Error("Failed to register vendor");

    showToast(`Registered new vendor "${vendorName}" in sheet!`, "success");
    closeDialog("registerVendorModal");
    await fetchVendors();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Add to Available Vendors";
  }
}

// View bills breakdown for a single vendor
function viewVendorBills(vendorName) {
  currentVendorForDetail = vendorName;
  const title = document.getElementById("vendorBillsDetailTitle");
  const totalEl = document.getElementById("vendorBillsDetailTotal");
  const tbody = document.getElementById("vendorBillsDetailTableBody");

  if (title) title.textContent = `Bills: ${vendorName}`;

  const vBills = allVendorEntries.filter((e) => e.vendor_name.trim().toLowerCase() === vendorName.trim().toLowerCase());
  const totalAmt = vBills.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  if (totalEl) totalEl.textContent = `Total Calculated: ₹${formatCurrency(totalAmt)} (${vBills.length} bills)`;

  if (tbody) {
    if (vBills.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No detailed bills logged yet for ${escapeHtml(vendorName)}. Direct amount from sheet: ₹${formatCurrency(totalAmt)}</td></tr>`;
    } else {
      tbody.innerHTML = vBills.map((e) => `
        <tr>
          <td><span style="font-weight:600; color:var(--text-muted);">${escapeHtml(e.date || "—")}</span></td>
          <td>${escapeHtml(e.notes || "Grocery bill")}</td>
          <td><span class="amount-display">₹${formatCurrency(e.amount)}</span></td>
          <td class="text-right">
            <button class="btn-icon btn-icon-danger" onclick="deleteVendorEntry('${e.id}')" title="Delete bill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </td>
        </tr>
      `).join("");
    }
  }

  openDialog("vendorBillsDetailModal");
}

function openAddBillForCurrentVendor() {
  closeDialog("vendorBillsDetailModal");
  openAddVendorEntryModal(currentVendorForDetail);
}

function openEditVendorModal(v) {
  document.getElementById("editVendorRow").value = v.row_number;
  document.getElementById("editVendorName").value = v.vendor_name;
  document.getElementById("editVendorAmount").value = v.amount;
  openDialog("editVendorModal");
}

async function handleEditVendorSubmit(e) {
  e.preventDefault();
  const rowNumber = document.getElementById("editVendorRow").value;
  const nameInput = document.getElementById("editVendorName");
  const amtInput = document.getElementById("editVendorAmount");
  const btn = document.getElementById("updateVendorBtn");

  const vendorName = nameInput.value.trim();
  const amount = parseFloat(amtInput.value || 0);

  btn.disabled = true;
  btn.textContent = "Updating Google Sheet...";

  try {
    const res = await fetch(`/api/vendors/${rowNumber}?tab=${encodeURIComponent(currentTab)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor_name: vendorName, amount: amount }),
    });

    if (!res.ok) throw new Error("Failed to update vendor");

    showToast(`Updated vendor in Row ${rowNumber}!`, "success");
    closeDialog("editVendorModal");
    await fetchVendors();
    await fetchRecords(true);
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Update in Google Sheet";
  }
}

async function deleteVendor(rowNumber, name) {
  if (!confirm(`Are you sure you want to clear vendor "${name}" at Row ${rowNumber}?`)) return;

  try {
    const res = await fetch(`/api/vendors/${rowNumber}?tab=${encodeURIComponent(currentTab)}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to clear vendor");

    showToast(`Cleared vendor entry from Row ${rowNumber}!`, "success");
    await fetchVendors();
    await fetchRecords(true);
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

// =============================================================================
// Cook Management & Payroll (Policy Section 3 Matrix - Direct Profit Sharing)
// =============================================================================
async function fetchCooks() {
  updateCookTabLabels();
  const grid = document.getElementById("cookCardsGrid");
  const statCount = document.getElementById("statCookCount");
  const statPool = document.getElementById("statCookIncentivePool");
  const statPayroll = document.getElementById("statTotalPayroll");

  try {
    const res = await fetch(`/api/cooks?tab=${encodeURIComponent(currentTab)}`);
    const data = await res.json();
    currentCooks = data.cooks || [];

    if (statCount) statCount.textContent = data.cook_count || currentCooks.length;
    if (statPool) statPool.textContent = `₹${formatCurrency(data.total_cook_incentive || 0)} per cook`;
    if (statPayroll) statPayroll.textContent = `₹${formatCurrency(data.total_payroll || 0)}`;

    if (!grid) return;

    if (currentCooks.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; color:var(--text-muted); padding:3rem;">No cooks configured yet. Click "Add New Cook" above.</div>`;
      return;
    }

    grid.innerHTML = currentCooks.map((c) => {
      return `
        <div class="cook-card">
          <div class="cook-card-header">
            <div>
              <div class="cook-name">${escapeHtml(c.name)}</div>
              <div class="cook-role-badge">${escapeHtml(c.role || "Kitchen Cook")}</div>
            </div>
            <div class="cook-share-pill" style="background:var(--success-bg); color:var(--success); border-color:#a7f3d0;">
              Order Incentive
            </div>
          </div>

          <div class="cook-salary-breakdown">
            <div class="salary-line">
              <span class="salary-line-label">Base Monthly Salary:</span>
              <span class="salary-line-value">₹${formatCurrency(c.base_salary)}</span>
            </div>
            <div class="salary-line highlight-incentive">
              <span class="salary-line-label">Order Incentive (Devotees &amp; Menu):</span>
              <span class="salary-line-value" style="color:var(--primary); font-weight:800;">₹${formatCurrency(c.matrix_share)}</span>
            </div>
            <div class="salary-line">
              <span class="salary-line-label">Festival Allowance:</span>
              <span class="salary-line-value">₹${formatCurrency(c.festival_allowance)}</span>
            </div>
            ${c.yearly_bonus > 0 ? `
            <div class="salary-line">
              <span class="salary-line-label">Janmāṣṭamī / Annual Bonus:</span>
              <span class="salary-line-value">₹${formatCurrency(c.yearly_bonus)}</span>
            </div>` : ""}
            <div class="salary-line total-payout">
              <span class="salary-line-label">Total Monthly Payout:</span>
              <span class="total-payout-val">₹${formatCurrency(c.total_payout)}</span>
            </div>
          </div>

          <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" onclick='openEditCookModal(${JSON.stringify(c)})'>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>Edit Payroll &amp; Bonus</span>
            </button>
            <button class="btn btn-danger btn-sm" onclick='deleteCook("${c.id}", "${escapeHtml(c.name)}")' title="Remove cook profile">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("fetchCooks error:", err);
    showToast("Error retrieving cook records", "error");
  }
}

async function deleteCook(cookId, name) {
  if (!confirm(`Are you sure you want to remove cook "${name}"? This will update the Google Sheet and recalculate payroll totals.`)) return;

  try {
    const res = await fetch(`/api/cooks/${cookId}?tab=${encodeURIComponent(currentTab)}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to remove cook");

    showToast(`Removed cook "${name}" and updated Google Sheet!`, "success");
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  }
}

async function handleAddCookSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("addCookName").value.trim();
  const baseSalary = parseFloat(document.getElementById("addCookSalary").value || 0);
  const festival = parseFloat(document.getElementById("addCookFestival").value || 1000);
  const bonus = parseFloat(document.getElementById("addCookBonus").value || 0);
  const role = document.getElementById("addCookRole").value.trim();
  const btn = document.getElementById("saveCookBtn");

  if (!name) return;

  btn.disabled = true;
  btn.textContent = "Adding Cook & Syncing Sheet...";

  try {
    const res = await fetch(`/api/cooks?tab=${encodeURIComponent(currentTab)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        base_salary: baseSalary,
        role: role,
        festival_allowance: festival,
        yearly_bonus: bonus,
        tab: currentTab
      }),
    });

    if (!res.ok) throw new Error("Failed to add cook");

    showToast(`Cook profile added for "${name}" and synchronized to Sheet!`, "success");
    closeDialog("addCookModal");
    document.getElementById("addCookName").value = "";
    document.getElementById("addCookRole").value = "";
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Add Cook Profile";
  }
}

function openEditCookModal(c) {
  updateCookTabLabels();
  document.getElementById("editCookId").value = c.id;
  document.getElementById("editCookNameDisplay").value = c.name;
  document.getElementById("editCookSalary").value = c.base_salary;
  document.getElementById("editCookFestival").value = c.festival_allowance || 0;
  document.getElementById("editCookBonus").value = c.yearly_bonus || 0;
  document.getElementById("editCookRole").value = c.role || "";
  openDialog("editCookModal");
}

async function handleEditCookSubmit(e) {
  e.preventDefault();
  const cookId = document.getElementById("editCookId").value;
  const name = document.getElementById("editCookNameDisplay").value.trim();
  const baseSalary = parseFloat(document.getElementById("editCookSalary").value || 0);
  const festival = parseFloat(document.getElementById("editCookFestival").value || 0);
  const bonus = parseFloat(document.getElementById("editCookBonus").value || 0);
  const role = document.getElementById("editCookRole").value.trim();
  const btn = document.getElementById("updateCookBtn");

  btn.disabled = true;
  btn.textContent = "Updating Payroll & Sheet...";

  try {
    const res = await fetch(`/api/cooks/${cookId}?tab=${encodeURIComponent(currentTab)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        base_salary: baseSalary,
        festival_allowance: festival,
        yearly_bonus: bonus,
        role: role,
        tab: currentTab
      }),
    });

    if (!res.ok) throw new Error("Failed to update cook payroll");

    showToast("Updated cook payroll and synchronized to Google Sheet!", "success");
    closeDialog("editCookModal");
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Save Payroll Details";
  }
}

// =============================================================================
// Master Template Duplication (Native Worksheet Cloning)
// =============================================================================
function setNewSheetName(name) {
  const inp = document.getElementById("newSheetName");
  if (inp) inp.value = name;
}

async function handleCreateSheetSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById("newSheetName");
  const sheetName = nameInput.value.trim();
  if (!sheetName) return;

  const btn = document.getElementById("saveNewSheetBtn");
  btn.disabled = true;
  btn.textContent = "Cloning Master Template...";

  try {
    const res = await fetch("/api/sheets/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet_name: sheetName, clone_from: "Master_Template" }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to create sheet tab");

    showToast(`Created new month sheet: "${sheetName}"!`, "success");
    closeDialog("createSheetModal");
    nameInput.value = "";

    await fetchStatus();
    currentTab = sheetName;
    if (monthTabSelect) monthTabSelect.value = sheetName;
    if (currentMonthTitle) currentMonthTitle.textContent = sheetName;
    await fetchRecords(true);
    await fetchVendors();
    await fetchCooks();
  } catch (err) {
    showToast(`Error: ${err.message}`, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Clone Template to Sheet";
  }
}

// =============================================================================
// Dialogs & Utility Helpers
// =============================================================================
function openDialog(id) {
  const dlg = document.getElementById(id);
  if (dlg) dlg.showModal();
}

function closeDialog(id) {
  const dlg = document.getElementById(id);
  if (dlg) dlg.close();
}

function formatCurrency(val) {
  return Number(val || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Expose globally for inline DOM event bindings
window.switchPage = switchPage;
window.fetchVendors = fetchVendors;
window.openAddVendorEntryModal = openAddVendorEntryModal;
window.openAddBillForVendor = openAddBillForVendor;
window.onVendorDropdownChange = onVendorDropdownChange;
window.handleAddVendorEntrySubmit = handleAddVendorEntrySubmit;
window.deleteVendorEntry = deleteVendorEntry;
window.openRegisterVendorModal = openRegisterVendorModal;
window.handleRegisterVendorSubmit = handleRegisterVendorSubmit;
window.viewVendorBills = viewVendorBills;
window.openAddBillForCurrentVendor = openAddBillForCurrentVendor;
window.openEditVendorModal = openEditVendorModal;
window.handleEditVendorSubmit = handleEditVendorSubmit;
window.deleteVendor = deleteVendor;

window.fetchCooks = fetchCooks;
window.handleAddCookSubmit = handleAddCookSubmit;
window.openEditCookModal = openEditCookModal;
window.handleEditCookSubmit = handleEditCookSubmit;

window.onDevoteesOrMenuChange = onDevoteesOrMenuChange;
window.toggleOrderFields = toggleOrderFields;
window.openDialog = openDialog;
window.closeDialog = closeDialog;
window.handleAddSubmit = handleAddSubmit;
window.handleEditSubmit = handleEditSubmit;
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
window.setBifurcation = setBifurcation;
window.setNewSheetName = setNewSheetName;
window.handleCreateSheetSubmit = handleCreateSheetSubmit;
window.goToPage = goToPage;
window.changePageSize = changePageSize;
