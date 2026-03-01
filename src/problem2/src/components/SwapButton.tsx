import { memo } from "react";

interface SwapButtonProps {
  readonly isLoading: boolean;
  readonly onClick: () => void;
}

const SwapButton = memo(function SwapButton({
  isLoading,
  onClick,
}: SwapButtonProps) {
  return (
    <button
      type="button"
      className={`swap-btn ${isLoading ? "swap-btn--loading" : ""}`}
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
      aria-label={isLoading ? "Processing swap..." : "Confirm swap"}
    >
      {isLoading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        <span>CONFIRM SWAP</span>
      )}
    </button>
  );
});

export default SwapButton;
