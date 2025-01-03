"use client";
import { useState, useMemo } from "react";
import { format } from "date-fns";

import { ChevronRight } from "lucide-react";

import { useChatNavigation } from "@/hooks/useChatNavigation";

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
import { cn } from "@/components/utils";

import TransactionsTable from "@/components/advice/table";

import type { Advice } from "@prisma/client";

function capitaliseText(text: string) {
    return text.charAt(0).toUpperCase() + text.toLowerCase().slice(1);
}


function AdviceSubTable({ advice }: { advice: Advice }) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const total = useMemo(() => {
        return advice.transactions.reduce((acc, obj) => acc + (obj.units * obj.price), 0);
    }, [advice.transactions]);

    return (
        <>
            <TableRow>
                <TableCell>{format(advice.createdAt, 'PPP')}</TableCell>
                <TableCell>{capitaliseText(advice.type)}</TableCell>
                <TableCell>{formatDollar(total)}</TableCell>
                <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen((curr) => !curr)}>
                        <ChevronRight className={cn(
                            'duration-300',
                            isOpen && 'rotate-90'
                        )}/>
                    </Button>
                </TableCell>
            </TableRow>

            {isOpen && (
            <TableRow className='hover:bg-transparent'>
                <TableCell colSpan={4} className='p-0'>
                    <TransactionsTable transactions={advice.transactions} />
                </TableCell>
            </TableRow>
            )}
        </>
    )
}

export default function AdviceArea({
    adviceData
}: {
    adviceData: Advice[]
}) {
    const { onSubmit } = useChatNavigation();

    return (
        <div className='flex flex-col gap-2'>
            <span className='font-medium'>Suggestions for you</span>
            <Tabs defaultValue="today">
                <TabsList className='gap-2'>
                    <TabsTrigger value="today" className='h-9'>Today</TabsTrigger>
                    <TabsTrigger value="older" className='h-9'>Older</TabsTrigger>
                </TabsList>
                <TabsContent value="today" className='sm:mt-3'>
                    {(adviceData.length > 0) ? (
                    <div className='flex flex-col items-start gap-3'>
                        <TransactionsTable {...adviceData[0]} />

                        <div className='w-full flex flex-row items-center justify-end'>
                            <Button
                                size='dynamic'
                                onClick={() => {
                                    onSubmit(
                                        "Tell me more about why I should consider the above transactions",
                                        { adviceId: String(adviceData[0].id) }
                                    )
                                }}
                            >
                                Find out more
                            </Button>
                        </div>
                    </div>
                    ) : (
                    <div className='flex items-center justify-center p-12'>
                        <span className='text-sm'>Nothing here yet.</span>
                    </div>
                    )}
                </TabsContent>
                <TabsContent value="older" className='sm:mt-6'>
                    <div className='rounded-md border'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-zinc-50'>
                                    <TableHead className='font-medium'>
                                        Date
                                    </TableHead>
                                    <TableHead className='font-medium'>
                                        Type
                                    </TableHead>
                                    <TableHead className='font-medium'>
                                        Amount
                                    </TableHead>
                                    <TableHead />                            
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {adviceData.length > 1 ? (
                                adviceData.slice(1).map((advice) => (
                                <AdviceSubTable key={advice.id} advice={advice} />
                                ))
                            ) : (
                                <TableRow className='hover:bg-transparent'>
                                    <TableCell colSpan={4} className='p-12'>
                                    <div className='flex flex-col items-center gap-2'>
                                        <span>Nothing here yet.</span>
                                    </div>
                                    </TableCell>
                                </TableRow>
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}