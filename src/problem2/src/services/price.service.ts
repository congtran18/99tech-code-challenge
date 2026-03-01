import axios from "axios";
import type { Token, TokenPriceApi } from "../types/token.types";
import { TokenPriceApiSchema } from "../types/token.types";
import { getTokenIconUrl } from "../utils/format";

const PRICES_URL = "https://interview.switcheo.com/prices.json";

export const fetchTokens = async (
  signal?: AbortSignal,
): Promise<readonly Token[]> => {
  const { data: raw } = await axios.get<unknown[]>(PRICES_URL, { signal });

  if (!Array.isArray(raw)) {
    throw new Error("Unexpected API response format");
  }

  const validEntries = raw.reduce<TokenPriceApi[]>((acc, item) => {
    const result = TokenPriceApiSchema.safeParse(item);
    if (result.success) acc.push(result.data);
    return acc;
  }, []);

  // Keep only the most recent price per currency
  const latestBySymbol = new Map<string, TokenPriceApi>();
  for (const entry of validEntries) {
    const existing = latestBySymbol.get(entry.currency);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latestBySymbol.set(entry.currency, entry);
    }
  }

  return Array.from(latestBySymbol.values())
    .map(({ currency, price }) => ({
      currency,
      price,
      iconUrl: getTokenIconUrl(currency),
    }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
};
