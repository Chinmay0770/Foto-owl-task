import React from "react";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Something went wrong.";
  }
}

export function ErrorState({
  error,
  onRetry,
}: ErrorStateProps) {
  const message = getErrorMessage(error);

  return (
    <div
      className="media-error"
      role="alert"
    >
      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}