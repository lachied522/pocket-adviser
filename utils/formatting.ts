

const USDollar = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

export function formatDollar(value: number|null) {
    if (!value) {
        return 'N/A';
    }
    return USDollar.format(value);
}

export function formatPercent(value: number|null) {
    if (!value) {
        return 'N/A';
    }
    return `${value.toFixed(2)}%`;
}