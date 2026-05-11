/**
 * Pagination Component
 * Reusable pagination controls
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  const maxVisible = 5;
  const halfVisible = Math.floor(maxVisible / 2);

  let startPage = Math.max(1, currentPage - halfVisible);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    pages.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        className="px-3 py-2 rounded hover:bg-gray-200"
      >
        1
      </button>
    );
    if (startPage > 2) {
      pages.push(
        <span key="dots1" className="px-2 py-2">
          ...
        </span>
      );
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-2 rounded transition ${
          i === currentPage
            ? 'bg-primary-500 text-white'
            : 'hover:bg-gray-200'
        }`}
      >
        {i}
      </button>
    );
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="dots2" className="px-2 py-2">
          ...
        </span>
      );
    }
    pages.push(
      <button
        key="last"
        onClick={() => onPageChange(totalPages)}
        className="px-3 py-2 rounded hover:bg-gray-200"
      >
        {totalPages}
      </button>
    );
  }

  return (
    <div className="flex justify-center gap-2 my-6">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex gap-1">{pages}</div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
