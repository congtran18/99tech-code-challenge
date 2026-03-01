import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchTokens } from "../services/price.service";
import { SwapFormSchema } from "../types/token.types";
import type {
  Token,
  FetchState,
  SwapState,
  SwapFormValues,
  SwapFormErrors,
} from "../types/token.types";

interface UseCurrencySwapReturn {
  readonly fetchState: FetchState;
  readonly swapState: SwapState;
  readonly fromCurrency: string;
  readonly toCurrency: string;
  readonly fromAmount: string;
  readonly toAmount: string;
  readonly errors: SwapFormErrors;
  readonly handleFromCurrencyChange: (currency: string) => void;
  readonly handleToCurrencyChange: (currency: string) => void;
  readonly handleFromAmountChange: (amount: string) => void;
  readonly handleSwap: () => void;
  readonly handleSubmit: () => Promise<void>;
  readonly dismissSwapResult: () => void;
}

export const useCurrencySwap = (): UseCurrencySwapReturn => {
  const [fetchState, setFetchState] = useState<FetchState>({ status: "idle" });
  const [swapState, setSwapState] = useState<SwapState>({ status: "idle" });

  const [fromCurrency, setFromCurrency] = useState<string>("");
  const [toCurrency, setToCurrency] = useState<string>("");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [errors, setErrors] = useState<SwapFormErrors>({});

  useEffect(() => {
    setFetchState({ status: "loading" });
    fetchTokens()
      .then((tokens) => setFetchState({ status: "success", data: tokens }))
      .catch(() =>
        setFetchState({
          status: "error",
          message: "Unable to load token prices.",
        }),
      );
  }, []);

  const priceMap = useMemo<ReadonlyMap<string, number>>(() => {
    if (fetchState.status !== "success") return new Map();
    return new Map(fetchState.data.map((t) => [t.currency, t.price]));
  }, [fetchState]);

  const toAmount = useMemo<string>(() => {
    const amount = Number(fromAmount);
    if (!fromAmount || isNaN(amount) || amount <= 0) return "";
    if (!fromCurrency || !toCurrency) return "";

    const fromPrice = priceMap.get(fromCurrency);
    const toPrice = priceMap.get(toCurrency);
    if (!fromPrice || !toPrice) return "";

    return String((amount * fromPrice) / toPrice);
  }, [fromAmount, fromCurrency, toCurrency, priceMap]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleFromCurrencyChange = useCallback((currency: string) => {
    setFromCurrency(currency);
    setErrors((prev) => ({ ...prev, fromCurrency: undefined }));
  }, []);

  const handleToCurrencyChange = useCallback((currency: string) => {
    setToCurrency(currency);
    setErrors((prev) => ({ ...prev, toCurrency: undefined }));
  }, []);

  const handleFromAmountChange = useCallback((amount: string) => {
    const sanitised = amount.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
    setFromAmount(sanitised);
    setErrors((prev) => ({ ...prev, fromAmount: undefined }));
  }, []);

  const handleSwap = useCallback(() => {
    const currentFrom = fromCurrency;
    const currentTo = toCurrency;
    const currentToAmount = toAmount;

    setFromCurrency(currentTo);
    setToCurrency(currentFrom);
    setFromAmount(currentToAmount);
    setErrors({});
  }, [fromCurrency, toCurrency, toAmount]);

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

    if (fromCurrency === toCurrency) {
      setErrors({ toCurrency: "Must be a different token" });
      return;
    }

    setSwapState({ status: "loading" });
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    setSwapState({ status: "success" });
    setFromAmount("");
    setErrors({});
  }, [fromCurrency, toCurrency, fromAmount, toAmount]);

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
    toAmount,
    errors,
    handleFromCurrencyChange,
    handleToCurrencyChange,
    handleFromAmountChange,
    handleSwap,
    handleSubmit,
    dismissSwapResult,
  };
};

export type { Token };
