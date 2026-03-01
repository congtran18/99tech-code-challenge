import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import type { Token } from "../../../types/token.types";
import { FALLBACK_TOKEN_ICON } from "../../../utils/format";
import { TokenDropdown } from "./TokenDropdown";

interface TokenSelectorProps {
  readonly id: string;
  readonly label: string;
  readonly tokens: readonly Token[];
  readonly value: string;
  readonly error?: string;
  readonly onChange: (currency: string) => void;
}

const TokenSelector = memo(function TokenSelector({
  id,
  label,
  tokens,
  value,
  error,
  onChange,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected = useMemo(
    () => tokens.find((t) => t.currency === value),
    [tokens, value],
  );

  const filteredTokens = useMemo(
    () =>
      tokens.filter((t) =>
        t.currency.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [tokens, searchQuery],
  );

  const closeDropdown = useCallback((returnFocus = true) => {
    setIsOpen(false);
    setSearchQuery("");
    if (returnFocus) {
      setTimeout(() => triggerRef.current?.focus(), 0);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearchQuery("");
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  const handleSelect = useCallback(
    (currency: string) => {
      onChange(currency);
      closeDropdown(true);
    },
    [onChange, closeDropdown],
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape — return focus to trigger
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDropdown(true);
      }
    },
    [isOpen, closeDropdown],
  );

  return (
    <div
      className="token-selector-wrapper"
      ref={containerRef}
      onKeyDown={handleKeyDown}
    >
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      <button
        id={id}
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label}: ${selected?.currency ?? "Select token"}`}
        className={`token-trigger ${error ? "token-trigger--error" : ""}`}
        onClick={handleOpen}
      >
        {selected ? (
          <>
            <img
              src={selected.iconUrl}
              alt={selected.currency}
              className="token-icon"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = FALLBACK_TOKEN_ICON;
              }}
            />
            <span className="token-symbol">{selected.currency}</span>
          </>
        ) : (
          <span className="token-placeholder">Select token</span>
        )}
        <svg
          className={`chevron ${isOpen ? "chevron--open" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}

      {isOpen && (
        <TokenDropdown
          label={label}
          tokens={filteredTokens}
          selectedValue={value}
          searchRef={searchRef}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
});

export default TokenSelector;
