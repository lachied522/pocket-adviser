"use client";
import { useMemo } from "react";

import {
    XAxis,
    YAxis,
    CartesianGrid,
    ScatterChart,
    Scatter,
    Label,
    ReferenceLine,
    LabelList,
} from 'recharts';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

import type { Advice } from "@prisma/client";

const COLORS = ["hsl(var(--chart-3))", "hsl(var(--chart-4))"];

const chartConfig = {
    expectedReturn: {
        label: "Expected Return",
    },
    currentPortfolio: {
        label: "Current Portfolio",
        color: "hsl(var(--chart-1))"
    },
    proposedPortfolio: {
        label: "Proposed Portfolio",
        color: "hsl(var(--chart-2))"
    }
} satisfies ChartConfig;

interface AdvancedProps {
    statistics: Advice["statistics"]
    stockData: Advice["stockData"]
}

export default function Advanced({
    statistics,
    stockData,
}: AdvancedProps) {
    const data = useMemo(() => {
        return [
            {...statistics.currentPortfolio, label: "Current Portfolio", fill: "hsl(var(--chart-1))" },
            {...statistics.proposedPortfolio, label: "Proposed Portfolio", fill: "hsl(var(--chart-2))" },
        ]
    }, [statistics]);

    return (
        <div className='w-full flex flex-col gap-3'>
            <ChartContainer
                config={{
                    ...chartConfig,
                    ...(stockData? Object.fromEntries(
                        stockData.map((stock, index) => ([
                            stock.symbol,
                            {
                                label: stock.symbol,
                                color: COLORS[index % COLORS.length],
                            }
                        ]))
                    ): {})
                }}
                className="h-[300px] md:h-[400px] w-full"
            >
                <ScatterChart accessibilityLayer margin={{ left: 0, right: 0, bottom: 20 }}>
                    <CartesianGrid />
                    <XAxis
                        type="number"
                        dataKey="standardDeviation"
                        name="Standard Deviation"
                        domain={([_, dataMax]) => ([0, Math.ceil(dataMax * 1.10)])}
                        label={<Label value="σ" dy={10} />}
                    />
                    <YAxis
                        type="number"
                        dataKey="expectedReturn"
                        name="Expected Return"
                        label="E(R)"
                        padding={{ top: 20, bottom: 20 }}
                        tickFormatter={(value: number) => (value * 100).toFixed(0)}
                    />
                    {/* <ReferenceLine
                        segment={[
                            { x: data[0].standardDeviation, y: data[0].expectedReturn },
                            { x: data[1].standardDeviation , y: data[1].expectedReturn },
                        ]}
                        stroke="#111"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        shape={(props) => {
                            return (
                              <>
                                <defs>
                                  <marker
                                    id="arrow"
                                    markerWidth="10"
                                    markerHeight="10"
                                    refX="9"
                                    refY="3"
                                    orient="auto"
                                    markerUnits="strokeWidth"
                                  >
                                    <path d="M0,0 L0,6 L6,3 z"></path>
                                  </marker>
                                </defs>
                                <line marker-end="url(#arrow)" {...props} />
                              </>
                            );
                        }}
                    /> */}
                    <Scatter data={data}>
                        <LabelList dataKey="label" position="right" />
                    </Scatter>
                    {stockData && (
                    <Scatter
                        data={stockData.map((stock, index) => ({
                            label: stock.symbol,
                            standardDeviation: stock.stdDev ?? 0,
                            expectedReturn: stock.priceTarget && stock.previousClose? (stock.priceTarget / stock.previousClose) - 1: 0,
                            fill: COLORS[index % COLORS.length]
                        }))}
                    >
                        <LabelList dataKey="label" position="right" />
                    </Scatter>
                    )}
                    <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
                    {/* <ChartLegend
                        layout="vertical"
                        verticalAlign={isMobile? "bottom": "top"}
                        align={isMobile? "center": "right"}
                        payload={[
                            { value: "currentPortfolio", color: "hsl(var(--chart-1))" },
                            { value: "proposedPortfolio", color: "hsl(var(--chart-2))" },
                            ...stockData.map((stock, index) => ({
                                value: stock.symbol,
                                color: COLORS[index % COLORS.length],
                            }))
                        ]}
                        content={<ChartLegendContent className='max-w-[300px] sm:max-w-auto flex flex-wrap sm:flex-col items-start gap-1 px-3 sm:py-6 sm:ml-3 ' />}
                    /> */}
                </ScatterChart>
            </ChartContainer>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-zinc-50'>
                            <TableHead className='w-[200px]'>
                                <div className=''>Metric</div>
                            </TableHead>
                            <TableHead className='text-center'>Current Portfolio</TableHead>
                            <TableHead className='text-center'>Proposed Portfolio</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className='w-[200px]'>
                                <div className=''>Expected Return</div>
                            </TableCell>
                            <TableCell className='text-center'>
                                {(100 * parseFloat(statistics.currentPortfolio.expectedReturn)).toFixed(2)}%
                            </TableCell>
                            <TableCell className='text-center'>
                                {(100 * parseFloat(statistics.proposedPortfolio.expectedReturn)).toFixed(2)}%
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className='w-[200px]'>
                                <div className=''>Standard Deviation</div>
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.currentPortfolio.standardDeviation}
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.proposedPortfolio.standardDeviation}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className='w-[200px]'>
                                <div className=''>Beta</div>
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.currentPortfolio.beta}
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.proposedPortfolio.beta}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className='w-[200px]'>
                                <div className=''>Sharpe Ratio</div>
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.currentPortfolio.sharpeRatio}
                            </TableCell>
                            <TableCell className='text-center'>
                                {statistics.proposedPortfolio.sharpeRatio}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}