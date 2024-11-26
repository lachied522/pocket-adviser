"use client";
import { useState, useMemo } from "react";

import {
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
    YAxis
} from "recharts";
import { parse } from "date-fns";

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import type { CompanyOutlook } from "@/types/data";

function formatValue(value: number) {
    const billion = 1e9;
    const million = 1e6;
    const thousand = 1e3;
    if (Math.abs(value) >= billion) {
        return `${(value / billion).toLocaleString()}b`;
    } else if (Math.abs(value) >= million) {
      return `${(value / million).toLocaleString()}m`;
    } else if (Math.abs(value) >= 10 * thousand) {
      return `${(value / thousand).toLocaleString()}k`;
    } else if (Math.abs(value) >= thousand) {
        return `${(value / thousand).toLocaleString()}k`;
    } else {
      return `${value.toLocaleString()}`;
    }
}

function formatDate(
    dateString: string, // YYYY-MM-DD
    period: string // FY, Q1, Q2 etc
) {
    if (period === "FY") return dateString.slice(0, 4);
    const date = parse(dateString, "yyyy-MM-d", new Date());
    return `${period} ${String(date.getFullYear()).slice(2, 4)}`;
}

const chartConfig = {
    freeCashFlow: {
      label: "Free Cash Flow",
      color: "#2563eb",
    },
    operatingCashFlow: {
        label: "Operating Cash Flow",
        color: "#facc15",
    },
} satisfies ChartConfig;

const tableRows = {
    freeCashFlow: {
        label: "Free Cash Flow",
    },
    operatingCashFlow: {
        label: "Operating Cash Flow",
    }
} as const;

export default function Cashflow({ stockData }: { stockData: CompanyOutlook }) {
    const [period, setPeriod] = useState<"annual"|"quarter">("annual");

    const formattedData = useMemo(
        () => (period === "annual"? stockData.financialsAnnual: stockData.financialsQuarter).cash
        .map(
            (obj) => ({
                ...obj,
                time: parse(obj.date, "yyyy-MM-d", new Date()).getTime(),
                formattedDate: formatDate(obj.date, obj.period)
            })
        )
        .sort((a, b) => a.time - b.time),
        [stockData, period]
    );

    return (
        <div className='flex flex-col gap-3'>
            <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={formattedData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="formattedDate"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                    />
                    <YAxis tickFormatter={formatValue} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="freeCashFlow" fill="var(--color-freeCashFlow)" radius={4} />
                    <Bar dataKey="operatingCashFlow" fill="var(--color-operatingCashFlow)" radius={4} />
                </BarChart>
            </ChartContainer>

            <div className='w-full flex flex-row justify-end gap-2'>
                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPeriod("annual")}
                    className={cn(period === "annual" && 'bg-zinc-100')}
                >
                    Annual
                </Button>

                <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPeriod("quarter")}
                    className={cn(period === "quarter" && 'bg-zinc-100')}
                >
                    Quarterly
                </Button>
            </div>

            <div className='flex-1 rounded-md border mb-12'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-zinc-50'>
                            <TableHead />
                            {formattedData.map((obj) => (
                            <TableHead
                                key={`cashflow-header-${obj.formattedDate}`}
                                className='py-3.5 font-medium'
                            >
                                {obj.formattedDate}
                            </TableHead>
                            ))}
                            <TableHead>
                                <div>%</div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                    {formattedData.length > 0 ? (
                        Object.entries(tableRows).map(([key, value]) => (
                            <TableRow key={`cashflow-row-${key}`}>
                                <TableCell>
                                    <div className='max-w-[80px] sm:max-w-none line-clamp-1 truncate'>{value.label}</div>
                                </TableCell>
                                {formattedData.map((row) => (
                                <TableCell key={`cell-${key}-${row.date}`} className='py-3'>
                                    {/* @ts-ignore */}
                                    <div>{formatValue(row[key])}</div>
                                </TableCell>
                                ))}
                                <TableCell key={``}>
                                    {/* @ts-ignore */}
                                    <div>{(((formattedData[formattedData.length - 1][key] / formattedData[0][key]) - 1) * 100).toFixed(2)}%</div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow className="">
                            <TableCell className="h-[560px] text-center">
                                
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}