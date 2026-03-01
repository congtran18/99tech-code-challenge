import { memo } from "react";
import { formatCurrency } from "../utils/format";

interface AmountInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly readOnly?: boolean;
  readonly error?: string;
  readonly computedValue?: string;
  readonly onChange?: (value: string) => void;
}

const AmountInput = memo(function AmountInput({
  id,
  label,
  value,
  readOnly = false,
  error,
  computedValue,
  onChange,
}: AmountInputProps) {
  const displayValue =
    readOnly && computedValue ? formatCurrency(Number(computedValue)) : value;

  return (
    <div className="amount-input-wrapper">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div
        className={`amount-input-container ${error ? "amount-input-container--error" : ""} ${readOnly ? "amount-input-container--readonly" : ""}`}
      >
        <input
          id={id}
          type={readOnly ? "text" : "number"}
          inputMode="decimal"
          className="amount-input"
          value={displayValue}
          readOnly={readOnly}
          aria-readonly={readOnly}
          placeholder={readOnly ? "0.00" : "Enter amount"}
          min={0}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
        {readOnly && (
          <span className="amount-badge" aria-hidden="true">
            Estimated
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default AmountInput;
