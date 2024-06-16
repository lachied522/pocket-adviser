"use client"
import { ColumnDef } from "@tanstack/react-table";

import { Pencil } from "lucide-react";

import { formatDollar, formatPercent } from "@/utils/formatting";

import { Button } from "../ui/button";

import EditHoldingDialog from "./edit-holding-dialog";

import type { PopulatedHolding } from "@/types/helpers";

export const columns: ColumnDef<PopulatedHolding>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
    cell: ({ row }) => (
      <>{(row.getValue('symbol') as string).toUpperCase()}</>
    )
  },
  {
    accessorKey: "previousClose",
    header: "Price",
    cell: ({ row }) => (
      <>{formatDollar(row.getValue('previousClose'))}</>
    )
  },
  // {
  //   accessorKey: "changesPercentage",
  //   header: "Change",
  //   cell: ({ row }) => (
  //     <div>{formatPercent(row.getValue('changesPercentage'))}</div>
  //   )
  // },
  {
    accessorKey: "units",
    header: "Units",
  },
  {
    header: "Value",
    cell: ({ row }) => (
      <>{formatDollar(Number(row.getValue('units')) * Number(row.getValue('previousClose')))}</>
    )
  },
  // {
  //   accessorKey: "cost",
  //   header: "Cost",
  // },
  {
    accessorKey: 'id',
    header: 'Edit',
    cell: ({ row }) => (
      <EditHoldingDialog holding={row.original}>
        <Button variant='ghost'>
          <Pencil size={16} />
        </Button>
      </EditHoldingDialog>
    )
  }
]
