"use client";
import { useState, useMemo } from "react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ReferenceLine,
} from "recharts";

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";

const TOTAL_ASSETS = 10_000;

type Values = {
    debtToAssets: number
    returnOnAssets: number
    interestRate: number
}

export default function DebtFinancingExample() {
    const [values, setValues] = useState<Values>({
        debtToAssets: 10,
        returnOnAssets: 7,
        interestRate: 5
    });

    const [interestExpense, incomeBeforeTax, tax, netIncome, returnOnEquity] = useMemo(() => {
        const { debtToAssets, returnOnAssets, interestRate } = values;
        const _interestExpense = TOTAL_ASSETS * debtToAssets / 100 * interestRate / 100;
        const _incomeBeforeTax = TOTAL_ASSETS * returnOnAssets / 100 - _interestExpense;
        const _tax = _incomeBeforeTax > 0? 0.30 * _incomeBeforeTax: 0;
        const _netIncome = _incomeBeforeTax - _tax;
        const _returnOnEquity = _netIncome / (TOTAL_ASSETS * (1 - debtToAssets / 100));
        return [
            _interestExpense,
            _incomeBeforeTax,
            _tax,
            _netIncome,
            _returnOnEquity,
        ]
    }, [values]);

    return (
        <div className='flex flex-col gap-2 my-6'>
            <h3 className='font-semibold'>Debt vs. Equity Financing</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm'>
                <div className='grid grid-cols-2 items-center gap-2 sm:gap-6 xl:px-3'>
                    <div className='shrink-0'>Debt to Equity Ratio (%)</div>
                    <div className='w-full flex flex-row items-center justify-center gap-3 px-3 py-2 border border-input rounded-md shadow-sm'>
                        <Slider
                            min={0}
                            max={99}
                            value={[values.debtToAssets]}
                            onValueChange={(value) => setValues((curr) => ({ ...curr, debtToAssets: value[0] }))}
                            className='w-full'
                        />
                        <div className='w-6'>{values.debtToAssets.toLocaleString()}%</div>
                    </div>

                    <div className='shrink-0'>Return on Assets (%)</div>
                    <div className='w-full flex flex-row items-center justify-center gap-3 px-3 py-2 border border-input rounded-md shadow-sm'>
                        <Slider
                            min={0}
                            max={20}
                            value={[values.returnOnAssets]}
                            onValueChange={(value) => setValues((curr) => ({ ...curr, returnOnAssets: value[0] }))}
                            className='w-full'
                        />
                        <div className='w-6'>{values.returnOnAssets.toLocaleString()}%</div>
                    </div>

                    <div className='shrink-0'>Interest Rate (%)</div>
                    <div className='w-full flex flex-row items-center justify-center gap-3 px-3 py-2 border border-input rounded-md shadow-sm'>
                        <Slider
                            min={0}
                            max={20}
                            value={[values.interestRate]}
                            onValueChange={(value) => setValues((curr) => ({ ...curr, interestRate: value[0] }))}
                            className='w-full'
                        />
                        <div className='w-6'>{values.interestRate.toLocaleString()}%</div>
                    </div>
                </div>

                
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-zinc-50'>
                            <TableHead />
                            <TableHead className='font-bold'>
                                Equity Financing
                            </TableHead>
                            <TableHead className='font-bold'>
                                Debt Financing
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <span className='font-medium'>Balance Sheet</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Equity</TableCell>
                            <TableCell>${TOTAL_ASSETS.toLocaleString()}</TableCell>
                            <TableCell>${(TOTAL_ASSETS * (1 - values.debtToAssets / 100)).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Debt</TableCell>
                            <TableCell>$0</TableCell>
                            <TableCell>${(TOTAL_ASSETS * values.debtToAssets / 100).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Assets</TableCell>
                            <TableCell>${TOTAL_ASSETS.toLocaleString()}</TableCell>
                            <TableCell>${TOTAL_ASSETS.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3}>
                                <span className='font-medium'>Income Statement</span>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Revenue</TableCell>
                            <TableCell>${(TOTAL_ASSETS * values.returnOnAssets / 100).toLocaleString()}</TableCell>
                            <TableCell>${(TOTAL_ASSETS * values.returnOnAssets / 100).toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Interest Expense</TableCell>
                            <TableCell>$0</TableCell>
                            <TableCell>${interestExpense.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Income Before Tax</TableCell>
                            <TableCell>${(TOTAL_ASSETS * values.returnOnAssets / 100).toLocaleString()}</TableCell>
                            <TableCell>${incomeBeforeTax.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Tax @ 30%</TableCell>
                            <TableCell>${(0.30 * TOTAL_ASSETS * values.returnOnAssets / 100).toLocaleString()}</TableCell>
                            <TableCell>${tax.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Net Income</TableCell>
                            <TableCell>${(0.70 * TOTAL_ASSETS * values.returnOnAssets / 100).toLocaleString()}</TableCell>
                            <TableCell>${netIncome.toLocaleString()}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className='font-medium'>Return on Equity</TableCell>
                            <TableCell className='font-medium'>{(0.70 * values.returnOnAssets).toLocaleString()}%</TableCell>
                            <TableCell className='font-medium'>{(100 * returnOnEquity).toLocaleString()}%</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            </div>
        </div>
    )
}