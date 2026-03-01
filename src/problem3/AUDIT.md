# Problem 3 — Messy React: Code Audit

## Original Code

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {}

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
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

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        const balancePriority = getPriority(balance.blockchain);
        if (lhsPriority > -99) {
          // BUG
          if (balance.amount <= 0) {
            return true;
          } // BUG
        }
        return false;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        if (leftPriority > rightPriority) return -1;
        else if (rightPriority > leftPriority) return 1;
      });
  }, [balances, prices]); // BUG

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return { ...balance, formatted: balance.amount.toFixed() };
  });

  const rows = sortedBalances.map(
    (balance: FormattedWalletBalance, index: number) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow
          className={classes.row}
          key={index} // BUG
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    },
  );

  return <div {...rest}>{rows}</div>;
};
```

---

## Bug & Anti-Pattern Analysis

### Bug 1 — `getPriority(blockchain: any)` — Banned `any` type

|              |                                                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `const getPriority = (blockchain: any): number =>`                                                                                                                         |
| **Problem**  | `any` disables TypeScript's type system. The compiler will not catch incorrect calls like `getPriority(42)`.                                                               |
| **Fix**      | Define a `Blockchain` string union type: `type Blockchain = 'Osmosis' \| 'Ethereum' \| 'Arbitrum' \| 'Zilliqa' \| 'Neo' \| string` and type the parameter as `Blockchain`. |
| **Rule**     | Platinum Rule 3 — Zero Tolerance: ABSOLUTELY NO `any`.                                                                                                                     |

---

### Bug 1.b — Missing `blockchain` property in `WalletBalance`

|              |                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `interface WalletBalance` and `getPriority(balance.blockchain)`                                                                                                                                                                                                     |
| **Problem**  | `balance.blockchain` is accessed in the `.filter()` and `.sort()` methods, but `blockchain` is not defined in the `WalletBalance` interface. This will cause a strict TypeScript compilation error: `Property 'blockchain' does not exist on type 'WalletBalance'`. |
| **Fix**      | Add `blockchain: string` (or better, the `Blockchain` type) to the `WalletBalance` interface.                                                                                                                                                                       |
| **Rule**     | Platinum Rule 3 — Static Typing Correctness.                                                                                                                                                                                                                        |

---

### Bug 2 — `getPriority` defined inside the component (SRP violation)

|              |                                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | Line inside `WalletPage` component body                                                                                                                                      |
| **Problem**  | The function has no dependency on component state or props — it is a pure utility. Declaring it inside the component means it is re-created on every render, wasting memory. |
| **Fix**      | Lift `getPriority` outside the component as a module-level `const`.                                                                                                          |
| **Rule**     | Platinum Rule 1 — SRP; Platinum Rule 2 — Performance.                                                                                                                        |

---

### Bug 3 — `useMemo` dependency array includes `prices` (unused dependency)

|              |                                                                                                                                                                                                                                                           |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `}, [balances, prices]);`                                                                                                                                                                                                                                 |
| **Problem**  | `prices` is never referenced inside the `sortedBalances` `useMemo` callback. Including it causes `sortedBalances` to recompute every time prices change — a completely unnecessary re-computation that can tank performance in accounts with many tokens. |
| **Fix**      | Remove `prices` from the dependency array: `}, [balances]);`.                                                                                                                                                                                             |
| **Rule**     | Platinum Rule 2 — Performance Optimization.                                                                                                                                                                                                               |

---

### Bug 4 (CRITICAL) — `lhsPriority` undefined variable + inverted filter logic

|               |                                                                                                                                                                                                                                                                             |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location**  | Inside `.filter()` callback                                                                                                                                                                                                                                                 |
| **Problem 1** | The variable computed is `balancePriority`, but the condition checks `lhsPriority > -99`. `lhsPriority` is **not defined** in this scope — this is a runtime `ReferenceError`.                                                                                              |
| **Problem 2** | Even if corrected to `balancePriority > -99`, the inner condition `if (balance.amount <= 0) { return true; }` **inverts the intent**: it keeps balances with zero or negative amounts and **discards** positive balances. The correct logic should be `balance.amount > 0`. |
| **Fix**       | `const priority = getPriority(balance.blockchain); return priority > -99 && balance.amount > 0;`                                                                                                                                                                            |
| **Rule**      | Platinum Rule 7 — Edge Case Handling.                                                                                                                                                                                                                                       |

---

### Bug 5 — `formattedBalances` created in a separate unmemoized pass

|              |                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `const formattedBalances = sortedBalances.map(...)`                                                                                                                                                                                                                                                                                      |
| **Problem**  | This is an extra O(n) iteration over the already-processed `sortedBalances`. It is computed on every render (not wrapped in `useMemo`) despite being a pure transformation of derived state. Additionally, `formattedBalances` is never used — `rows` incorrectly iterates `sortedBalances` (which lacks the `formatted` field) instead. |
| **Fix**      | Merge formatting into the single `useMemo` that computes `sortedBalances`, returning `FormattedWalletBalance[]` directly.                                                                                                                                                                                                                |
| **Rule**     | Platinum Rule 2 — Performance; Platinum Rule 6 — Refactoring Strategy (O(2n) → O(n)).                                                                                                                                                                                                                                                    |

---

### Bug 6 — `FormattedWalletBalance` duplicates `WalletBalance` fields (DRY violation)

|              |                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `interface FormattedWalletBalance`                                                                                                                               |
| **Problem**  | `currency: string` and `amount: number` are re-declared verbatim from `WalletBalance`. This violates DRY — a change to the base type must be made in two places. |
| **Fix**      | `interface FormattedWalletBalance extends WalletBalance { readonly formatted: string; }`                                                                         |
| **Rule**     | Platinum Rule 1 — DRY.                                                                                                                                           |

---

### Bug 7 — `key={index}` anti-pattern in list rendering

|              |                                                                                                                                                                                                                |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `key={index}` in `rows.map()`                                                                                                                                                                                  |
| **Problem**  | Using array index as `key` breaks React's reconciliation algorithm when the list is reordered (e.g., after priority-based sort). React will reuse the wrong DOM nodes, causing stale UI or rendering glitches. |
| **Fix**      | Use `key={balance.currency}` — currency symbols are unique per token in a wallet.                                                                                                                              |
| **Rule**     | Platinum Rule 2 — Render Cycle performance.                                                                                                                                                                    |

---

### Bug 8 — `interface Props extends BoxProps {}` — unnecessary empty extension

|              |                                                                                                                                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `interface Props extends BoxProps {}`                                                                                                                                                                            |
| **Problem**  | Empty interface that adds nothing. If `BoxProps` is the complete prop type, use `type Props = BoxProps`. The `children` destructuring also suggests children are received but never rendered, which is wasteful. |
| **Fix**      | `type Props = React.ComponentProps<'div'>` or simply inline props. Remove unused `children` destructuring.                                                                                                       |
| **Rule**     | Platinum Rule 1 — YAGNI.                                                                                                                                                                                         |

---

### Bug 9 — `prices[balance.currency]` can be `undefined`

|              |                                                                                                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Location** | `const usdValue = prices[balance.currency] * balance.amount;`                                                                                                                                                                          |
| **Problem**  | If a currency is not in the `prices` map (e.g., API hasn't loaded yet, or the token is exotic), `prices[balance.currency]` returns `undefined`. Multiplying by a number gives `NaN`, which silently renders as empty string in the UI. |
| **Fix**      | `const usdValue = (prices[balance.currency] ?? 0) * balance.amount;`                                                                                                                                                                   |
| **Rule**     | Platinum Rule 7 — Edge Case Handling; Platinum Rule 9 — Security/Sanitization.                                                                                                                                                         |

---

## Summary Table

| #   | Severity    | Category    | Issue                                                     |
| --- | ----------- | ----------- | --------------------------------------------------------- |
| 1.a | 🟡 Medium   | Type Safety | `getPriority` accepts `any`                               |
| 1.b | 🔴 Critical | Type Safety | `blockchain` property missing in `WalletBalance`          |
| 2   | 🟡 Medium   | Performance | `getPriority` re-created every render                     |
| 3   | 🟡 Medium   | Performance | `useMemo` depends on unused `prices`                      |
| 4   | 🔴 Critical | Logic Bug   | `lhsPriority` undefined + inverted filter logic           |
| 5   | 🟡 Medium   | Performance | `formattedBalances` un-memoized extra pass + never used   |
| 6   | 🟢 Minor    | DRY         | `FormattedWalletBalance` duplicates base interface fields |
| 7   | 🟡 Medium   | Correctness | `key={index}` breaks reconciliation                       |
| 8   | 🟢 Minor    | YAGNI       | Empty `Props` interface extension, unused `children`      |
| 9   | 🟡 Medium   | Edge Case   | `prices[currency]` can be `undefined` → `NaN`             |
| 10  | 🟢 Minor    | Correctness | `classes.row` used but `classes` is undefined             |

---

## Complexity Analysis

| Operation          | Before                           | After                             |
| ------------------ | -------------------------------- | --------------------------------- |
| Filter             | O(n) — with ReferenceError       | O(n) — correct                    |
| Sort               | O(n log n)                       | O(n log n)                        |
| Format             | O(n) — separate unmemoized pass  | Merged into single `useMemo` pass |
| `useMemo` triggers | On `balances` OR `prices` change | Only on `balances` change         |
| **Space**          | O(n) × 2 (two arrays)            | O(n) (single array)               |

---

## Suggested Commit Message

```
refactor(problem3): fix 10 bugs in WalletPage — type safety, filter logic, memoization, key prop, undefined guard
```
