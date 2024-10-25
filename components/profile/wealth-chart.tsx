"use client";
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { Circle } from 'lucide-react';

function formatValue(value: number) {
    const million = 1e6;
    const thousand = 1e3;
  
    if (Math.abs(value) >= million) {
      return `$${(value / million).toFixed(0)}m`;
    } else if (Math.abs(value) >= thousand) {
      return `$${(value / thousand).toFixed(0)}k`;
    } else {
      return `$${value.toFixed(0)}`;
    }
}

function upperCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-lg border border-neutral-600 p-3">
                <p className="text-sky-600">Wealth {`${formatValue(payload[0].value)}`}</p>
                <p className="">Principal {`${formatValue(payload[1].value)}`}</p>
            </div>
        );
    }
  
    return null;
}

interface WealthChartProps {
    data: {
        year: number;
        wealth: number;
        principal: number;
    }[]
    milestones: {
        date: Date,
        target: number,
        description: string
    }[]
    expectedReturn: number
}

export default function WealthChart({ data, milestones, expectedReturn }: WealthChartProps) {
    const [maxTicks, setMaxTicks] = useState<number>(20);

    const endingWealth = useMemo(() => {
        return data[data.length - 1].wealth;
    }, [data]);

    return (
        <div className='flex flex-col mb-6'>
            <div className='w-full flex flex-row items-center justify-between'>
                <h3 className='text-lg font-medium'>
                    Your projected wealth
                </h3>
                <span className='text-xs'>*based on expected return of {(100 * expectedReturn).toFixed(2)}% p.a.</span>
            </div>

            <ResponsiveContainer width='98%' height={400}>
                <AreaChart
                    width={730}
                    height={250}
                    data={data.slice(0, maxTicks)}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(200 98.0% 39.4%)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(200 98.0% 39.4%)" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="green" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="year"
                    />
                    <YAxis tickFormatter={formatValue}/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Area
                        type="monotone"
                        dataKey="wealth"
                        stroke="hsl(200 98.0% 39.4%)"
                        fillOpacity={1}
                        fill="url(#blue)"
                        isAnimationActive={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="principal"
                        stroke="#82ca9d"
                        fillOpacity={1}
                        fill="url(#green)"
                        isAnimationActive={false}
                    />
                    <ReferenceLine y={endingWealth} stroke="hsl(200 98.0% 39.4%)" strokeDasharray="3 3" />
                    {/* {milestones.map((obj, i) => (
                        <ReferenceLine
                            key={`milestone-reference-${i}`}
                            x={new Date(obj.date).getFullYear()}
                            // label={`Target $${obj.target.toLocaleString()}`}
                            label={<MilestoneLabel text={upperCase(obj.description)} />}
                            stroke="hsl(200 98.0% 39.4%)"
                            strokeDasharray="3 3"
                        />
                    ))} */}
                    <Tooltip content={<CustomTooltip />} />
                </AreaChart>
            </ResponsiveContainer>

            <div className='flex flex-row items-center justify-center gap-3 mt-3'>
                <div className='flex flex-row items-center gap-1'>
                    <Circle size={8} color='rgb(2 132 199)' fill='rgb(2 132 199)' opacity={0.5} />
                    <span className='text-sky-600 opacity-75'>Wealth</span>
                </div>
                <div className='flex flex-row items-center gap-1'>
                    <Circle size={8} color='rgb(22 163 74)' fill='rgb(22 163 74)' opacity={0.5} />
                    <span className='text-green-600 opacity-75'>Principal</span>
                </div>
            </div>
        </div>
    )
}