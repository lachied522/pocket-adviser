"use client";
import { useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
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

import StockDialog from "@/components/stocks/stock-dialog";

import type { PopulatedHolding } from "@/types/helpers";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PopulatedHolding[]
  emptyComponent?: JSX.Element
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  emptyComponent
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState([{
        id: 'symbol', desc: false,
    }]);

    // see https://ui.shadcn.com/docs/components/data-table
    const table = useReactTable<PopulatedHolding>({
        data,
        // @ts-ignore
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='flex-1 rounded-md border'>
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='bg-zinc-50'>
                    {headerGroup.headers.map((header) => {
                        return (
                        <TableHead key={header.id} className='py-1'>
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
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                    <StockDialog
                        key={row.id}
                        symbol={row.original.symbol}
                        name={row.original.name}
                    >
                        <TableRow data-state={row.getIsSelected() && "selected"} className="cursor-pointer">
                            {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                            ))}
                        </TableRow>
                    </StockDialog>
                    ))
                ) : (
                    <TableRow className="">
                        <TableCell colSpan={columns.length} className="h-[560px] text-center">
                            {emptyComponent? emptyComponent: "Portfolio empty."}
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}
