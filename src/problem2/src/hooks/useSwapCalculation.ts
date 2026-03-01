import { useMemo } from "react";

interface UseSwapCalculationParams {
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly fromAmount: string;
  readonly priceMap: ReadonlyMap<string, number>;
}

interface UseSwapCalculationReturn {
  readonly exchangeRate: number | null;
  readonly toAmountDisplay: string;
}

export function useSwapCalculation({
  fromCurrency,
  toCurrency,
  fromAmount,
  priceMap,
}: UseSwapCalculationParams): UseSwapCalculationReturn {
  const exchangeRate = useMemo<number | null>(() => {
    if (!fromCurrency || !toCurrency) return null;
    const fromPrice = priceMap.get(fromCurrency);
    const toPrice = priceMap.get(toCurrency);
    if (!fromPrice || !toPrice) return null;
    return fromPrice / toPrice;
  }, [fromCurrency, toCurrency, priceMap]);

  const toAmountDisplay = useMemo<string>(() => {
    const amount = Number(fromAmount);
    if (!fromAmount || isNaN(amount) || amount <= 0) return "";
    if (exchangeRate === null) return "";

    return (amount * exchangeRate).toPrecision(15).replace(/\.?0+$/, "");
  }, [fromAmount, exchangeRate]);

  return { exchangeRate, toAmountDisplay };
}
