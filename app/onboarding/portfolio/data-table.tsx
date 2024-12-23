"use client";
import Image from "next/image";

import {
    type ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { Pencil, Search, Trash2 } from "lucide-react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
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
      <div className='flex flex-row items-center gap-2 sm:pl-3 py-3'>
        <div className='h-3 sm:h-3.5 w-3 sm:w-3.5 relative'>
          <Image
              src={row.original["exchange"]==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
              alt='flag'
              sizes="14px"
              fill
          />
        </div>
        <span className='text-xs lg:text-sm font-medium'>
          {(row.getValue('symbol') as string).toUpperCase()}
        </span>
      </div>
    )
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className='max-w-[180px] sm:max-w-[240px] text-xs lg:text-sm font-medium line-clamp-1 overflow-hidden py-3'>
        {(row.getValue('name') as string).toUpperCase()}
      </div>
    )
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => (
      <div className='text-xs lg:text-sm font-medium py-3'>{row.getValue('units')}</div>
    )
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => (
      <div className='text-xs lg:text-sm font-medium py-3'>{formatDollar(row.getValue('value'))}</div>
    )
  },
] as const;

interface DataTableProps {
    populatedHoldings: PopulatedHolding[]
    setPopulatedHoldings: React.Dispatch<React.SetStateAction<PopulatedHolding[]>>
}

export default function DataTable({ populatedHoldings, setPopulatedHoldings }: DataTableProps) {
    const isMobile = useMediaQuery();

    // see https://ui.shadcn.com/docs/components/data-table
    const table = useReactTable<PopulatedHolding>({
        data: populatedHoldings.map((holding) => ({ ...holding, value: holding.units * (holding.previousClose ?? 0) })),
        columns: columns.filter((column) => {
            if (isMobile) {
              // @ts-ignore: issue with ColumnDef type https://github.com/TanStack/table/issues/4241
              return ["symbol", "units", "value"].includes(column.accessorKey);
            }
            return true;
        }),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className='rounded-md border overflow-y-auto'>
            <Table>
                <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className='bg-zinc-50'>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className='py-3 font-medium'>
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

                        <TableCell className=''>
                          <div className='flex flex-row items-center justify-end gap-1 shrink pr-3'>
                            <EditHoldingDialog
                              holding={row.original}
                              onChange={(holding: PopulatedHolding) => {
                                setPopulatedHoldings((curr) => curr.map((obj) => obj.stockId === holding.stockId? holding: obj));
                              }}
                            >
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='group hover:bg-transparent'
                                >
                                    <Pencil
                                      size={isMobile? 13: 16}
                                      strokeWidth={2}
                                      className='group-hover:scale-110'
                                    />
                                </Button>
                            </EditHoldingDialog>

                            <Button
                                type='button'
                                variant='ghost'
                                size='sm'
                                className='group hover:bg-transparent'
                            >
                                <Trash2
                                  size={isMobile? 13: 16}
                                  strokeWidth={2}
                                  className='group-hover:text-red-400 group-hover:scale-110'
                                />
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
