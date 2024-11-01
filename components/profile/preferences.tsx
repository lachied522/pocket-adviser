"use client";
import Image from "next/image";

import { useFormContext } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

import { cn } from "@/components/utils";

// import ObjectiveSelector from "./objective-selector";
import PreferencesSelector from "./preferences-selector";

import type { FormValues } from "./form-schema";

export default function Preferences() {
    const form = useFormContext<FormValues>();
    return (
        <div className='flex flex-col gap-6 px-2 mt-6'>
            <h3 className='text-lg font-medium'>Help us understand your investment preferences</h3>

            <FormField
                control={form.control}
                name="targetYield"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Portfolio Yield</FormLabel>

                        <div className='grid grid-cols-1 sm:grid-cols-[1.5fr_0.5fr] items-start gap-2'>
                            <FormDescription className='text-sm text-black'>
                                Use this to adjust the percent return you wish to make via dividend income. 
                                High dividend yields come at the cost of <b>reduced capital growth</b> and may impact your overall return. 
                                You should contact a financial adviser if you require advice.
                            </FormDescription>

                            <div className='flex flex-row items-center sm:justify-end gap-2 sm:px-3'>
                                <FormControl>
                                    <Checkbox
                                        checked={!field.value}
                                        onCheckedChange={(checked: boolean) => field.onChange(checked? null: 0.01)}
                                    />
                                </FormControl>
                                <p className='text-sm text-black'>No preference</p>
                            </div>
                        </div>

                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-5 py-5 relative'>
                                <div className='w-5 sm:w-6' />
                                <Slider
                                    min={0.001}
                                    max={0.05}
                                    step={0.001}
                                    value={[field.value ?? 0.01]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    disabled={!field.value}
                                    className="w-[180px] sm:w-[240px] cursor-pointer"
                                />
                                <div className="w-6 font-semibold">{(100 * (field.value ?? 0.01)).toFixed(2)}%</div>
                                <div className={
                                    cn(
                                        'hidden bg-white opacity-50 absolute inset-0',
                                        !field.value && 'block'
                                    )
                                } />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="international"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Investment Region</FormLabel>

                        <div className='grid grid-cols-1 sm:grid-cols-[1.5fr_0.5fr] items-start gap-2'>
                            <FormDescription className='text-sm text-black'>
                                Use this to select the proportion of your portfolio you wish to be invested in each country. We currently only cover stocks in US and Australia. 🙂
                            </FormDescription>

                            <div className='flex flex-row items-center sm:justify-end gap-2 sm:px-3'>
                                <FormControl>
                                    <Checkbox
                                        checked={!field.value}
                                        onCheckedChange={(checked: boolean) => field.onChange(checked? null: 0.50)}
                                    />
                                </FormControl>
                                <p className='text-sm text-black'>No preference</p>
                            </div>
                        </div>
                        
                        <div className='relative'>
                            <FormControl>
                                <div className='flex flex-row items-center justify-center gap-5 py-5'>
                                    <div className='h-5 sm:h-6 w-5 sm:w-6 relative'>
                                        <Image
                                            src="/us-flag-icon.png"
                                            alt='flag'
                                            fill
                                        />
                                    </div>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={[field.value ?? 0.5]}
                                        onValueChange={(value: number[]) => field.onChange(value[0])}
                                        disabled={!field.value}
                                        className="w-[180px] sm:w-[240px] cursor-pointer"
                                    />
                                    <div className="w-6 font-semibold">{(100 * (field.value ?? 0.5)).toFixed(0)}%</div>
                                </div>
                            </FormControl>

                            <FormControl>
                                <div className='flex flex-row items-center justify-center gap-5 py-5'>
                                    <div className='h-5 sm:h-6 w-5 sm:w-6 relative'>
                                        <Image
                                            src="/aus-flag-icon.png"
                                            alt='flag'
                                            fill
                                        />
                                    </div>
                                    <Slider
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={[1 - (field.value ?? 0.5)]}
                                        onValueChange={(value: number[]) => field.onChange(1 - value[0])}
                                        disabled={!field.value}
                                        className="w-[180px] sm:w-[240px] cursor-pointer"
                                    />
                                    <div className="w-6 font-semibold">{(100 - 100 * (field.value ?? 0.5)).toFixed(0)}%</div>
                                </div>
                            </FormControl>
                            <FormMessage />
                            <div className={
                                cn(
                                    'hidden bg-white opacity-50 absolute inset-0',
                                    !field.value && 'block'
                                )
                            } />
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="preferences"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Likes/Dislikes</FormLabel>
                        <FormDescription className='xl:max-w-[75%] text-sm text-black'>
                            These are any likes or dislikes you may have for the type of investments you want.
                            Your selections will increase/decrease the likelihood that stocks with these themes will be selected for you.
                        </FormDescription>
                        <FormControl>
                            <PreferencesSelector value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    )
}