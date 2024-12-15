import StockChart from "./stock-chart";

import type { CompanyOutlook } from "@/utils/financial_modelling_prep/types";

interface OverviewTabProps {
    stockData: CompanyOutlook
}

export default function OverviewTab({ stockData }: OverviewTabProps) {

    return (
        <div className='flex flex-col gap-6 pt-6'>
            <div className='h-[360px] md:h-[520px]'>
                <StockChart symbol={stockData.profile.symbol} exchange={stockData.profile.exchangeShortName} />
            </div>

            <p className='text-sm sm:text-base'>
                {stockData.profile.description ?? 'Company information not available'}
            </p>
        </div>
    )
}