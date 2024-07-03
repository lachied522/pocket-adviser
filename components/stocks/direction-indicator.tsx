import { cn } from "@/components/utils";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface DirectionIndicatorProps {
    change: number|null
    size?: 'sm'|'md'|'lg'
}

export default function DirectionIndicator({ change, size = 'md' }: DirectionIndicatorProps) {

    return (
        <div className='flex flex-row items-center gap-1'>
            <span
                className={cn(
                    'text-black',
                    change && change > 0 && 'text-green-400',
                    change && change < 0 && 'text-red-400'
                )}
            >
                {change?.toFixed(2)}%
            </span>
            {!change? (
            <Minus color='gray' size={size === 'sm'? 20: 24} />
            ) : change > 0? (
            <TrendingUp color='rgb(74 222 128)' size={size === 'sm'? 20: 24} />
            ) :  (
            <TrendingDown color='rgb(248 113 113)' size={size === 'sm'? 20: 24} />
            )}
        </div>
    )
}