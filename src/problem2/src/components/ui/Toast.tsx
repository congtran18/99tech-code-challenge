import { memo } from "react";

interface ToastProps {
  readonly message: string;
  readonly onDismiss: () => void;
}

export const Toast = memo(function Toast({ message, onDismiss }: ToastProps) {
  return (
    <div className="toast-container" role="status" aria-live="assertive">
      <div className="toast toast--success">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          width={20}
          height={20}
          aria-hidden="true"
        >
          <path
            d="M20 6 9 17l-5-5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>{message}</span>
        <button
          type="button"
          className="toast__close"
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
});
