import { useState, useEffect, useCallback } from "react";
import { SwapFormSchema } from "../types/token.types";
import type {
  SwapState,
  SwapFormValues,
  SwapFormErrors,
} from "../types/token.types";
import { useTokenPrices } from "./useTokenPrices";
import { useSwapCalculation } from "./useSwapCalculation";
import type { FetchState } from "../types/token.types";

interface UseCurrencySwapReturn {
  readonly fetchState: FetchState;
  readonly swapState: SwapState;
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly fromAmount: string;
  readonly toAmount: string;
  readonly exchangeRate: number | null;

  readonly errors: SwapFormErrors;
  readonly handleFromCurrencyChange: (currency: string) => void;
  readonly handleToCurrencyChange: (currency: string) => void;
  readonly handleFromAmountChange: (amount: string) => void;
  readonly handleSwap: () => void;
  readonly handleSubmit: () => Promise<void>;
  readonly handleRetry: () => void;
  readonly dismissSwapResult: () => void;
}

export function useCurrencySwap(): UseCurrencySwapReturn {
  const { fetchState, priceMap, retry } = useTokenPrices();

  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [fromAmount, setFromAmount] = useState("");
  const [errors, setErrors] = useState<SwapFormErrors>({});
  const [swapState, setSwapState] = useState<SwapState>({ status: "idle" });

  const { exchangeRate, toAmountDisplay } = useSwapCalculation({
    fromCurrency,
    toCurrency,
    fromAmount,
    priceMap,
  });

  const handleFromCurrencyChange = useCallback((currency: string) => {
    setFromCurrency(currency);
    setErrors((prev) => ({ ...prev, fromCurrency: undefined }));
  }, []);

  const handleToCurrencyChange = useCallback((currency: string) => {
    setToCurrency(currency);
    setErrors((prev) => ({ ...prev, toCurrency: undefined }));
  }, []);

  const handleFromAmountChange = useCallback((amount: string) => {
    const sanitised = amount
      .replace(/[^0-9.]/g, "")
      .replace(/^\./, "")
      .replace(/(\..*)\./g, "$1");
    setFromAmount(sanitised);
    setErrors((prev) => ({ ...prev, fromAmount: undefined }));
  }, []);

  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmountDisplay);
    setErrors({});
  }, [fromCurrency, toCurrency, toAmountDisplay]);

  const handleSubmit = useCallback(async () => {
    const validation = SwapFormSchema.safeParse({
      fromCurrency,
      toCurrency,
      fromAmount,
    });

    if (!validation.success) {
      const fieldErrors: SwapFormErrors = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof SwapFormValues;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSwapState({ status: "loading" });
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      setSwapState({ status: "success" });
      setFromAmount("");
      setErrors({});
    } catch {
      setSwapState({
        status: "error",
        message: "Swap failed. Please try again.",
      });
    }
  }, [fromCurrency, toCurrency, fromAmount]);

  const handleRetry = retry;

  const dismissSwapResult = useCallback(() => {
    setSwapState({ status: "idle" });
  }, []);

  useEffect(() => {
    if (swapState.status === "success") {
      const timer = setTimeout(dismissSwapResult, 5000);
      return () => clearTimeout(timer);
    }
  }, [swapState.status, dismissSwapResult]);

  return {
    fetchState,
    swapState,
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount: toAmountDisplay,
    exchangeRate,
    errors,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleFromAmountChange,
    handleSwap,
    handleSubmit,
    handleRetry,
    dismissSwapResult,
  };
}

export type { FetchState };
