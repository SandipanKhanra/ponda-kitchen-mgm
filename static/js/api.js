// =============================================================================
// Kitchen Accountability ERP - API Client
// =============================================================================

window.KitchenAPI = (() => {
  async function request(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.detail || `Request failed with status ${res.status}`);
    }
    return data;
  }

  return {
    getStatus: () => request('/api/status'),
    
    getTabs: (forceRefresh = false) => 
      request(`/api/tabs${forceRefresh ? '?refresh=true' : ''}`),
    
    selectTab: (tab) => 
      request('/api/tabs/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tab })
      }),
      
    createSheet: (sheetName, cloneFrom = 'Master_Template') =>
      request('/api/sheets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheet_name: sheetName, clone_from: cloneFrom })
      }),
      
    getRecords: (tab, forceRefresh = false) => {
      const params = new URLSearchParams();
      if (tab) params.append('tab', tab);
      if (forceRefresh) params.append('refresh', 'true');
      return request(`/api/records?${params.toString()}`);
    },
    
    createRecord: (tab, payload) =>
      request(`/api/records?tab=${encodeURIComponent(tab)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      
    updateRecord: (tab, id, payload) =>
      request(`/api/records/${id}?tab=${encodeURIComponent(tab)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      
    deleteRecord: (tab, id) =>
      request(`/api/records/${id}?tab=${encodeURIComponent(tab)}`, {
        method: 'DELETE'
      }),
      
    getVendors: (tab) =>
      request(`/api/vendors?tab=${encodeURIComponent(tab)}`),
      
    createVendor: (tab, payload) =>
      request('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tab })
      }),
      
    updateVendor: (tab, rowNumber, payload) =>
      request(`/api/vendors/${rowNumber}?tab=${encodeURIComponent(tab)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }),
      
    deleteVendor: (tab, rowNumber) =>
      request(`/api/vendors/${rowNumber}?tab=${encodeURIComponent(tab)}`, {
        method: 'DELETE'
      }),
      
    createVendorEntry: (tab, payload) =>
      request('/api/vendors/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tab })
      }),
      
    deleteVendorEntry: (tab, entryId) =>
      request(`/api/vendors/entries/${entryId}?tab=${encodeURIComponent(tab)}`, {
        method: 'DELETE'
      }),
      
    getCooks: (tab) =>
      request(`/api/cooks?tab=${encodeURIComponent(tab)}`),
      
    createCook: (tab, payload) =>
      request(`/api/cooks?tab=${encodeURIComponent(tab)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tab })
      }),
      
    updateCook: (tab, cookId, payload) =>
      request(`/api/cooks/${cookId}?tab=${encodeURIComponent(tab)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, tab })
      }),
      
    deleteCook: (cookId) =>
      request(`/api/cooks/${cookId}`, {
        method: 'DELETE'
      })
  };
})();

