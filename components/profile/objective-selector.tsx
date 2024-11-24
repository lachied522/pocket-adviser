import { TrendingUp, HandCoins, Vault, Home, Baby, CandlestickChart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/components/utils";

const OBJECTIVE_MAP = {
    RETIREMENT: {
        name: "📈 Long-term Savings",
        text: "Accumulate capital over the long term",
        timeHorizon: "20-30 years",
        Icon: TrendingUp
    },
    INCOME: {
        name: "💰 Passive Income",
        text: "Earn passive income to support your lifestyle",
        timeHorizon: "Indefinite",
        Icon: HandCoins
    },
    PRESERVATION: {
        name: "🏦 Capital Preservation",
        text: "Protect your hard-earned capital in safer investments",
        timeHorizon: "1-3 years",
        Icon: Vault
    },
    DEPOSIT: {
        name: "🌴 Upcoming Expense",
        text: "Save for an upcoming expense, like a holiday or home deposit",
        timeHorizon: "3-4 years",
        Icon: Home
    },
    CHILDREN: {
        name: "🧒 Children",
        text: "Provide for your children in 10-20 year's time",
        timeHorizon: "10-20 years",
        Icon: Baby
    },
    TRADING: {
        name: "🚀 Trading",
        text: "Trade to profit in the short-term",
        timeHorizon: "< 3 months",
        Icon: CandlestickChart
    }
}

interface ObjectiveSelectorProps {
    value: string
    onChange: (event: any) => void
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
    return (
        <div className='md:max-w-[1000px] flex flex-wrap gap-2 items-stretch justify-center px-2 py-6 mx-auto'>
            {Object.entries(OBJECTIVE_MAP).map(([objective, props], index) => (
            <Card
                key={`objective-card-${index}`}
                onClick={() => onChange(objective)}
                className={cn(
                    'h-[120px] md:h-[140px] w-[220px] md:w-[250px] flex flex-col items-center justify-between p-3.5 md:p-5 cursor-pointer hover:bg-zinc-50',
                    value === objective && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100'
                )}
            >
                <div className="flex flex-row items-start gap-1 md:gap-3.5">
                    {/* <props.Icon size={22} /> */}
                    <h6 className="text-sm xs:text-lg font-medium text-center">{props.name}</h6>
                </div>

                <div className="text-xs md:text-sm text-center text-zinc-700 line-clamp-2 mb-1">
                    {props.text}
                </div>

                <div className="text-xs">Time Horizon {props.timeHorizon}</div>
            </Card>
            ))}
        </div>
    );
}