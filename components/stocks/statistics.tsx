import { formatPercent } from "@/utils/formatting";

import type { CompanyOutlook, IncomeStatement } from "@/utils/financial_modelling_prep/types";

function calculateGrowth(
    income: IncomeStatement[], // this is automatically sorted by descending date
    key: "eps" | "revenue"
) {
    if (income.length > 1) {
        return 100 * ((income[0][key] / income[income.length - 1][key]) - 1);
    }
    return null;
}

export default function Statistics({ stockData }: { stockData: CompanyOutlook }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 pt-6 px-3'>
            <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-6'>
                    <h6 className='text-lg font-medium'>Dividends</h6>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Dividend Amount (TTM)</span>
                        <span>{stockData.ratios[0].dividendPerShareTTM.toFixed(2)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Dividend Yield (TTM)</span>
                        <span>{formatPercent(stockData.ratios[0].dividendYielPercentageTTM)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>
                        <span className='font-medium'>Payout Ratio</span>
                        <span>{formatPercent(stockData.ratios[0].payoutRatioTTM)}</span>
                    </div>
                </div>

                <div className='flex flex-col gap-6'>
                    <h6 className='text-lg font-medium'>Valuation</h6>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Price to Earnings (PE) Ratio</span>
                        <span>{stockData.ratios[0].peRatioTTM.toFixed(2)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Price to Sales (PS) Ratio </span>
                        <span>{stockData.ratios[0].priceToSalesRatioTTM.toFixed(2)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Price to Book (PB) Ratio </span>
                        <span>{stockData.ratios[0].priceToBookRatioTTM.toFixed(2)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Price to Free Cash Flow (PFCF) Ratio </span>
                        <span>{stockData.ratios[0].priceToFreeCashFlowsRatioTTM.toFixed(2)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>
                        <span className='font-medium'>Price to Earnings Growth (PEG) Ratio </span>
                        <span>{stockData.ratios[0].pegRatioTTM.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className='flex flex-col gap-6'>
                <div className='flex flex-col gap-6'>
                    <h6 className='text-lg font-medium'>Profitability</h6>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Profit Margin</span>
                        <span>{formatPercent(100 * stockData.ratios[0].netProfitMarginTTM)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Gross Margin</span>
                        <span>{formatPercent(100 * stockData.ratios[0].grossProfitMarginTTM)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Return on Equity</span>
                        <span>{formatPercent(100 * stockData.ratios[0].returnOnEquityTTM)}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>
                        <span className='font-medium'>Return on Assets</span>
                        <span>{formatPercent(100 * stockData.ratios[0].returnOnAssetsTTM)}</span>
                    </div>
                </div>

                <div className='flex flex-col gap-6'>
                    <h6 className='text-lg font-medium'>Finances</h6>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Debt to Equity Ratio</span>
                        <span>{stockData.ratios[0].debtEquityRatioTTM.toFixed(2)}</span>
                    </div>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Current Ratio</span>
                        <span>{stockData.ratios[0].currentRatioTTM.toFixed(2)}</span>
                    </div>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>
                        <span className='font-medium'>Cash Ratio</span>
                        <span>{stockData.ratios[0].cashRatioTTM.toFixed(2)}</span>
                    </div>
                </div>

                <div className='flex flex-col gap-6'>
                    <h6 className='text-lg font-medium'>Growth</h6>
                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>                        
                        <span className='font-medium'>Earnings Per Share Growth (5Y)</span>
                        <span>{formatPercent(calculateGrowth(stockData.financialsAnnual.income, "eps"))}</span>
                    </div>

                    <div className='flex flex-row justify-between pb-2 border-b border-zinc-200'>
                        <span className='font-medium'>Revenue Growth (5Y)</span>
                        <span>{formatPercent(calculateGrowth(stockData.financialsAnnual.income, "revenue"))}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}