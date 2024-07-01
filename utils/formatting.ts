import { format } from "date-fns";

const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatDollar(value: number|null) {
    if (typeof value !== "number") {
        return 'N/A';
    }
    return USDollar.format(value);
}

export function formatPercent(value: number|null) {
    if (typeof value !== "number") {
        return 'N/A';
    }
    return `${value.toFixed(2)}%`;
}

export function formatMarketCap(marketCap: bigint|number|null) {
    if (!marketCap) return 'N/A';

    marketCap = Number(marketCap); // convert to Number type
    const trillion = 1e12;
    const billion = 1e9;
    const million = 1e6;

    if (Math.abs(marketCap) >= trillion) {
      return `$${(marketCap / trillion).toFixed(2)}T`;
    } else if (Math.abs(marketCap) >= billion) {
      return `$${(marketCap / billion).toFixed(2)}B`;
    } else if (Math.abs(marketCap) >= million) {
      return `$${(marketCap / million).toFixed(2)}M`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
}

export function formatDate(date: Date) {
  return format(date, "PPPP");
}