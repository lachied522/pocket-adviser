"use client";
import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Label,
} from "recharts";

import { useMediaQuery } from "@/hooks/useMediaQuery";

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

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

const chartConfig = {
    "sector": {
        label: "Sector"
    },
    "allocation": {
        label: ""
    },
    "Basic Materials": {
        label: "Basic Materials",
    },
    "Financial Services": {
        label: "Financial Services",
    },
    "Healthcare": {
        label: "Healthcare",
    },
    "Energy": {
        label: "Energy",
    },
    "Consumer Cyclical": {
        label: "Consumer Cyclical",
    },
    "Communication Services": {
        label: "Communication Services",
    },
    "Industrials": {
        label: "Industrials",
    },
    "Consumer Defensive": {
        label: "Consumer Defensive",
    },
    "Real Estate": {
        label: "Real Estate",
    },
    "Technology": {
        label: "Technology",
    },
    "Utilities": {
        label: "Utilities",
    },
    "null": {
        label: "Other",
    }
} satisfies ChartConfig;

interface StatisticsProps {
    statistics: Advice["statistics"]
}

export default function Statistics({ statistics }: StatisticsProps) {
    const isMobile = useMediaQuery();
    const [currentAllocations, proposedAllocations] = useMemo(() => {
        return [
            Object.entries(statistics.currentPortfolio.sectorAllocations)
            .map(([sector, allocation], index) => ({ sector, allocation: 100 * parseFloat(allocation as string), fill: COLORS[index % COLORS.length] })),
            Object.entries(statistics.proposedPortfolio.sectorAllocations)
            .map(([sector, allocation], index) => ({ sector, allocation: 100 * parseFloat(allocation as string), fill: COLORS[index % COLORS.length] }))
        ]
    }, [statistics]);

    return (
        <div className='w-full flex flex-col gap-3'>
            <div className='text-sm'>Sector Allocations</div>
            <ChartContainer config={chartConfig} className='w-full h-[200px] sm:h-[360px]'>
                <PieChart accessibilityLayer>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend
                        layout="vertical"
                        verticalAlign="bottom"
                        align="center"
                        payloadUniqBy
                        content={<ChartLegendContent className='w-full flex flex-wrap gap-1 sm:gap-2' />}
                    />
                    <Pie
                        data={currentAllocations}
                        outerRadius={isMobile? 40: 80}
                        innerRadius={isMobile? 20: 40}
                        paddingAngle={1}
                        cx="25%"
                        cy="50%"
                        labelLine={false}
                        dataKey="allocation"
                        nameKey="sector"
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground font-medium"
                                            >
                                                Current
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </Pie>

                    <Pie
                        data={proposedAllocations}
                        outerRadius={isMobile? 40: 80}
                        innerRadius={isMobile? 20: 40}
                        paddingAngle={1}
                        cx="75%"
                        cy="50%"
                        labelLine={false}
                        dataKey="allocation"
                        nameKey="sector"
                    >
                        <Label
                            content={({ viewBox }) => {
                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                    return (
                                        <text
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                        >
                                            <tspan
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                className="fill-foreground font-medium"
                                            >
                                                Proposed
                                            </tspan>
                                        </text>
                                    )
                                }
                            }}
                        />
                    </Pie>
                </PieChart>
            </ChartContainer>
            
            <div className='text-sm'>Other</div>
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
                                <div className=''>Dividend Yield</div>
                            </TableCell>
                            <TableCell className='text-center'>
                                {(100 * parseFloat(statistics.currentPortfolio.dividendYield)).toFixed(2)}%
                            </TableCell>
                            <TableCell className='text-center'>
                                {(100 * parseFloat(statistics.proposedPortfolio.dividendYield)).toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}