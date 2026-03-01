/**
 * Normalises the input so every implementation only deals with non-negative
 * integers while still honouring the mathematical definition:
 *   • n  > 0  → sum 1 … n
 *   • n  = 0  → 0
 *   • n  < 0  → mirror of the positive case (sum is negative)
 *
 * We rely on the problem guarantee that the result fits within
 * Number.MAX_SAFE_INTEGER, so no BigInt is required.
 */
const normaliseInput = (n: number): { absN: number; sign: 1 | -1 } => {
  if (!Number.isFinite(n)) {
    throw new RangeError(`n must be a finite number, received: ${n}`);
  }
  const absN = Math.abs(Math.trunc(n)); // guard against floats
  const sign: 1 | -1 = n < 0 ? -1 : 1;
  return { absN, sign };
};

// ---------------------------------------------------------------------------
// Implementation A — Closed-form (Gauss formula)
//
// Big-O:
//   Time  : O(1)  – single arithmetic expression
//   Space : O(1)  – no extra allocations
//
// Rationale: The classic Gaussian summation formula  n*(n+1)/2  gives the
// exact result in constant time.  This is the most efficient approach and
// should be the default choice in production code.
// ---------------------------------------------------------------------------
var sum_to_n_a = function (n: number): number {
  if (n === 0) return 0;

  const { absN, sign } = normaliseInput(n);
  return sign * ((absN * (absN + 1)) / 2);
};

// ---------------------------------------------------------------------------
// Implementation B — Iterative (for-loop accumulator)
//
// Big-O:
//   Time  : O(n)  – single pass through 1 … n
//   Space : O(1)  – only one accumulator variable
//
// Rationale: An explicit loop makes the algorithm intent immediately obvious
// to every developer regardless of their mathematical background.  It is
// slightly less efficient than the formula but completely straightforward,
// easy to debug, and has no risk of integer-overflow from intermediate
// multiplications on extremely large inputs.
// ---------------------------------------------------------------------------
var sum_to_n_b = function (n: number): number {
  if (n === 0) return 0;

  const { absN, sign } = normaliseInput(n);

  let total = 0;
  for (let i = 1; i <= absN; i++) {
    total += i;
  }

  return sign * total;
};

// ---------------------------------------------------------------------------
// Implementation C — Recursive with Tail-Call style
//
// Big-O:
//   Time  : O(n)  – n recursive frames
//   Space : O(n)  – call-stack depth (O(1) with TCO, but V8 does not
//                   guarantee TCO for all cases, so treat as O(n))
//
// Rationale: Demonstrates a purely functional, immutable style where no
// mutation occurs.  The accumulator parameter (acc) turns this into a
// tail-recursive form so that engines supporting TCO can optimise it to
// O(1) space.  For large n the iterative or formula approaches are
// preferable; this version showcases the recursive paradigm.
// ---------------------------------------------------------------------------
var sum_to_n_c = function (n: number): number {
  if (n === 0) return 0;

  const { absN, sign } = normaliseInput(n);

  const recurse = (remaining: number, acc: number): number => {
    if (remaining === 0) return acc;
    return recurse(remaining - 1, acc + remaining);
  };

  return sign * recurse(absN, 0);
};

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
