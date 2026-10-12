// =============================================================================
// Pagination Controls Component
// =============================================================================

window.KitchenComponents = window.KitchenComponents || {};
window.KitchenComponents.Orders = window.KitchenComponents.Orders || {};

window.KitchenComponents.Orders.Pagination = (() => {
  const { React } = window;

  function Pagination({
    total = 0,
    currentPage = 1,
    pageSize = 10,
    onPageChange,
    onPageSizeChange
  }) {
    if (total === 0) return null;

    const effectivePageSize = pageSize === 'all' ? total : parseInt(pageSize, 10);
    const maxPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(total / effectivePageSize)) : 1;
    const startIndex = (currentPage - 1) * effectivePageSize;
    const countOnPage = pageSize === 'all' ? total : Math.min(effectivePageSize, total - startIndex);
    const end = startIndex + countOnPage;

    const startP = Math.max(1, currentPage - 2);
    const endP = Math.min(maxPages, currentPage + 2);
    const pageNumbers = [];
    for (let p = startP; p <= endP; p++) {
      pageNumbers.push(p);
    }

    return (
      <div className="pagination-wrapper" id="paginationWrapper">
        <div className="pagination-info" id="paginationInfo">
          Showing <strong>{startIndex + 1}</strong> to <strong>{end}</strong> of <strong>{total}</strong> entries
        </div>

        <div className="pagination-controls" id="paginationControls">
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            title="First Page"
            aria-label="First page"
          >
            &laquo;
          </button>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            title="Previous Page"
            aria-label="Previous page"
          >
            &lsaquo;
          </button>

          {pageNumbers.map((p) => (
            <button
              key={p}
              type="button"
              className={`page-btn ${p === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            className="page-btn"
            disabled={currentPage === maxPages}
            onClick={() => onPageChange(currentPage + 1)}
            title="Next Page"
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          <button
            type="button"
            className="page-btn"
            disabled={currentPage === maxPages}
            onClick={() => onPageChange(maxPages)}
            title="Last Page"
            aria-label="Last page"
          >
            &raquo;
          </button>
        </div>

        <div className="page-size-selector">
          <label htmlFor="pageSizeSelect" className="hide-mobile">Rows:</label>
          <select
            id="pageSizeSelect"
            className="page-size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(e.target.value)}
            aria-label="Select rows per page"
          >
            <option value="10">10 / page</option>
            <option value="25">25 / page</option>
            <option value="50">50 / page</option>
            <option value="all">Show All</option>
          </select>
        </div>
      </div>
    );
  }

  return Pagination;
})();

window.KitchenComponents.Pagination = window.KitchenComponents.Orders.Pagination;

