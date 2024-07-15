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
import StockModal from "@/components/stocks/stock-modal";
import UtilityDialog from "@/components/modals/utility-dialog";

import { formatDollar } from "@/utils/formatting";

import { type ChatState, useChatContext } from "@/context/ChatContext";

import type { Recommendation } from "@/types/helpers";

interface RecommendationsTableProps {
    data: {
        transactions: Recommendation[]
        initialAdjUtility?: number|null
        finalAdjUtility?: number|null
    }
}

export default function RecommendationsTable({ data }: RecommendationsTableProps) {
    const { onSubmit } = useChatContext() as ChatState;

    const total = useMemo(() => {
        return data.transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [data.transactions]);

    return (
        <>
            <div className='w-full shrink-0 rounded-md border'>
                <Table className=''>
                    <TableHeader>
                        <TableRow className='bg-slate-50'>
                            <TableHead className='p-3.5 font-medium'>
                                Transaction
                            </TableHead>
                            <TableHead className='py-3.5 font-medium'>
                                Symbol
                            </TableHead>
                            {/* <TableHead className='py-3.5 font-medium'>
                                Name
                            </TableHead> */}
                            <TableHead className='py-3.5 font-medium'>
                                Units
                            </TableHead>
                            <TableHead className='py-3.5 font-medium'>
                                Price
                            </TableHead>
                            <TableHead className='py-3.5 font-medium'>
                                Value
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.transactions.length > 0? (
                        <>
                            {data.transactions.map((obj) => (
                            <StockModal key={`recommendation-${obj.stockId}`} stockId={obj.stockId}>
                                <TableRow className='cursor-pointer'>
                                    <TableCell className='text-lg font-semibold p-3.5'>
                                        {obj.units > 0? "📈  Buy": "📉  Sell"}
                                    </TableCell>
                                    <TableCell className='text-lg font-medium py-3.5'>
                                        {obj.symbol}
                                    </TableCell>
                                    {/* <TableCell className='text-lg font-medium py-3.5'>
                                        {obj.name}
                                    </TableCell> */}
                                    <TableCell className='text-lg font-medium py-3.5'>
                                        {obj.units}
                                    </TableCell>
                                    <TableCell className='text-lg font-medium py-3.5'>
                                        {formatDollar(obj.price)}
                                    </TableCell>
                                    <TableCell className='text-lg font-medium py-3.5'>
                                        {formatDollar(obj.price * obj.units)}
                                    </TableCell>
                                </TableRow>
                            </StockModal>
                            ))}
                            <TableRow>
                                <TableCell colSpan={4} className='p-3.5'>
                                    <div className='text-lg font-medium ml-6'>
                                        Total
                                    </div>
                                </TableCell>
                                <TableCell colSpan={1} className='p-y-3.5'>
                                    <div className='text-lg font-medium'>
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
            {data && data.transactions.length > 0 && (
            <div className='w-full flex flex-row items-center justify-between p-3.5 pr-0'>
                <div className='grid grid-cols-2 place-items-end gap-x-2 gap-y-1 shrink-0'>
                    <div className='flex flex-row items-center gap-2'>
                        <UtilityDialog>
                            <CircleHelp size={18} color='black' />
                        </UtilityDialog>
                        <span>Utility before</span>
                    </div>
                    <div className='justify-self-start'>
                        {data.initialAdjUtility?.toFixed(2) || 'N/A'}
                    </div>
                    <div>
                        Utility after
                    </div>
                    <div className='justify-self-start'>
                        {data.finalAdjUtility?.toFixed(2) || 'N/A'}
                    </div>
                </div>

                <div className='w-full flex flex-row justify-end'>
                    <Button
                        variant='default'
                        onClick={() => onSubmit("Can you give me some more ideas?", "getRecommendations")}
                        className='flex flex-row items-center gap-2 shadow-none'
                    >
                        <RefreshCw size={16} />
                        Regenerate
                    </Button>
                </div>
            </div>
            )}
        </>
    )
}