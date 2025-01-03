"use client";
import { useState, useMemo } from "react";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

type Values = {
    personalTaxRate: number
    corporateTaxRate: number
    franking: number
}

const COMPANY_EARNINGS = 1_000;

export default function ImputationCalculator() {
    const [values, setValues] = useState<Values>({
        personalTaxRate: 19,
        corporateTaxRate: 30,
        franking: 100,
    });

    const [dividend, frankingCredit, taxPayable] = useMemo(() => {
        const _dividend = COMPANY_EARNINGS * (1 - values.corporateTaxRate / 100);
        const _frankingCredit = COMPANY_EARNINGS * values.corporateTaxRate / 100 * values.franking / 100;
        const _tax = (_dividend + _frankingCredit) * values.personalTaxRate / 100;
        return [
            _dividend,
            _frankingCredit,
            _tax,
        ]
    }, [values]);

    return (
        <div className='flex flex-col gap-2 my-6'>
            <h3 className='font-semibold'>Imputation Tax Calculator</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6 text-sm'>
                <div className='flex flex-col gap-2'>
                    <div className='grid grid-cols-2 items-center'>
                        <span>Marginal Tax Rate (%)</span>
                        <Select
                            onValueChange={(value) => setValues((curr) => ({ ...curr, personalTaxRate: parseFloat(value) }))}
                            defaultValue={String(values.personalTaxRate)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select one..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">0</SelectItem>
                                <SelectItem value="19">19</SelectItem>
                                <SelectItem value="32.5">32.5</SelectItem>
                                <SelectItem value="37">37</SelectItem>
                                <SelectItem value="45">45</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid grid-cols-2 items-center'>
                        <span>Franking Amount (%)</span>
                        <div className='w-full flex flex-row items-center justify-center gap-3 px-3 py-2 border border-input rounded-md shadow-sm'>
                            <div className='w-8'>{values.franking}%</div>
                            <Slider
                                min={0}
                                max={100}
                                value={[values.franking]}
                                onValueChange={(value) => setValues((curr) => ({ ...curr, franking: value[0] }))}
                                className='w-full'
                            />
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <span>Company Earnings</span>
                    <div className='place-self-end'>${COMPANY_EARNINGS.toLocaleString()}</div>
                    <span>Tax Paid</span>
                    <div className='place-self-end'>${(COMPANY_EARNINGS * values.corporateTaxRate / 100).toLocaleString()}</div>
                    <span>Dividend Paid</span>
                    <div className='place-self-end'>${dividend.toLocaleString()}</div>
                    <span>Franking Credit</span>
                    <div className='place-self-end'>${frankingCredit.toLocaleString()}</div>
                    <span className='font-medium'>Gross Income</span>
                    <div className='place-self-end font-medium'>${(dividend + frankingCredit).toLocaleString()}</div>
                    <span>Tax on Gross Income</span>
                    <div className='place-self-end'>${taxPayable.toLocaleString()}</div>
                    <span className='font-medium'>Tax After Franking Applied</span>
                    <div className='place-self-end font-medium'>${(taxPayable - frankingCredit).toLocaleString()}</div>
                    <span className='font-medium'>Net Income</span>
                    <div className='place-self-end font-medium'>${(dividend - (taxPayable - frankingCredit)).toLocaleString()}</div>
                </div>
            </div>
        </div>
    )
}