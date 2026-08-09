import React from "react";

export function LoadingState() {
  return (
    <div
      className="media-loading"
      role="status"
      aria-live="polite"
    >
      Loading media...
    </div>
  );
}