"use client";
import { useState, useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
} from 'recharts';

import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";

import { type ProfileState, useProfileContext } from '../context';

function formatValue(value: number) {
    const million = 1e6;
    const thousand = 1e3;
  
    if (Math.abs(value) >= million) {
      return `$${(value / million).toFixed(0)}m`;
    } else if (Math.abs(value) >= 10 * thousand) {
      return `$${(value / thousand).toFixed(0)}k`;
    } else if (Math.abs(value) >= thousand) {
        return `$${(value / thousand).toFixed(2)}k`;
    } else {
      return `$${value.toFixed(0)}`;
    }
}

function upperCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

const chartConfig = {
    wealth: {
        label: "Wealth",
    },
    principal: {
        label: "Principal",
    },
    income: {
        label: "Income",
    }
} satisfies ChartConfig;

export default function WealthChart() {
    const { form, forecastData } = useProfileContext() as ProfileState;
    const [maxTicks, setMaxTicks] = useState<number>(20);
    const milestones = form.watch("milestones");

    const endingWealth = useMemo(() => {
        return forecastData[forecastData.length - 1].wealth;
    }, [forecastData]);

    return (
        <div className='hidden sm:flex flex-col gap-3 mb-6'>
            <div className='w-full flex flex-col items-start gap-3'>
                <h3 className='font-medium'>
                    Forecast Wealth
                </h3>
                <p>This is a forecast of your wealth over time based on your profile. Adjust your profile to see how it affects your forecast wealth.</p>
            </div>

            <ChartContainer config={chartConfig} className="h-[300px] md:h-[400px] w-full">
                <AreaChart
                    width={730}
                    height={250}
                    data={forecastData.slice(0, maxTicks)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    accessibilityLayer
                >
                    <defs>
                        <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(200 98.0% 39.4%)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(200 98.0% 39.4%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="purple" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgb(192 38 211)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="rgb(192 38 211)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="year"
                        tickFormatter={(value: number) => String(value + 1)}
                    />
                    <YAxis tickFormatter={formatValue} />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Area
                        type="monotone"
                        dataKey="wealth"
                        stroke="hsl(200 98.0% 39.4%)"
                        fillOpacity={1}
                        fill="url(#blue)"
                        isAnimationActive
                    />
                    <Area
                        type="monotone"
                        dataKey="income"
                        stroke="rgb(147 51 234)"
                        fillOpacity={1}
                        fill="url(#purple)"
                        isAnimationActive
                    />
                    <Area
                        type="monotone"
                        dataKey="principal"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#green)"
                        isAnimationActive
                    />
                    <ReferenceLine y={endingWealth} stroke="hsl(200 98.0% 39.4%)" strokeDasharray="3 3" />
                    {milestones.map((obj, i) => (
                        <ReferenceLine
                            key={`milestone-reference-${i}`}
                            x={new Date(obj.date).getFullYear()}
                            label={upperCase(obj.description.toLocaleString())}
                            // label={<MilestoneLabel text={upperCase(obj.description)} />}
                            stroke="hsl(200 98.0% 39.4%)"
                            strokeDasharray="3 3"
                        />
                    ))}
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
            </ChartContainer>
        </div>
    )
}