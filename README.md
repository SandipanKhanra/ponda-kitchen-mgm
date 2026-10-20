# Kitchen Accountability ERP 🍲

A complete Kitchen Management and ERP system built with **FastAPI** and **React 19**, synchronized in real-time with **Google Sheets ("Kitchen Accountability 2025-26")** and local Excel fallback.

---

## ⚡ React 19 Concurrent Engine & Performance Optimizations

The application is powered by **React 19** utilizing modern concurrent rendering and performance capabilities:

- **Non-Blocking Page Transitions (`useTransition`)**:
  Tab navigation across all 5 modules (Orders, Vendors, Cooks, Analytics, Policy) runs concurrently. The UI stays 100% interactive at 60fps with subtle transition opacity feedback without dropping frames or locking the main thread.
- **Async Action Transitions**:
  Data synchronization triggers (`handleRefresh`) utilize React 19's native asynchronous transitions to manage loading lifecycles and background sheet re-validation smoothly.
- **Instant Search with Deferred Computation (`useDeferredValue`)**:
  Searching across hundreds of devotee records and applying multi-column filters (Status, Cook, Mode, Category) separates high-priority typing input from background list filtering. The search box receives immediate keyboard feedback while the table reconciliation runs deferred.
- **Fine-Grained Component Memoization (`React.memo`)**:
  All functional components (`StatsCards`, `OrdersTable`, `OrdersMobileCards`, `OrdersToolbar`, `Pagination`, `Navigation`, `Header`, `SyncBanner`, `AnalyticsSection`, `PolicySection`, `CookSection`, `VendorSection`) are memoized to eliminate redundant re-renders when orthogonal states update.
- **Optimized SVG Geometry**:
  SVG Donut chart arc calculations and mathematical offsets in `AnalyticsSection` are memoized (`useMemo`) to eliminate layout recalculations on unrelated page re-renders.
- **Hoisted Static Configurations**:
  Static lookup matrices, policy tiers, and navigation definitions are hoisted outside component render scopes to prevent repeated allocations.

---

## 🌟 Key Application Modules

1. **Orders & Devotee Booking**:
   - Devotee plate tracking, Cash / GPay / Bank bifurcations, and paid/pending payment reconciliation.
   - Policy Section 3 matrix incentive auto-calculator based on plate counts.
   - Search, multi-column filters (Status, Cook, Mode, Category), sorting, pagination, and data export.
   - Dual-view interface: responsive table on desktop and swipeable card view on mobile.

2. **Vendor Accounts & Multi-Bill Logging**:
   - Vendor directory management and itemized grocery/supply bills.
   - Auto-calculated expenditures, total payments, and debit/credit balance reconciliation.

3. **Cook Management & Payroll**:
   - Cook staff roster with monthly salary tracking and festival allowances.
   - Automated Policy Section 3 matrix incentive calculation per cook based on sponsored plates.
   - Base salary, total bonus, and final net payout calculations across active monthly tabs.

4. **Donation & Revenue Analytics**:
   - Interactive SVG Donut chart displaying revenue bifurcations across payment modes and categories.
   - Real-time KPI summary cards (Total Revenue, Cash, GPay, Bank, Pending Collections).

5. **Official Kitchen Policy & PDF Guidelines**:
   - Official kitchen guidelines and rules.
   - Policy Section 3 plate incentive rate matrix table.
   - Embedded interactive PDF document viewer.

6. **Master Template Cloning**:
   - One-click new month worksheet creation preserving all formulas, cell formatting, and tab structures.

7. **Dual-Theme Design System**:
   - **Aurora Light**: Modern pastel gradients (`#eef2ff`, `#e0e7ff`, `#f8fafc`) with subtle frosted glass surfaces.
   - **Cosmic Dark**: Deep navy/slate gradients (`#0b0f19`, `#111827`, `#0f172a`) with glowing accent borders.

---

## ⚛️ Modular Architecture

### 1. Frontend Component Structure (`static/js/`)
The application is structured into decoupled, single-responsibility React 19 components:

