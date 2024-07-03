"use client";
import Image from "next/image";

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
      <div className='flex flex-row items-center gap-2.5 md:pl-3 py-5'>
        <Image
            src={row.original["exchange"]==="ASX"? "/aus-flag-icon.png": "/us-flag-icon.png"}
            alt='flag'
            height={16}
            width={16}
        />
        <span className='md:text-lg font-medium'>
          {(row.getValue('symbol') as string).toUpperCase()}
        </span>
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
    accessorKey: "sector",
    header: "Sector",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium capitalize line-clamp-1 py-5'>
        {(row.getValue('sector') as string)}
      </div>
    )
  },
  {
    accessorKey: "previousClose",
    header: "Previous Close",
    cell: ({ row }) => (
      <div className='md:text-lg font-medium py-5'>
        {formatDollar(row.getValue('previousClose'))}
        <span className='text-sm'>{` ${row.original['currency']}`}</span>
      </div>
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
