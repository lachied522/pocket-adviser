"use client";
import { useMemo } from "react";

import { CircleHelp, RefreshCw } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import StockDialog from "@/components/stocks/stock-dialog";
import UtilityDialog from "@/components/dialogs/utility-dialog";

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/app/(main)/(chat)/components/context";

interface RecommendationsTableProps {
    transactions: {
        stockId: number
        direction: "Buy" | "Sell"
        symbol: string
        name: string
        units: number
        price: number
        value: number
    }[]
}

export default function RecommendationsTable({ transactions }: RecommendationsTableProps) {
    const { state } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;

    const total = useMemo(() => {
        return transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [transactions]);

    return (
        <div className='max-w-[calc(90vw-10px)] sm:max-w-none w-full'>
            <div className='w-full rounded-md border'>
                <Table className=''>
                    <TableHeader>
                        <TableRow className='bg-slate-50'>
                            <TableHead className='text-xs md:text-base sm:pl-3.5 py-3.5 font-medium'>
                                Transaction
                            </TableHead>
                            <TableHead className='text-xs md:text-base py-3.5 font-medium'>
                                Symbol
                            </TableHead>
                            <TableHead className='text-xs md:text-base py-3.5 font-medium'>
                                Units
                            </TableHead>
                            <TableHead className='text-xs md:text-base py-3.5 font-medium'>
                                Price
                            </TableHead>
                            <TableHead className='text-xs md:text-base py-3.5 font-medium'>
                                Value
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0? (
                        <>
                            {transactions.map((transaction) => (
                            <StockDialog key={`recommendation-${transaction.stockId}`} symbol={transaction.symbol} name={transaction.name}>
                                <TableRow className='cursor-pointer'>
                                    <TableCell className='text-sm md:text-lg font-semibold sm:pl-3.5 py-3.5'>
                                        {transaction.units > 0? "📈  Buy": "📉  Sell"}
                                    </TableCell>
                                    <TableCell className='text-sm md:text-lg font-medium py-3.5'>
                                        {transaction.symbol}
                                    </TableCell>
                                    <TableCell className='text-sm md:text-lg font-medium py-3.5'>
                                        {transaction.units}
                                    </TableCell>
                                    <TableCell className='text-sm md:text-lg font-medium py-3.5'>
                                        {formatDollar(transaction.price)}
                                    </TableCell>
                                    <TableCell className='text-sm md:text-lg font-medium py-3.5'>
                                        {formatDollar(transaction.price * transaction.units)}
                                    </TableCell>
                                </TableRow>
                            </StockDialog>
                            ))}
                            <TableRow>
                                <TableCell colSpan={4} className='sm:pl-3.5 py-3.5'>
                                    <div className='text-sm md:text-lg font-medium ml-5'>
                                        Total
                                    </div>
                                </TableCell>
                                <TableCell colSpan={1} className='py-3.5'>
                                    <div className='text-sm md:text-lg font-medium'>
                                        {formatDollar(total)}
                                    </div>
                                </TableCell>
                            </TableRow>
                        </>
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className='p-12'>
                                <div className='w-full flex items-center justify-center text-center text-lg font-medium'>
                                    You have no recommendations at this time.
                                </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {transactions.length > 0 && (
            <div className='w-full flex flex-col sm:flex-row items-end sm:items-center justify-between p-3.5 pr-0 gap-2'>
                <div className='grid grid-cols-[1fr_60px] place-items-end gap-x-2 gap-y-1 shrink-0'>
                    {/* <div className='flex flex-row items-center gap-2'>
                        <UtilityDialog>
                            <CircleHelp size={18} color='black' />
                        </UtilityDialog>
                        <span className='text-sm md:text-base'>Utility before</span>
                    </div>
                    <div className='text-sm md:text-base'>
                        {initialAdjUtility?.toFixed(2) || 'N/A'}
                    </div>
                    <div className='text-sm md:text-base'>
                        Utility after
                    </div>
                    <div className='text-sm md:text-base'>
                        {finalAdjUtility?.toFixed(2) || 'N/A'}
                    </div> */}
                </div>

                {/* <div className='w-full flex flex-row justify-end'>
                    <Button
                        variant='default'
                        onClick={() => {
                            // regenerating transactions will have no effect if not signed in
                            // we will prompt user to signup
                            state? onSubmit("Can you give me some more ideas?", "getRecommendations"): openSignup();
                        }}
                        className='flex flex-row items-center gap-2 text-xs px-2 py-3 md:px-4 md:text-base shadow-none'
                    >
                        <RefreshCw size={16} />
                        Regenerate
                    </Button>
                </div> */}
            </div>
            )}
        </div>
    )
}