import { memo } from "react";

interface AmountInputProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly readOnly?: boolean;
  readonly error?: string;
  readonly onChange?: (value: string) => void;
}

const AmountInput = memo(function AmountInput({
  id,
  label,
  value,
  readOnly = false,
  error,
  onChange,
}: AmountInputProps) {
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
          type="text"
          inputMode="decimal"
          className="amount-input"
          value={value}
          readOnly={readOnly}
          aria-readonly={readOnly}
          placeholder={readOnly ? "0.00" : "Enter amount"}
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
