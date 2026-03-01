import { memo, type RefObject } from "react";
import { FALLBACK_TOKEN_ICON } from "../../../utils/format";
import type { Token } from "../../../types/token.types";

interface TokenDropdownProps {
  readonly label: string;
  readonly tokens: readonly Token[];
  readonly selectedValue: string;
  readonly searchRef: RefObject<HTMLInputElement>;
  readonly searchQuery: string;
  readonly onSearchChange: (query: string) => void;
  readonly onSelect: (currency: string) => void;
}

export const TokenDropdown = memo(function TokenDropdown({
  label,
  tokens,
  selectedValue,
  searchRef,
  searchQuery,
  onSearchChange,
  onSelect,
}: TokenDropdownProps) {
  return (
    <div className="dropdown" role="listbox" aria-label={label}>
      <div className="dropdown-search-wrapper">
        <input
          ref={searchRef}
          type="search"
          className="dropdown-search"
          placeholder="Search token..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tokens"
        />
      </div>
      <ul className="dropdown-list">
        {tokens.length === 0 ? (
          <li className="dropdown-empty">No tokens found</li>
        ) : (
          tokens.map((token) => (
            <li
              key={token.currency}
              role="option"
              aria-selected={token.currency === selectedValue}
              className={`dropdown-item ${token.currency === selectedValue ? "dropdown-item--active" : ""}`}
              onClick={() => onSelect(token.currency)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  onSelect(token.currency);
              }}
              tabIndex={0}
            >
              <img
                src={token.iconUrl}
                alt={token.currency}
                className="token-icon"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    FALLBACK_TOKEN_ICON;
                }}
              />
              <span className="token-symbol">{token.currency}</span>
              <span className="token-price">${token.price.toFixed(4)}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
});
