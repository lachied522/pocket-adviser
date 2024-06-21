"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import StockModal from "@/components/stocks/stock-modal";

import type { PopulatedHolding } from "@/types/helpers";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PopulatedHolding[]
  emptyText?: string
}

export default function StockTable<TData, TValue>({
  columns,
  data,
  emptyText
}: DataTableProps<TData, TValue>) {
    // see https://ui.shadcn.com/docs/components/data-table
    const table = useReactTable<PopulatedHolding>({
        data,
        // @ts-ignore
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='bg-slate-50'>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id} className='py-5 font-medium'>
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                                )}
                        </TableHead>
                        )
                    })}
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                    <StockModal
                        key={row.id}
                        stockId={row.original.stockId}
                    >
                        <TableRow data-state={row.getIsSelected() && "selected"} className=''>
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                    </StockModal>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                            {emptyText? emptyText: "No results."}
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}
