import Image from "next/image";

import StockDialog from "@/components/stocks/stock-dialog";
import ChangeIndicator from "@/components/stocks/change-indicator";

function TapeItemLessModal({ data }: { data: any }) {
    return (
        <div className='flex flex-row items-center justify-between gap-1 md:gap-2 rounded-lg px-1.5 md:px-3 py-1.5'>            
            <div className='h-3 md:h-3.5 w-3 md:w-3.5 relative'>
                <Image
                    src={data.exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                    alt='flag'
                    sizes='14px'
                    fill
                />
            </div>

            <span className='text-sm md:text-sm font-medium text-neutral-800'>
                {data.symbol.endsWith('.AX')? data.symbol.split('.')[0]: data.symbol}
            </span>

            <ChangeIndicator change={data.changesPercentage} size='sm' />
        </div>
    )
}

interface TapeItemProps {
    data: any
    clickable?: boolean
}

export default function TapeItem({ data, clickable = false }: TapeItemProps) {
    return (
        <>
            {clickable ? (
            <StockDialog initialStockData={data}>
                <button className='shrink-0 hover:scale-[1.05]'>
                    <TapeItemLessModal data={data} />
                </button>
            </StockDialog>
            ) : (
            <div className='shrink-0'>
                <TapeItemLessModal data={data} />            
            </div>
            )}
        </>
    )
}