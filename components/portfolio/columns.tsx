"use client";
import Image from "next/image";

import { type Column, ColumnDef } from "@tanstack/react-table";

import { 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown,
} from "lucide-react";

import { formatDollar, formatPercent, formatMarketCap } from "@/utils/formatting";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import type { PopulatedHolding } from "@/types/helpers";

interface HeaderCellProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

function HeaderCell<TData, TValue> ({
  column,
  title,
  className,
}: HeaderCellProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "flex items-center text-sm h-8 data-[state=open]:bg-accent px-0",
        className
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2 h-3.5 w-3.5" />
      ) : column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2 h-3.5 w-3.5" />
      ) : (
        <ChevronsUpDown className="ml-2 h-3.5 w-3.5" />
      )}
    </Button>
  )
}

export const columns: ColumnDef<PopulatedHolding>[] = [
  {
    accessorKey: "symbol",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Symbol"} className='sm:pl-3' />
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
    header: ({ column }) => (
      <HeaderCell column={column} title={"Name"} />
    ),
    cell: ({ row }) => (
      <div className='max-w-[180px] sm:max-w-[240px] text-sm lg:text-base font-medium line-clamp-1 py-5'>
        {(row.getValue('name') as string).toUpperCase()}
      </div>
    )
  },
  {
    accessorKey: "sector",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Sector"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium capitalize line-clamp-1 py-5'>
        {row.getValue('sector')}
      </div>
    )
  },
  {
    accessorKey: "marketCap",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Market Cap"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium capitalize line-clamp-1 py-5'>
        {formatMarketCap(row.getValue('marketCap'))}
      </div>
    )
  },
  {
    accessorKey: "units",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Units"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{row.getValue('units')}</div>
    )
  },
  {
    accessorKey: "previousClose",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Price"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {formatDollar(row.getValue('previousClose'))}
        <span className='text-sm'>{` ${row.original['currency']}`}</span>
      </div>
    )
  },
  {
    accessorKey: "change",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Change"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{formatPercent(row.getValue('change'))}</div>
    )
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Value"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{formatDollar(row.getValue('value'))}</div>
    )
  },
  {
    accessorKey: "eps",
    header: ({ column }) => (
      <HeaderCell column={column} title={"EPS"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {row.getValue('eps')}
        <span className='text-sm'>{` ${row.original['currency']}`}</span>
      </div>
      
    )
  },
  {
    accessorKey: "pe",
    header: ({ column }) => (
      <HeaderCell column={column} title={"PE"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>{row.getValue('pe')}</div>
    )
  },
  {
    accessorKey: "epsGrowth",
    header: ({ column }) => (
      <HeaderCell column={column} title={"EPS Growth"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {formatPercent(Number(row.getValue('epsGrowth')) * 100)}
      </div>
    )
  },
  {
    accessorKey: "dividendAmount",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Dividend"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {formatDollar(row.getValue('dividendAmount'))}
        <span className='text-sm'>{` ${row.original['currency']}`}</span>
      </div>
    )
  },
  {
    accessorKey: "dividendYield",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Yield"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {formatPercent(Number(row.getValue('dividendYield')) * 100)}
      </div>
    )
  },
  {
    accessorKey: "dividendTotal",
    header: ({ column }) => (
      <HeaderCell column={column} title={"Total"} />
    ),
    cell: ({ row }) => (
      <div className='text-sm lg:text-base font-medium py-5'>
        {formatDollar(row.getValue('dividendTotal'))}
      </div>
    )
  },
]
