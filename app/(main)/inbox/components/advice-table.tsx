import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import type { Advice } from "@prisma/client";
import AdviceSubTable from "./advice-sub-table";

interface AdviceTableProps {
    data: Advice[]
}

export default function AdviceTable({ data }: AdviceTableProps) {
    return (
        <div className='flex flex-col gap-3 py-12'>
            <p>Older suggestions</p>
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
                    {data.length > 0 ? (
                        data.map((advice) => (
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
        </div>
    )
}