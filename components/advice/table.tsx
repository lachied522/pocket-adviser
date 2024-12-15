"use client";
import { useMemo } from "react";

import { formatDollar } from "@/utils/formatting";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import StockDialog from "@/components/stocks/stock-dialog";

import type { FormattedTransaction } from "@/types/helpers";

interface RecommendationsProps {
    transactions: FormattedTransaction[]
};

export default function TransactionsTable({
    transactions,
}: RecommendationsProps) {
    const total = useMemo(() => {
        return transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [transactions]);

    return (
        <div className='w-full rounded-md border'>
            <Table className=''>
                <TableHeader>
                    <TableRow className='bg-zinc-50'>
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
    )
}