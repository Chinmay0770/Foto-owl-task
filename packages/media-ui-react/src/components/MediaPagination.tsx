import React from "react";

interface MediaPaginationProps {
  page: number;

  hasNextPage: boolean;

  loading: boolean;

  onPageChange: (
    page: number
  ) => void;
}

export function MediaPagination({
  page,
  hasNextPage,
  loading,
  onPageChange,
}: MediaPaginationProps) {
  return (
    <nav
      className="media-pagination"
      aria-label="Media pagination"
    >
      <button
        type="button"
        disabled={
          loading ||
          page <= 1
        }
        onClick={() =>
          onPageChange(
            page - 1
          )
        }
      >
        Previous
      </button>

      <span>
        Page {page}
      </span>

      <button
        type="button"
        disabled={
          loading ||
          !hasNextPage
        }
        onClick={() =>
          onPageChange(
            page + 1
          )
        }
      >
        Next
      </button>
    </nav>
  );
}