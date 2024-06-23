"use client"
import { ColumnDef } from "@tanstack/react-table";

import { formatDollar, formatPercent } from "@/utils/formatting";

import type { PopulatedHolding } from "@/types/helpers";

export const columns: ColumnDef<PopulatedHolding>[] = [
  {
    accessorKey: "symbol",
    header: () => (
      <div className='md:pl-3'>
        Symbol
      </div>
    ),
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5 md:pl-3'>
        {(row.getValue('symbol') as string).toUpperCase()}
      </div>
    )
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium line-clamp-1 py-5'>
        {(row.getValue('name') as string).toUpperCase()}
      </div>
    )
  },
  {
    accessorKey: "previousClose",
    header: "Price",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5'>{formatDollar(row.getValue('previousClose'))}</div>
    )
  },
  {
    accessorKey: "changesPercentage",
    header: "Change (%)",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5'>{formatPercent(row.getValue('changesPercentage'))}</div>
    )
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5'>{row.getValue('units')}</div>
    )
  },
  {
    header: "Value",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5'>{formatDollar(Number(row.getValue('units')) * Number(row.getValue('previousClose')))}</div>
    )
  },
  // {
  //   accessorKey: "cost",
  //   header: "Cost",
  // },
]
