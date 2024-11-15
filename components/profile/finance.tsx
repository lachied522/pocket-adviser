"use client";
import { useFormContext } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

import DOBPicker from "./dob-picker";

import type { FormValues } from "./form-schema";

export default function Finance() {
    const form = useFormContext<FormValues>();
    return (
        <div className='flex flex-col gap-12 px-2'>
            <h3 className='text-lg font-medium'>Help us understand your financial situation</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
                {/* <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-base'>Date of Birth</FormLabel>
                            <FormControl>
                                <DOBPicker
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                /> */}

                <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-base'>Income</FormLabel>
                            <FormDescription className='text-sm text-black'>
                                What is your approximate annual income?
                            </FormDescription>
                            <FormControl>
                                <Input
                                    type='number'
                                    min={0}
                                    step={10_000}
                                    value={field.value || 0}
                                    onChange={field.onChange}
                                    className='w-[180px]'
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="percentIncomeInvested"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-base'>Investment Amount</FormLabel>
                            <FormDescription className='text-sm text-black'>
                                What proportion of your income to expect to invest?
                            </FormDescription>
                            <FormControl>
                                <div className='flex flex-row items-center gap-3 py-3'>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.05}
                                        value={[field.value ?? 0.5]}
                                        onValueChange={(value: number[]) => field.onChange(value[0])}
                                        className="w-[240px] cursor-pointer"
                                    />
                                    <div className="w-6 font-semibold">{(100 * (field.value ?? 0.5)).toFixed(0)}%</div>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-base'>Experience</FormLabel>
                            <FormDescription className='text-sm text-black'>
                                How many years&apos; experience do you have investing in stocks?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select one..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5+</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                /> */}
            </div>
        </div>
    )
}