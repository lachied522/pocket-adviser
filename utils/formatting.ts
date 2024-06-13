

const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatDollar(value: number) {
    return USDollar.format(value);
}

export function formatPercent(value: number) {
    return `${value.toFixed(2)}%`;
}