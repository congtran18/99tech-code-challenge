import { useCurrencySwap } from "./hooks/useCurrencySwap";
import SwapForm from "./components/SwapForm";
import "./styles/global.css";

export default function App() {
  const {
    fetchState,
    swapState,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    errors,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleFromAmountChange,
    handleSwap,
    handleSubmit,
    dismissSwapResult,
  } = useCurrencySwap();

  return (
    <main className="app-shell">
      <div className="bg-blob bg-blob--1" aria-hidden="true" />
      <div className="bg-blob bg-blob--2" aria-hidden="true" />

      <div className="card">
        {fetchState.status === "loading" && (
          <div className="state-overlay" role="status" aria-live="polite">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <p>Loading token prices…</p>
          </div>
        )}

        {fetchState.status === "error" && (
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
            <p>{fetchState.message}</p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
              type="button"
            >
              Retry
            </button>
          </div>
        )}

        {fetchState.status === "success" && (
          <SwapForm
            tokens={fetchState.data}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            fromAmount={fromAmount}
            toAmount={toAmount}
            errors={errors}
            isSubmitting={swapState.status === "loading"}
            onFromCurrencyChange={handleFromCurrencyChange}
            onToCurrencyChange={handleToCurrencyChange}
            onFromAmountChange={handleFromAmountChange}
            onSwap={handleSwap}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {swapState.status === "success" && (
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
            <span>Swap confirmed successfully!</span>
            <button
              type="button"
              className="toast__close"
              onClick={dismissSwapResult}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
