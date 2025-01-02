"use client";
import { useCallback, useEffect, useState } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine,
} from "recharts";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    startingPrincipal: z.coerce.number().min(0),
    monthlyAddition: z.coerce.number().min(0),
    annualGrowthRate: z.coerce.number().min(0),
    years: z.coerce.number().min(0)
});

const chartConfig = {
    wealth: {
        label: "Wealth",
    },
    principal: {
        label: "Principal",
    },
    interest: {
        label: "Interest",
    },
} satisfies ChartConfig;

type DataPoint = {
    year: number
    wealth: number
    principal: number
    interest: number
}

function formatValue(value: number) {
    const million = 1e6;
    const thousand = 1e3;
  
    if (Math.abs(value) >= million) {
      return `$${(value / million).toFixed(0)}m`;
    } else if (Math.abs(value) >= 10 * thousand) {
      return `$${(value / thousand).toFixed(0)}k`;
    } else if (Math.abs(value) >= thousand) {
        return `$${(value / thousand)}k`;
    } else {
      return `$${value.toFixed(0)}`;
    }
}

export default function AnnuityCalculator() {
    const [data, setData] = useState<DataPoint[]>([]);
    const [startingBalance, setStartingBalance] = useState<number>(0);
    const [totalAdditions, setTotalAdditions] = useState<number>(0);
    const [totalInterest, setTotalInterest] = useState<number>(0);
    const [endBalance, setEndBalance] = useState<number>(0);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            startingPrincipal: 100,
            monthlyAddition: 100,
            annualGrowthRate: 10,
            years: 10
        },
    });

    const calculateReturns = useCallback(
        ({ startingPrincipal, monthlyAddition, annualGrowthRate, years }: z.infer<typeof formSchema>) => {
            let _totalAdditions = 0;
            let _totalInterest = 0;

            const _data: DataPoint[] = [];

            const date = new Date();
            let prevValue = startingPrincipal;
            for (let t = 0; t < years * 12; t++) {
                // increment month by one
                date.setMonth(new Date().getMonth() + t);

                const interest = prevValue * (annualGrowthRate / 100) / 12;
                _totalInterest += interest;

                const wealth = t > 0? prevValue + interest + monthlyAddition: startingPrincipal;
                _totalAdditions += monthlyAddition;

                _data.push({
                    year: Math.floor(t / 12),
                    wealth,
                    principal: monthlyAddition * t + startingPrincipal,
                    interest: _totalInterest,
                });

                prevValue = wealth;
            }

            // only take every 12th index
            setData(_data.filter((_, index) => index % 12 == 0));
            setStartingBalance(startingPrincipal);
            setEndBalance(prevValue);
            setTotalInterest(_totalInterest);
            setTotalAdditions(_totalAdditions);
        },
        [setData, setEndBalance]
    );

    // populate returns on first load
    useEffect(() => {
        calculateReturns({
            startingPrincipal: 100,
            monthlyAddition: 100,
            annualGrowthRate: 10,
            years: 10
        });
    }, []);

    return (
        <Form {...form}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 my-6'>
                <form onSubmit={form.handleSubmit(calculateReturns)} className='flex flex-col justify-between gap-2'>
                    <h3 className='font-semibold'>Annuity Calculator</h3>

                    <FormField
                        control={form.control}
                        name="startingPrincipal"
                        render={({ field }) => (
                            <FormItem className='grid grid-cols-[1fr_0.50fr] items-center'>
                                <FormLabel className='text-sm font-normal'>Starting principal ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="monthlyAddition"
                        render={({ field }) => (
                            <FormItem className='grid grid-cols-[1fr_0.50fr] items-center'>
                                <FormLabel className='text-sm font-normal'>Monthly addition ($)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />


                    <FormField
                        control={form.control}
                        name="annualGrowthRate"
                        render={({ field }) => (
                            <FormItem className='grid grid-cols-[1fr_0.50fr] items-center'>
                                <FormLabel className='text-sm font-normal'>Annual growth rate (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="years"
                        render={({ field }) => (
                            <FormItem className='grid grid-cols-[1fr_0.50fr] items-center'>
                                <FormLabel className='text-sm font-normal'>Number of years</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='grid grid-cols-[1fr_0.50fr] items-center gap-2 sm:mt-3'>
                        <Button type="submit" size="sm">
                            Generate
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                form.reset({});
                                calculateReturns({
                                    startingPrincipal: 100,
                                    monthlyAddition: 100,
                                    annualGrowthRate: 10,
                                    years: 10
                                });
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className='flex flex-col gap-2 items-stretch'>
                    <div className='grid grid-cols-[1fr_0.50fr] items-center gap-1 sm:px-3 text-sm'>
                        <div className='col-span-2 mb-3'>
                            <span className='text-base'>Results</span>
                        </div>
                        <span>Starting balance</span>
                        <span>${startingBalance.toLocaleString()}</span>
                        <span>Total additions</span>
                        <span>${totalAdditions.toLocaleString()}</span>
                        <span>Interest earned</span>
                        <span>${totalInterest.toLocaleString()}</span>
                        <span className='font-medium'>End balance</span>
                        <span className='font-medium'>${endBalance.toLocaleString()}</span>
                    </div>

                    <ChartContainer config={chartConfig} className="w-full">
                        <BarChart
                            width={730}
                            height={250}
                            data={data}
                            margin={{ top: 10, right: 0, left: -10, bottom: 0 }}
                            accessibilityLayer
                        >
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent className='pt-0' />} />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Bar
                                stackId="a"
                                dataKey="principal"
                                fill="#0284c7"
                                isAnimationActive
                            />
                            <Bar
                                stackId="a"
                                dataKey="interest"
                                fill="#facc15"
                                isAnimationActive
                            />
                            <Bar
                                dataKey="wealth"
                                fill="#22c55e"
                                isAnimationActive
                            />
                            <YAxis tickFormatter={formatValue} />
                            <XAxis
                                dataKey="year"
                                tickCount={3}
                                interval="equidistantPreserveStart"
                            />
                        </BarChart>
                    </ChartContainer>
                </div>
            </div>
        </Form>
    )
}