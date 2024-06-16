import { TrendingUp, HandCoins, Vault, Home, Baby, CandlestickChart } from "lucide-react";


import { Card } from "@/components/ui/card";
import { cn } from "@/components/utils";

const OBJECTIVE_ARRAY = [
    {
        value: "RETIREMENT",
        name: "Long-term Savings",
        text: "Accumulate capital over the long term",
        timeHorizon: "20-30 years",
        Icon: TrendingUp
    },
    {
        value: "INCOME",
        name: "Passive Income",
        text: "Earn passive income to support your lifestyle",
        timeHorizon: "Indefinite",
        Icon: HandCoins
    },
    {
        value: "PRESERVATION",
        name: "Capital Preservation",
        text: "Protect your hard-earned capital in a safe investments",
        timeHorizon: "1-3 years",
        Icon: Vault
    },
    {
        value: "FIRSTHOME",
        name: "First Home",
        text: "Save for a deposit on your first home",
        timeHorizon: "4-5 years",
        Icon: Home
    },
    {
        value: "CHILDREN",
        name: "Children",
        text: "Provide for your children in 10-20 year's time",
        timeHorizon: "10-20 years",
        Icon: Baby
    },
    {
        value: "TRADING",
        name: "Trading",
        text: "Take advantage of opportunities to profit in the short-term",
        timeHorizon: "< 3 months",
        Icon: CandlestickChart
    }
];
  
interface ObjectiveSelectorProps {
    value: string
    onChange: (event: any) => void
}

export default function ObjectiveSelector({ value, onChange }: ObjectiveSelectorProps) {
    return (
        <div className='flex flex-wrap gap-2 items-stretch justify-center p-2'>
            {OBJECTIVE_ARRAY.map((obj, index) => (
            <Card
                key={`objective-card-${index}`}
                onClick={() => onChange(obj.value)}
                className={cn(
                    'w-[250px] h-[140px] flex flex-col items-center justify-between p-5 cursor-pointer hover:bg-blue-50',
                    value === obj.value && 'bg-blue-100 border-blue-200 hover:bg-blue-100'
                )}
            >
                <div className="flex flex-row items-start gap-3.5">
                    <obj.Icon size={24} />

                    <h6 className="text-center">{obj.name}</h6>
                </div>

                <div className="text-sm text-center text-slate-700 mb-1">
                    {obj.text}
                </div>

                <div className="text-xs">Time Horizon {obj.timeHorizon}</div>
            </Card>
            ))}
        </div>
    );
}