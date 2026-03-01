import { memo } from "react";

interface ErrorOverlayProps {
  readonly message: string;
  readonly onRetry?: () => void;
}

export const ErrorOverlay = memo(function ErrorOverlay({
  message,
  onRetry,
}: ErrorOverlayProps) {
  return (
    <div className="state-overlay state-overlay--error" role="alert">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        width={40}
        height={40}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
      </svg>
      <p>{message}</p>
      <button className="retry-btn" onClick={onRetry} type="button">
        Retry
      </button>
    </div>
  );
});
