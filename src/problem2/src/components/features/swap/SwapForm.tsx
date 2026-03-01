import type { Token, SwapFormErrors } from "../../../types/token.types";
import TokenSelector from "./TokenSelector";
import AmountInput from "../../ui/AmountInput";
import SwapButton from "../../ui/SwapButton";
import SwapArrowsIcon from "../../ui/SwapArrowsIcon";
import { ExchangeRate } from "./ExchangeRate";

interface SwapFormProps {
  readonly tokens: readonly Token[];
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly fromAmount: string;
  readonly toAmount: string;
  readonly exchangeRate: number | null;
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
  exchangeRate,
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
          <SwapArrowsIcon
            className="swap-form__title-icon"
            width={28}
            height={28}
          />
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
            <SwapArrowsIcon width={18} height={18} />
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
            readOnly
          />
        </div>

        {/* Exchange rate — pre-computed in hook */}
        {exchangeRate !== null && fromCurrency && toCurrency && fromAmount && (
          <ExchangeRate
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            rate={exchangeRate}
          />
        )}
      </section>

      <footer className="swap-form__footer">
        <SwapButton isLoading={isSubmitting} />
      </footer>
    </form>
  );
}
