import { cn } from "@/components/utils";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

interface ChangeIndicatorProps {
    change: number|null
    withIcon?: boolean
    size?: 'sm'|'md'|'lg'
}

export default function ChangeIndicator({ change, withIcon = true, size = 'md' }: ChangeIndicatorProps) {

    return (
        <div className='flex flex-row items-center gap-1'>
            {withIcon && (
            <div className=''>
                {!change? (
                <Minus color='gray' size={size === 'sm'? 18: 24} />
                ) : change > 0? (
                <TrendingUp color='rgb(74 222 128)' size={size === 'sm'? 18: 24} />
                ) :  (
                <TrendingDown color='rgb(248 113 113)' size={size === 'sm'? 18: 24} />
                )}
            </div>
            )}

            <span
                className={cn(
                    'text-black text-lg font-medium',
                    size === 'sm' && 'text-xs md:text-base',
                    change && change > 0 && 'text-green-400',
                    change && change < 0 && 'text-red-400'
                )}
            >
                {!withIcon && change && change > 0 && <>+</>}
                {change?.toFixed(2)}%
            </span>
        </div>
    )
}