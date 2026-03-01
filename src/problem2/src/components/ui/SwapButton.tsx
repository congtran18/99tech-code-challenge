import { memo } from "react";

interface SwapButtonProps {
  readonly isLoading: boolean;
}

const SwapButton = memo(function SwapButton({ isLoading }: SwapButtonProps) {
  return (
    <button
      type="submit"
      className={`swap-btn ${isLoading ? "swap-btn--loading" : ""}`}
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
