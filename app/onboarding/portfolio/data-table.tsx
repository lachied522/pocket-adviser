"use client";
import Image from "next/image";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Pencil, Search, Trash2 } from "lucide-react";

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

import EditHoldingDialog from "./edit-holding-dialog";

import type { PopulatedHolding } from "@/types/helpers";

const columns: ColumnDef<PopulatedHolding>[] = [
  {
    accessorKey: "symbol",
    header: () => (
      <div className='sm:pl-3'>
        Symbol
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex flex-row items-center gap-2 sm:pl-3 py-5'>
        <Image
            src={row.original["exchange"]==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
            alt='flag'
            height={16}
            width={16}
        />
        <span className='text-sm lg:text-base font-medium'>
          {(row.getValue('symbol') as string).toUpperCase()}
        </span>
      </div>
    )
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className='max-w-[180px] sm:max-w-[240px] text-sm lg:text-base font-medium line-clamp-1 py-5'>
        {(row.getValue('name') as string).toUpperCase()}
      </div>
    )
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{row.getValue('units')}</div>
    )
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{formatDollar(row.getValue('value'))}</div>
    )
  },
]

interface DataTableProps {
    populatedHoldings: PopulatedHolding[]
    setPopulatedHoldings: React.Dispatch<React.SetStateAction<PopulatedHolding[]>>
}

export default function DataTable({ populatedHoldings, setPopulatedHoldings }: DataTableProps) {
    // see https://ui.shadcn.com/docs/components/data-table
    const table = useReactTable<PopulatedHolding>({
        data: populatedHoldings.map((holding) => ({ ...holding, value: holding.units * (holding.previousClose ?? 0) })),
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className='rounded-md border'>
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='bg-zinc-50'>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className='py-3.5 font-medium'>
                            {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                        )
                      )}
                      {/* Placeholder cell */}
                      <TableHead />
                    </TableRow>
                ))}
                </TableHeader>
                <TableBody>
                {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                        ))}

                        <TableCell className='w-[80px]'>
                          <div className='flex flex-row items-center justify-end gap-1'>
                            <EditHoldingDialog
                              holding={row.original}
                              onChange={(holding: PopulatedHolding) => {
                                setPopulatedHoldings((curr) => curr.map((obj) => obj.stockId === holding.stockId? holding: obj));
                              }}
                            >
                                <Button
                                    type='button'
                                    variant='ghost'
                                    className='group hover:bg-transparent'
                                >
                                    <Pencil size={18} strokeWidth={2.5} className='group-hover:scale-110' />
                                </Button>
                            </EditHoldingDialog>

                            <Button
                                type='button'
                                variant='ghost'
                                className='group hover:bg-transparent'
                            >
                                <Trash2 size={18} strokeWidth={2.5} className='group-hover:text-red-400 group-hover:scale-110' />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow className='hover:bg-transparent'>
                        <TableCell colSpan={columns.length} className='p-12'>
                          <div className='flex flex-col items-center gap-2'>
                            <Search size={18} color='black' />
                            <span>Use the search bar above to add stocks to your portfolio.</span>
                          </div>
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </div>
    )
}
