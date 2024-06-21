"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import StockModal from "@/components/stocks/stock-modal";

import { formatDollar } from "@/utils/formatting";

import type { Recommendation } from "@/types/helpers";

interface RecommendationsTableProps {
    data: Recommendation[]
}

export default function RecommendationsTable({ data }: RecommendationsTableProps) {
    return (
        <div className='w-full rounded-md border'>
            <Table>
                <TableHeader>
                    <TableRow className='bg-slate-50'>
                        <TableHead className='py-3.5 font-medium'>
                            Transaction
                        </TableHead>
                        <TableHead className='py-3.5 font-medium'>
                            Symbol
                        </TableHead>
                        <TableHead className='py-3.5 font-medium'>
                            Name
                        </TableHead>
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
                    {data.map((obj) => (
                        <StockModal key={`recommendation-${obj.stockId}`} stockId={obj.stockId}>
                            <TableRow className='cursor-pointer'>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {obj.transaction}
                                </TableCell>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {obj.symbol}
                                </TableCell>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {obj.name}
                                </TableCell>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {obj.units}
                                </TableCell>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {formatDollar(obj.price)}
                                </TableCell>
                                <TableCell className='text-lg font-medium py-3.5'>
                                    {formatDollar(obj.value)}
                                </TableCell>
                            </TableRow>
                        </StockModal>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}