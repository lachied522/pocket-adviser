"use client";
import { useMemo } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StockModal from "@/components/stocks/stock-modal";

import { formatDollar } from "@/utils/formatting";

import type { Recommendation } from "@/types/helpers";

interface RecommendationsTableProps {
    data: {
        transactions: Recommendation[]
        initial_adj_utility: number
        final_adj_utility: number
    }
}

export default function RecommendationsTable({ data }: RecommendationsTableProps) {
    const total = useMemo(() => {
        return data.transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [data]);

    return (
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
                    {data && data.transactions.length > 0? (
                    <>
                        {data.transactions.map((obj) => (
                        <StockModal key={`recommendation-${obj.stockId}`} stockId={obj.stockId}>
                            <TableRow className='cursor-pointer'>
                                <TableCell className='text-lg font-semibold p-3.5'>
                                    {obj.units > 0? "✨ Buy": "🤑 Sell"}
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
                            <TableCell colSpan={6} className='w-full flex flex-col items-end p-6'>
                                <div>
                                    Utility before: {data.initial_adj_utility.toFixed(2)}
                                </div>
                                <div>
                                    Utility after: {data.final_adj_utility.toFixed(2)}
                                </div>
                                <div className='text-lg font-medium'>
                                    Total: {formatDollar(total)}
                                </div>
                            </TableCell>
                        </TableRow>
                    </>
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className='p-6'>
                            <div className='w-full flex items-center justify-center text-center'>
                                No recommendations.
                            </div>
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}