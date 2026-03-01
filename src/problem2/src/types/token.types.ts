import z from "zod";

export const TokenPriceApiSchema = z.object({
  currency: z.string(),
  date: z.string(),
  price: z.number().positive(),
});

export type TokenPriceApi = z.infer<typeof TokenPriceApiSchema>;

export interface Token {
  readonly currency: string;
  readonly price: number;
  readonly iconUrl: string;
}

export type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: readonly Token[] }
  | { status: "error"; message: string };

export type SwapState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success" }
  | { status: "error"; message: string };

export const SwapFormSchema = z
  .object({
    fromCurrency: z.string().min(1, "Please select a source token"),
    toCurrency: z.string().min(1, "Please select a destination token"),
    fromAmount: z
      .string()
      .min(1, "Amount is required")
      .refine((v) => !isNaN(Number(v)) && Number(v) > 0, {
        message: "Amount must be a positive number",
      }),
  })
  .refine((d) => d.fromCurrency !== d.toCurrency, {
    message: "Must be a different token",
    path: ["toCurrency"],
  });

export type SwapFormValues = z.infer<typeof SwapFormSchema>;
export type SwapFormErrors = Partial<Record<keyof SwapFormValues, string>>;
