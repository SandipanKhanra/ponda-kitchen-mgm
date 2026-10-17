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
        {/* Fixed / Sticky Top Section (Header + 5-Tab Navigation Bar) */}
        <div className="app-top-section">
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
        </div>

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
