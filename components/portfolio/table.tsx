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
import { Button } from "@/components/ui/button";

import StockDialog from "@/components/stocks/stock-dialog";

import type { PopulatedHolding } from "@/types/helpers";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PopulatedHolding[]
  emptyComponent?: JSX.Element
}

export default function StockTable<TData, TValue>({
  columns,
  data,
  emptyComponent
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState([{
        id: 'symbol', desc: false,
    }]);
    const [pagination, setPagination] = useState({
        pageIndex: 0, // initial page index
        pageSize: 10, // default page size
    });

    // see https://ui.shadcn.com/docs/components/data-table
    const table = useReactTable<PopulatedHolding>({
        data,
        // @ts-ignore
        columns,
        state: {
            sorting,
            pagination,
        },
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='min-h-[560px] flex flex-col justify-stretch'>
            <div className='flex-1 rounded-md border'>
                <Table>
                    <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className='bg-zinc-50'>
                        {headerGroup.headers.map((header) => {
                            return (
                            <TableHead key={header.id} className='py-3.5 font-medium'>
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
                            <TableRow data-state={row.getIsSelected() && "selected"} className='cursor-pointer'>
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

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className='text-xs'>
                    Showing {table.getRowModel().rows.length} of {data.length}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
