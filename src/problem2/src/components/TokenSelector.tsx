import { useState, useRef, useEffect, useCallback, memo } from "react";
import type { Token } from "../types/token.types";

interface TokenSelectorProps {
  readonly id: string;
  readonly label: string;
  readonly tokens: readonly Token[];
  readonly value: string;
  readonly error?: string;
  readonly onChange: (currency: string) => void;
}

const FALLBACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a78bfa'%3E%3Ccircle cx='12' cy='12' r='10' fill='%231e1b4b'/%3E%3Ctext x='12' y='16' text-anchor='middle' font-size='10' fill='%23a78bfa'%3E%3F%3C/text%3E%3C/svg%3E";

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

  const selected = tokens.find((t) => t.currency === value);

  const filteredTokens = tokens.filter((t) =>
    t.currency.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setSearchQuery("");
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  const handleSelect = useCallback(
    (currency: string) => {
      onChange(currency);
      setIsOpen(false);
      setSearchQuery("");
    },
    [onChange],
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsOpen(false);
  }, []);

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
                (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON;
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
        <div className="dropdown" role="listbox" aria-label={label}>
          <div className="dropdown-search-wrapper">
            <input
              ref={searchRef}
              type="search"
              className="dropdown-search"
              placeholder="Search token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search tokens"
            />
          </div>
          <ul className="dropdown-list">
            {filteredTokens.length === 0 ? (
              <li className="dropdown-empty">No tokens found</li>
            ) : (
              filteredTokens.map((token) => (
                <li
                  key={token.currency}
                  role="option"
                  aria-selected={token.currency === value}
                  className={`dropdown-item ${token.currency === value ? "dropdown-item--active" : ""}`}
                  onClick={() => handleSelect(token.currency)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleSelect(token.currency);
                  }}
                  tabIndex={0}
                >
                  <img
                    src={token.iconUrl}
                    alt={token.currency}
                    className="token-icon"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_ICON;
                    }}
                  />
                  <span className="token-symbol">{token.currency}</span>
                  <span className="token-price">${token.price.toFixed(4)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
});

export default TokenSelector;
