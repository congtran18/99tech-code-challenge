/**
 * Problem 3 — Messy React: Refactored WalletPage
 *
 * See AUDIT.md for the full list of identified bugs and anti-patterns.
 *
 * @complexity
 *   - Filter:  O(n)
 *   - Sort:    O(n log n)
 *   - Format:  O(n) — merged into the same useMemo pass as sort/filter
 *   - Space:   O(n) — single output array
 */

import React, { useMemo } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX Bug 1: Replace `any` with a strict string-union type.
 * `string &{}` ensures the type accepts known values with autocomplete while
 * still being compatible with arbitrary string data from the API.
 */
type Blockchain =
  | "Osmosis"
  | "Ethereum"
  | "Arbitrum"
  | "Zilliqa"
  | "Neo"
  | (string & {});

interface WalletBalance {
  readonly currency: string;
  readonly amount: number;
  readonly blockchain: Blockchain;
}

/**
 * FIX Bug 6: Extend WalletBalance instead of duplicating its fields.
 */
interface FormattedWalletBalance extends WalletBalance {
  readonly formatted: string;
}

/**
 * FIX Bug 8: Removed empty `interface Props extends BoxProps {}`.
 * Using a concrete type that matches the actual usage (spreading onto a <div>).
 * Replace with `BoxProps` from your UI library if available.
 */
type Props = React.ComponentPropsWithoutRef<"div">;

// ─────────────────────────────────────────────────────────────────────────────
// Utility — lifted outside component (FIX Bug 2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * FIX Bug 2: Lifted outside the component so it is never recreated on render.
 * This is a pure function with no dependency on state or props.
 *
 * Returns a numeric priority for sorting — higher means shown first.
 *
 * @complexity O(1) time, O(1) space
 */
const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case "Osmosis":
      return 100;
    case "Ethereum":
      return 50;
    case "Arbitrum":
      return 30;
    case "Zilliqa":
      return 20;
    case "Neo":
      return 20;
    default:
      return -99;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock hooks — replace with real implementations
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: These are placeholder hooks. In production these would import from
// dedicated service modules (e.g., `useWalletBalances`, `usePrices`).
declare function useWalletBalances(): readonly WalletBalance[];
declare function usePrices(): Readonly<Record<string, number>>;

// ─────────────────────────────────────────────────────────────────────────────
// Mock sub-component — replace with real WalletRow
// ─────────────────────────────────────────────────────────────────────────────

interface WalletRowProps {
  readonly amount: number;
  readonly usdValue: number;
  readonly formattedAmount: string;
  readonly className?: string;
}

declare function WalletRow(props: WalletRowProps): JSX.Element;

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const WalletPage: React.FC<Props> = ({ className, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  /**
   * FIX Bugs 3, 4, 5:
   *
   * - Bug 3: Removed `prices` from the dependency array — it was never used
   *   inside this callback, causing unnecessary recomputation on price updates.
   *
   * - Bug 4a: Fixed undefined variable: `lhsPriority` → `priority` (derived
   *   from `balancePriority`).
   *
   * - Bug 4b: Fixed inverted filter logic: `amount <= 0` → `amount > 0`.
   *   The original code kept zero/negative balances and discarded positive ones.
   *
   * - Bug 5: Merged formatting into this single pass (O(n)) so we don't need a
   *   separate `.map()` call. Returns `FormattedWalletBalance[]` directly.
   *
   * @complexity O(n log n) time (sort dominates), O(n) space
   */
  const sortedFormattedBalances = useMemo<
    readonly FormattedWalletBalance[]
  >(() => {
    return balances
      .filter((balance) => {
        const priority = getPriority(balance.blockchain);
        // FIX Bug 4: correct guard — keep only items with valid priority AND positive amount
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs, rhs) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Descending sort by priority (higher priority = shown first)
        return rightPriority - leftPriority;
      })
      .map((balance) => ({
        ...balance,
        // FIX Bug 5: format is computed in the same pass, not a separate map
        formatted: balance.amount.toFixed(2),
      }));
  }, [balances]); // FIX Bug 3: `prices` removed — not used here

  return (
    <div className={className} {...rest}>
      {sortedFormattedBalances.map((balance) => {
        /**
         * FIX Bug 9: Guard against undefined price to prevent NaN rendering.
         * If the price feed hasn't loaded yet or the token is unlisted, default to 0.
         */
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;

        return (
          <WalletRow
            key={balance.currency} // FIX Bug 7: stable, unique key instead of array index
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      })}
    </div>
  );
};

export default WalletPage;
