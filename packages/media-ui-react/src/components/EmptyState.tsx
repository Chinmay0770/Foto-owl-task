import React from "react";

interface EmptyStateProps {
  query?: string;
}

export function EmptyState({
  query,
}: EmptyStateProps) {
  return (
    <div className="media-empty">
      {query
        ? `No media found for "${query}".`
        : "Search for media to get started."}
    </div>
  );
}