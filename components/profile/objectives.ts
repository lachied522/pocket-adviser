import { TrendingUp, HandCoins, Vault, Home, Baby, CandlestickChart } from "lucide-react";

export const OBJECTIVE_MAP = {
    RETIREMENT: {
        name: "Long-term Savings",
        text: "Accumulate capital over the long term",
        timeHorizon: "20-30 years",
        Icon: TrendingUp
    },
    INCOME: {
        name: "Passive Income",
        text: "Earn passive income to support your lifestyle",
        timeHorizon: "Indefinite",
        Icon: HandCoins
    },
    PRESERVATION: {
        name: "Capital Preservation",
        text: "Protect your hard-earned capital in a safe investments",
        timeHorizon: "1-3 years",
        Icon: Vault
    },
    DEPOSIT: {
        name: "Upcoming Expense",
        text: "Save for an upcoming expense, like a holiday or home deposit",
        timeHorizon: "3-4 years",
        Icon: Home
    },
    CHILDREN: {
        name: "Children",
        text: "Provide for your children in 10-20 year's time",
        timeHorizon: "10-20 years",
        Icon: Baby
    },
    TRADING: {
        name: "Trading",
        text: "Take advantage of opportunities to profit in the short-term",
        timeHorizon: "< 3 months",
        Icon: CandlestickChart
    }
}