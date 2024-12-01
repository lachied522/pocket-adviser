import { cn } from "@/components/utils";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface ChangeIndicatorProps {
    change: string | number | null
    withIcon?: boolean
    size?: 'sm'|'md'|'lg'
}

export default function ChangeIndicator({
    change,
    withIcon = true,
    size = 'md'
}: ChangeIndicatorProps) {
    const value = typeof change === "string"? parseFloat(change.replace('%', '')): change ?? 0;
    return (
        <div className='flex flex-row items-center gap-1'>
            {withIcon && (
            <div className=''>
                {!change? (
                <Minus color='gray' size={size === 'sm'? 18: 24} />
                ) : value > 0 ? (
                <TrendingUp color='rgb(74 222 128)' size={size === 'sm'? 18: 24} />
                ) :  (
                <TrendingDown color='rgb(248 113 113)' size={size === 'sm'? 18: 24} />
                )}
            </div>
            )}

            <span
                className={cn(
                    'text-black text-lg font-medium',
                    size === 'sm' && 'text-xs md:text-sm',
                    change && value > 0 && 'text-green-400',
                    change && value < 0 && 'text-red-400'
                )}
            >
                {!withIcon && value > 0 && <>+</>}
                {value.toFixed(2)}%
            </span>
        </div>
    )
}