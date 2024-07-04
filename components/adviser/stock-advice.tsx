import { CircleHelp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import StockCard from "@/components/stocks/stock-card";
import UtilityDialog from "@/components/modals/utility-dialog";

import type { Stock } from "@prisma/client";

interface StockAdviceProps {
    data: {
        stockData: Stock
        proposed_transaction: string
        is_recommended: boolean
        is_recommended_by_sector_allocation: boolean
        is_recommended_by_risk: boolean
        is_recommended_by_income: boolean
        is_analyst_recommended: boolean
        is_utility_positive: boolean
        initial_adj_utility: string
        final_adj_utility: string
    }
}

export default function StockAdvice({ data }: StockAdviceProps) {
    return (
        <>
            <StockCard stockData={data.stockData} />
            <Card>
                <CardContent className="flex flex-col gap-3.5 px-3 py-2">
                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Proposed Transaction</span>
                        <span>{data.proposed_transaction}</span>
                    </div>

                    <div>The proposed transaction is <b>{`${data.is_recommended? ' ': 'not '}recommended.`}</b> The following factors were considered in drawing this conclusion:</div>

                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Sector Allocation</span>
                        <span>{`The proposed is ${data.is_recommended_by_sector_allocation? 'within': 'outside'} the recommended sector allocation for your objective.`}</span>
                    </div>

                    {(typeof data.stockData.dividendYield === "number") && (
                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Dividend Yield</span>
                        <span>{`${data.stockData.symbol.toUpperCase()}'s dividend yield appears to be ${data.is_recommended_by_income? 'appropriate': 'either too high or too low'} for your objective.`}</span>
                    </div>
                    )}

                    {data.stockData.beta && (
                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Risk (beta)</span>
                        <span>{`${data.stockData.symbol.toUpperCase()}'s risk appears to be ${data.is_recommended_by_risk? 'appropriate': 'either too high or too low'} for your objective.`}</span>
                    </div>
                    )}

                    {data.stockData.priceTarget && data.stockData.previousClose && (
                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Analyst Research</span>
                        <span>{`Analyst's have a price target of $${data.stockData.priceTarget.toFixed(2)}, which implies a ${(100 * data.stockData.priceTarget / data.stockData.previousClose).toFixed(2)}% return.`}</span>
                    </div>
                    )}

                    <div className='grid grid-cols-2 md:grid-cols-[240px_1fr] items-start gap-2'>
                        <span className='md:text-lg font-medium'>Utility</span>
                        <span>{`The proposed transaction ${data.is_utility_positive? 'increases': 'decreases'} the utility of your portfolio.`}</span>
                    </div>

                    <div className='grid grid-cols-[24px_208px_1fr] gap-x-2 gap-y-1 shrink-0'>
                        <UtilityDialog>
                            <CircleHelp size={18} color='black' />
                        </UtilityDialog>
                        <span>Utility before</span>
                        <div>{parseFloat(data.initial_adj_utility).toFixed(2)}</div>
                        <div className='h-[18px]' />
                        <span>Utility after</span>
                        <div>{parseFloat(data.final_adj_utility).toFixed(2)}</div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}