"use client";
import { useState, useMemo } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ReferenceLine,
} from "recharts";

import { ChartContainer } from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";

const EXPECTED_VALUE = 50;
const MAX_RISK = 50;

type DataPoint = {
    t: number
    value: number
}

export default function RiskExample() {
    const [riskFreeRate, setRiskFreeRate] = useState<number>(0);
    const [risk, setRisk] = useState<number>(25);

    const [low, high, expected] = useMemo(() => {
        const i = { t: 0, value: EXPECTED_VALUE / (1 + risk / MAX_RISK) };
        return [
            [i, { t: 1, value: EXPECTED_VALUE - risk }],
            [i, { t: 1, value: EXPECTED_VALUE + risk }],
            [i, { t: 1, value: EXPECTED_VALUE }],
        ] satisfies DataPoint[][];
    }, [risk, riskFreeRate]);

    return (
        <div className='flex flex-col gap-2 my-6'>
            <h3 className='font-semibold'>Pricing the Coin Flip Game</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                <div className='flex flex-col justify-center gap-2 sm:gap-6 xl:px-3'>
                    <div className='flex flex-row items-center justify-between gap-2 sm:gap-6 text-sm'>
                        <div className='shrink-0'>Risk ($)</div>
                        <div className='w-full flex flex-row items-center justify-center gap-3 px-3 py-2 border border-input rounded-md shadow-sm'>
                            <Slider
                                min={0}
                                max={MAX_RISK}
                                value={[risk]}
                                onValueChange={(value) => setRisk(value[0])}
                                className='w-full'
                            />
                            <div className='w-4'>{risk.toLocaleString()}</div>
                        </div>
                    </div>
                    {/* <div className='flex flex-row sm:flex-col items-center justify-between gap-2 mb-6 p-3 sm:p-6'>
                        <div className='text-sm shrink-0 font-medium'>Risk-free rate (%)</div>
                        <div className='flex flex-row items-center justify-center gap-2 sm:py-3'>
                            <div className='w-4' />
                            <Slider
                                min={0}
                                max={50}
                                value={[riskFreeRate]}
                                onValueChange={(value) => setRiskFreeRate(value[0])}
                                className='w-[160px]'
                            />
                            <div className='w-4 text-sm'>{riskFreeRate}</div>
                        </div>
                    </div> */}

                    <div className='flex flex-row items-center justify-between'>
                        <div className='flex flex-col items-center gap-2 text-sm'>
                            <span>Low</span>
                            <span>{low[1].value < 0 && '-'}${Math.abs(low[1].value)}</span>
                        </div>
                        <div className='flex flex-col items-center gap-2 text-sm'>
                            <span>Expected</span>
                            <span>${EXPECTED_VALUE}</span>
                        </div>
                        <div className='flex flex-col items-center gap-2 text-sm'>
                            <span>High</span>
                            <span>${high[1].value}</span>
                        </div>
                    </div>

                    <div className='flex flex-col items-center gap-2 text-sm'>
                        <span>Fair Value / Price</span>
                        <span>${high[0].value.toFixed(0)}</span>
                    </div>
                </div>
                <div className='flex flex-col items-center gap-2'>
                    <ChartContainer config={{}} className='w-full max-w-[480px] max-h-[240px]'>
                        <LineChart
                            margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                            accessibilityLayer
                        >
                            <ReferenceLine
                                stroke="#52525b"
                                strokeDasharray="3 3"
                                segment={[
                                    { x: -0.2, y: EXPECTED_VALUE },
                                    { x: 1, y: EXPECTED_VALUE }
                                ]}
                            />
                            <ReferenceLine
                                stroke="#52525b"
                                strokeDasharray="3 3"
                                segment={[
                                    { x: -0.2, y: expected[0].value },
                                    { x: 0, y: expected[0].value }
                                ]}
                            />
                            <ReferenceLine
                                stroke="green"
                                strokeDasharray="3 3"
                                segment={[
                                    { x: 1, y: low[1].value },
                                    { x: 1, y: high[1].value }
                                ]}
                            />
                            <Line
                                data={expected}
                                dataKey="value"
                                strokeDasharray="3 3"
                                isAnimationActive={false}
                            />
                            <Line
                                data={low}
                                dataKey="value"
                                fill="#f87171"
                                stroke="#f87171"
                                isAnimationActive={false}
                            />
                            <Line
                                data={high}
                                dataKey="value"
                                stroke="#22c55e"
                                fill="#22c55e"
                                isAnimationActive={false}
                            />
                            <YAxis
                                dataKey="value"
                                domain={[-10, 110]}
                                label="$"
                                interval="equidistantPreserveStart"
                                allowDataOverflow
                            />
                            <XAxis
                                type="number"
                                dataKey="t"
                                ticks={[0, 1]}
                                domain={[-0.2, 1.2]}
                                tickFormatter={(value: number) => value === 0? "fair value": "outcome"}
                            />
                        </LineChart>
                    </ChartContainer>
                </div>
            </div>
        </div>
    )
}