```
static/
├── index.html                 # Mounts React 19 application at #root
└── js/
    ├── constants.js           # Menu rates, Section 3 incentive matrix, currency formatters
    ├── api.js                 # Unified API client for FastAPI endpoints
    ├── components/
    │   ├── Common.jsx         # Spinners, badges (Paid/Pending), loading states
    │   ├── Toast.jsx          # Interactive toast alert notification system
    │   ├── Header.jsx         # Topbar, month selector, new sheet trigger, theme toggle
    │   ├── Navigation.jsx     # Tab bar with smooth transition indicator
    │   ├── SyncBanner.jsx     # Live Google Sheet status and direct link
    │   ├── Orders/
    │   │   ├── StatsCards.jsx         # KPI summary cards
    │   │   ├── OrdersToolbar.jsx      # Search, 4-filter dropdowns, refresh & export
    │   │   ├── OrdersTable.jsx        # Desktop / tablet table with Paid/Pending color coding
    │   │   ├── OrdersMobileCards.jsx  # Mobile cards view with Card/Table toggle
    │   │   └── Pagination.jsx         # Pagination controls
    │   ├── Vendors/
    │   │   └── VendorSection.jsx      # Available vendors & itemized grocery bills log
    │   ├── Cooks/
    │   │   └── CookSection.jsx        # Cook payroll cards & policy incentive calculator
    │   ├── Analytics/
    │   │   └── AnalyticsSection.jsx   # Interactive SVG Donut chart & category bifurcations
    │   ├── Policy/
    │   │   └── PolicySection.jsx      # Official kitchen rules, matrix table & PDF viewer
    │   └── Modals.jsx                 # Accessible modals with in-button spinners
    ├── App.jsx                # Root orchestrator managing state, lifecycle, and tabs
    ├── index.jsx              # React 18 DOM mount point
    └── app-bundle.jsx         # Compiled production bundle
```

### 2. Component-Specific CSS Architecture (`static/css/`)
Styles are modularized into domain-specific stylesheets and compiled into a single production bundle:

```
static/css/
├── variables.css              # Color tokens, gradients, shadows, theme variables
├── base.css                   # Global resets, typography, root layout
├── layout.css                 # Fixed topbar, main container, sticky action bars
├── animations.css             # Keyframe animations (pulse, spin, fadeIn, shimmer)
├── responsive.css             # Breakpoint adaptations (<=1024px, <=768px, <=480px)
├── styles.css                 # Master registry with native @import directives
├── styles.bundle.css          # Production compiled CSS bundle
└── components/
    ├── analytics.css          # Donut chart and analytics cards
    ├── badges.css             # Status badges and tag styling
    ├── banner.css             # Google Sheets sync banner
    ├── buttons.css            # Buttons, icon buttons, states
    ├── cards.css              # Stats cards and gradient borders
    ├── cooks.css              # Cook payroll cards and salary breakdowns
    ├── modals.css             # Dialog popups and form inputs
    ├── navigation.css         # Category navigation tabs
    ├── orders.css             # Order toolbars, search, filter controls
    ├── policy.css             # Policy cards and matrix tables
    ├── table.css              # Data tables and responsive rows
    ├── toast.css              # Toast notifications
    └── vendors.css            # Vendor cards and bill tables
```

---

## 🛠️ Technology Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.9+), Uvicorn ASGI Server
- **Google Sheets Integration**: `gspread`, Google API Client Libraries, Service Account OAuth2
- **Data Engine**: `pandas`, `openpyxl` (local Excel cache and fallback)
- **Frontend**: [React 19](https://react.dev/), Babel Standalone / Native Bundling
- **Styling**: Component-specific CSS3 with modern CSS custom properties and Flexbox/CSS Grid

---

## 💻 Local Setup & Execution

### Prerequisites
- Python 3.9 or higher
- Google Cloud Service Account credentials (`credentials.json`) with access to the target Google Sheet

### 1. Installation
```powershell
# Clone or navigate to the project directory
cd sheet_sync_dashboard

# Create and activate a virtual environment (optional but recommended)
python -m venv venv
.\venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt
```

### 2. Configuration
Create a `.env` file from `.env.example`:
```ini
SPREADSHEET_ID=your_google_spreadsheet_id_here
SPREADSHEET_GID=your_initial_sheet_gid_here
# Either provide the path to credentials.json:
GOOGLE_APPLICATION_CREDENTIALS=credentials.json
# Or provide the full raw JSON string:
# GOOGLE_SERVICE_ACCOUNT_JSON={"type": "service_account", ...}
```

### 3. Build Scripts
Whenever modifying JSX components or CSS stylesheets:
```powershell
# Recompile CSS bundle
powershell -ExecutionPolicy Bypass -File build_css.ps1

# Recompile React JSX bundle
powershell -ExecutionPolicy Bypass -File build_bundle.ps1
```

### 4. Run the Application
```powershell
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```
Open your browser and navigate to: **http://127.0.0.1:8000**
