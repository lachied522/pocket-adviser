"use client";
import { useState, useMemo } from "react";

import { format } from "date-fns";

import { ChevronRight } from "lucide-react";

import { formatDollar } from "@/utils/formatting";

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

interface AdviceSubTableProps {
    advice: Advice
}

export default function AdviceSubTable({ advice }: AdviceSubTableProps) {
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