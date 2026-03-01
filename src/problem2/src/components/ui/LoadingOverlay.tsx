import { memo } from "react";

export const LoadingOverlay = memo(function LoadingOverlay() {
  return (
    <div className="state-overlay" role="status" aria-live="polite">
      <span className="spinner spinner--lg" aria-hidden="true" />
      <p>Loading token prices…</p>
    </div>
  );
});
