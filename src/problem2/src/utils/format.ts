/** For exchange-rate display — uses locale grouping (e.g. "1,234.5678") */
export const formatCurrency = (value: number, decimals = 6): string => {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const getTokenIconUrl = (currency: string): string =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;

export { default as FALLBACK_TOKEN_ICON } from "../assets/token-fallback.svg";
