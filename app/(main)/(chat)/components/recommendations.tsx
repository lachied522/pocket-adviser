"use client";
import { useMemo } from "react";

import { RefreshCw } from "lucide-react";

import { formatDollar } from "@/utils/formatting";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import StockDialog from "@/components/stocks/stock-dialog";

import { type ChatState, useChatContext } from "./context";
import Statistics from "./statistics";
import Advanced from "./advanced";

import type { GetRecommendationsResponse } from "@/app/api/chat/tools/get-recommendations";


interface RecommendationsProps extends GetRecommendationsResponse {};

export default function Recommendations({
    transactions,
    stockData,
    statistics,
}: RecommendationsProps) {
    const { onSubmit } = useChatContext() as ChatState;

    const total = useMemo(() => {
        return transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [transactions]);

    return (
        <div className='w-full'>
            <Tabs defaultValue="transactions">
                <TabsList className='h-7 gap-2'>
                    <TabsTrigger value="transactions" className='h-7 text-xs'>Transactions</TabsTrigger>
                    <TabsTrigger value="statistics" className='h-7 text-xs'>Statistics</TabsTrigger>
                    <TabsTrigger value="advanced" className='h-7 text-xs'>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
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
                </TabsContent>
                <TabsContent value="statistics">
                    <Statistics statistics={statistics} />
                </TabsContent>
                <TabsContent value="advanced">
                    <Advanced statistics={statistics} stockData={stockData} />
                </TabsContent>
            </Tabs>

            {transactions.length > 0 && (
            <div className='w-full flex flex-col sm:flex-row items-end sm:items-center justify-between p-3.5 pr-0 gap-2'>
                <div className='w-full flex flex-row justify-end'>
                    <Button
                        variant='default'
                        size='sm'
                        onClick={() => {
                            onSubmit("Can you give me some more ideas?", "getRecommendations");
                        }}
                        className='flex flex-row items-center gap-2 shadow-none'
                    >
                        <RefreshCw size={12} />
                        Regenerate
                    </Button>
                </div>
            </div>
            )}
        </div>
    )
}