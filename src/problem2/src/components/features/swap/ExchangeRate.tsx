import { memo } from "react";
import { formatCurrency } from "../../../utils/format";

interface ExchangeRateProps {
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly rate: number;
}

export const ExchangeRate = memo(function ExchangeRate({
  fromCurrency,
  toCurrency,
  rate,
}: ExchangeRateProps) {
  return (
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
        1 {fromCurrency} ≈ {formatCurrency(rate, 6)} {toCurrency}
      </span>
    </aside>
  );
});
