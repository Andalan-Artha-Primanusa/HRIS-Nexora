import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

/* ========================================
   PAGINATION COMPONENT
   ======================================== */

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showInfo?: boolean;
  alignment?: 'start' | 'center' | 'end';
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  showInfo = true,
  alignment = 'center',
  className = '',
}) => {
  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const sibling = 1;
    const leftSibling = Math.max(currentPage - sibling, 1);
    const rightSibling = Math.min(currentPage + sibling, totalPages);

    // Always show first page
    pages.push(1);

    // Show ellipsis if there's gap between 1 and leftSibling
    if (leftSibling > 2) {
      pages.push('...');
    }

    // Show pages around current page
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    // Show ellipsis if there's gap between rightSibling and totalPages
    if (rightSibling < totalPages - 1) {
      pages.push('...');
    }

    // Always show last page (if there's more than 1 page)
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePreviousClick = () => {
    if (canGoPrevious) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className={`pagination pagination-${alignment} ${className}`}>
      {/* Previous Button */}
      <button
        className="pagination-button prev"
        onClick={handlePreviousClick}
        disabled={!canGoPrevious}
        type="button"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <button
              key={`ellipsis-${index}`}
              className="pagination-button ellipsis"
              disabled
              type="button"
            >
              {page}
            </button>
          );
        }

        const pageNum = page as number;
        const isActive = currentPage === pageNum;

        return (
          <button
            key={pageNum}
            className={`pagination-button page ${isActive ? 'active' : ''}`}
            onClick={() => onPageChange(pageNum)}
            disabled={isActive}
            type="button"
            aria-label={`Go to page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        className="pagination-button next"
        onClick={handleNextClick}
        disabled={!canGoNext}
        type="button"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </button>

      {/* Info Section */}
      {showInfo && (totalItems !== undefined || itemsPerPage !== undefined) && (
        <div className="pagination-info">
          {totalItems !== undefined && (
            <span className="pagination-info-text">
              Total: <strong>{totalItems}</strong> items
            </span>
          )}

          {itemsPerPage !== undefined && onItemsPerPageChange && (
            <div>
              <label htmlFor="items-per-page" style={{ marginRight: '4px', fontSize: 'var(--font-size-xs)' }}>
                Per page:
              </label>
              <select
                id="items-per-page"
                className="pagination-info-select"
                value={itemsPerPage}
                onChange={(e) => {
                  const newItemsPerPage = parseInt(e.target.value, 10);
                  onItemsPerPageChange(newItemsPerPage);
                  // Reset to first page when items per page changes
                  onPageChange(1);
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          )}

          <span className="pagination-info-text">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

/* ========================================
   SIMPLE PAGINATION (Minimal version)
   ======================================== */

interface SimplePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const SimplePagination: React.FC<SimplePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      showInfo={false}
      className={className}
    />
  );
};

/* ========================================
   PAGINATION WITH SIZE CONTROL
   ======================================== */

interface PaginationWithSizeProps extends SimplePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const PaginationWithSize: React.FC<PaginationWithSizeProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  className = '',
}) => {
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={onItemsPerPageChange}
      showInfo={true}
      className={className}
    />
  );
};
