import { useCurrencySwap } from "./hooks/useCurrencySwap";
import { AppLayout } from "./components/layout/AppLayout";
import SwapForm from "./components/features/swap/SwapForm";
import { LoadingOverlay, ErrorOverlay, Toast } from "./components/ui";
import "./styles/global.css";

export default function App() {
  const {
    fetchState,
    swapState,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    exchangeRate,
    errors,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleFromAmountChange,
    handleSwap,
    handleSubmit,
    handleRetry,
    dismissSwapResult,
  } = useCurrencySwap();

  return (
    <AppLayout>
      <div className="card">
        {fetchState.status === "loading" && <LoadingOverlay />}

        {fetchState.status === "error" && (
          <ErrorOverlay message={fetchState.message} onRetry={handleRetry} />
        )}

        {fetchState.status === "success" && (
          <SwapForm
            tokens={fetchState.data}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            fromAmount={fromAmount}
            toAmount={toAmount}
            exchangeRate={exchangeRate}
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
        <Toast
          message="Swap confirmed successfully!"
          onDismiss={dismissSwapResult}
        />
      )}
    </AppLayout>
  );
}
