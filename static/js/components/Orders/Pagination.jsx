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

    const { startIndex, end, maxPages, pageNumbers } = React.useMemo(() => {
      const effectiveSize = pageSize === 'all' ? total : parseInt(pageSize, 10);
      const maxP = effectiveSize > 0 ? Math.max(1, Math.ceil(total / effectiveSize)) : 1;
      const startIdx = (currentPage - 1) * effectiveSize;
      const count = pageSize === 'all' ? total : Math.min(effectiveSize, total - startIdx);
      const endIdx = startIdx + count;

      const startP = Math.max(1, currentPage - 2);
      const endP = Math.min(maxP, currentPage + 2);
      const nums = [];
      for (let p = startP; p <= endP; p++) {
        nums.push(p);
      }
      return { startIndex: startIdx, end: endIdx, maxPages: maxP, pageNumbers: nums };
    }, [total, currentPage, pageSize]);

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

  return React.memo ? React.memo(Pagination) : Pagination;
})();

window.KitchenComponents.Pagination = window.KitchenComponents.Orders.Pagination;

