import Image from "next/image";

import StockModal from "@/components/stocks/stock-modal";
import ChangeIndicator from "@/components/stocks/change-indicator";

function TapeItemLessModal({ data }: { data: any }) {
    return (
        <div className='md:w-[180px] flex flex-row items-center justify-center gap-2 bg-slate-50/20 rounded-lg px-1.5 md:px-0 py-1.5'>
            <span className='text-sm md:text-base'>
                {data.symbol.endsWith('.AX')? data.symbol.split('.')[0]: data.symbol}
            </span>
            <Image
                src={data.exchange=="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
                alt='flag'
                height={16}
                width={16}
            />
            <div className=''>
                <ChangeIndicator change={data.changesPercentage} size='sm' />
            </div>
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
            <StockModal initialStockData={data}>
                <button className='shrink-0 hover:scale-[1.05]'>
                    <TapeItemLessModal data={data} />
                </button>
            </StockModal>
            ) : (
            <div className='shrink-0'>
                <TapeItemLessModal data={data} />            
            </div>
            )}
        </>
    )
}