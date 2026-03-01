import type { Token } from "../types/token.types";
import TokenSelector from "./TokenSelector";
import AmountInput from "./AmountInput";
import SwapButton from "./SwapButton";
import type { SwapFormErrors } from "../types/token.types";

interface SwapFormProps {
  readonly tokens: readonly Token[];
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly fromAmount: string;
  readonly toAmount: string;
  readonly errors: SwapFormErrors;
  readonly isSubmitting: boolean;
  readonly onFromCurrencyChange: (c: string) => void;
  readonly onToCurrencyChange: (c: string) => void;
  readonly onFromAmountChange: (a: string) => void;
  readonly onSwap: () => void;
  readonly onSubmit: () => Promise<void>;
}

export default function SwapForm({
  tokens,
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  errors,
  isSubmitting,
  onFromCurrencyChange,
  onToCurrencyChange,
  onFromAmountChange,
  onSwap,
  onSubmit,
}: SwapFormProps) {
  return (
    <form
      className="swap-form"
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      noValidate
      aria-label="Currency swap form"
    >
      <header className="swap-form__header">
        <h1 className="swap-form__title">
          <svg
            className="swap-form__title-icon"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 16V4m0 0L3 8m4-4 4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 8v12m0 0 4-4m-4 4-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Swap
        </h1>
        <p className="swap-form__subtitle">
          Trade tokens instantly at the best rates
        </p>
      </header>

      <section className="swap-form__body" aria-label="Swap details">
        {/* From token */}
        <div className="swap-panel swap-panel--from">
          <TokenSelector
            id="from-token"
            label="From"
            tokens={tokens}
            value={fromCurrency}
            error={errors.fromCurrency}
            onChange={onFromCurrencyChange}
          />
          <AmountInput
            id="from-amount"
            label="Amount to send"
            value={fromAmount}
            error={errors.fromAmount}
            onChange={onFromAmountChange}
          />
        </div>

        {/* Swap direction button */}
        <div className="swap-divider">
          <button
            type="button"
            className="swap-direction-btn"
            onClick={onSwap}
            aria-label="Switch token direction"
            title="Switch tokens"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                d="M7 16V4m0 0L3 8m4-4 4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17 8v12m0 0 4-4m-4 4-4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* To token */}
        <div className="swap-panel swap-panel--to">
          <TokenSelector
            id="to-token"
            label="To"
            tokens={tokens}
            value={toCurrency}
            error={errors.toCurrency}
            onChange={onToCurrencyChange}
          />
          <AmountInput
            id="to-amount"
            label="Amount to receive"
            value={toAmount}
            computedValue={toAmount}
            readOnly
          />
        </div>

        {/* Exchange rate summary */}
        {fromCurrency && toCurrency && fromAmount && toAmount && (
          <aside
            className="exchange-rate"
            aria-live="polite"
            aria-label="Exchange rate"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              width={14}
              height={14}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" />
            </svg>
            <span>
              1 {fromCurrency} ≈{" "}
              {(Number(toAmount) / Number(fromAmount)).toFixed(6)} {toCurrency}
            </span>
          </aside>
        )}
      </section>

      <footer className="swap-form__footer">
        <SwapButton isLoading={isSubmitting} onClick={() => void onSubmit()} />
      </footer>
    </form>
  );
}
