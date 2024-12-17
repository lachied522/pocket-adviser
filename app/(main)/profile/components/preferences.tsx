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
import { Button } from "@/components/ui/button";

import { cn } from "@/components/utils";

// import ObjectiveSelector from "./objective-selector";
import PreferencesSelector from "../../../../components/profile/preferences-selector";

import type { FormValues } from "../../../../components/profile/form-schema";
import ObjectiveSelector from "../../../../components/profile/objective-selector";

export default function Preferences() {
    const form = useFormContext<FormValues>();

    return (
        <div className='flex flex-col gap-3 sm:gap-12 sm:px-2'>
            <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Primary Objective</FormLabel>

                        <FormDescription className='text-xs sm:text-sm text-black'>
                            This is the main thing you wish to achieve by investing.
                        </FormDescription>

                        <FormControl>
                            <ObjectiveSelector value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="targetYield"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Portfolio Yield</FormLabel>

                        <div className='grid grid-cols-1 sm:grid-cols-[1.5fr_0.5fr] items-start gap-2'>
                            <FormDescription className='text-xs sm:text-sm text-black'>
                                Use this to adjust the percent return you wish to make via dividend income.
                                High dividend yields come at the cost of <b>reduced capital growth</b> and may impact your overall return.
                                You should contact a financial adviser if you require advice.
                            </FormDescription>

                            <div className='flex flex-row items-center sm:justify-end justify-self-end gap-2 sm:px-3'>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value === null}
                                        onCheckedChange={(checked: boolean) => field.onChange(checked? null: 0.01)}
                                    />
                                </FormControl>
                                <p className='text-sm text-black'>No preference</p>
                            </div>
                        </div>

                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-3 sm:gap-5 py-5 relative'>
                                <div className='w-4 sm:w-6' />
                                <Slider
                                    min={0.001}
                                    max={0.05}
                                    step={0.001}
                                    value={[field.value ?? 0]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    disabled={field.value === null}
                                    className="w-[160px] sm:w-[240px] cursor-pointer"
                                />
                                <div className="w-4 sm:w-6 text-sm font-semibold">{field.value? (100 * field.value).toFixed(2): "N/A"}%</div>
                                <div className={
                                    cn(
                                        'hidden absolute inset-0',
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
                            <FormDescription className='text-xs sm:text-sm text-black'>
                                Use this to select the proportion of your portfolio you wish to be invested in each country. We currently only cover stocks in US and Australia. 🙂
                            </FormDescription>

                            <div className='flex flex-row items-center sm:justify-end justify-self-end gap-2 sm:px-3'>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value === null}
                                        onCheckedChange={(checked: boolean) => field.onChange(checked? null: 0.50)}
                                    />
                                </FormControl>
                                <p className='text-sm text-black'>No preference</p>
                            </div>
                        </div>

                        <div className='relative'>
                            <FormControl>
                                <div className='flex flex-row items-center justify-center gap-3 sm:gap-5 py-5'>
                                    <div className='h-4 sm:h-6 w-4 sm:w-6 relative'>
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
                                        value={[field.value ?? 0]}
                                        onValueChange={(value: number[]) => field.onChange(value[0])}
                                        disabled={field.value === null}
                                        className="w-[160px] sm:w-[240px] cursor-pointer"
                                    />
                                    <div className="w-4 sm:w-6 text-sm font-semibold">{field.value !== null? (100 * field.value).toFixed(0): "N/A"}%</div>
                                </div>
                            </FormControl>

                            <FormControl>
                                <div className='flex flex-row items-center justify-center gap-3 sm:gap-5 py-5'>
                                    <div className='h-4 sm:h-6 w-4 sm:w-6 relative'>
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
                                        value={[1 - (field.value ?? 1)]}
                                        onValueChange={(value: number[]) => field.onChange(1 - value[0])}
                                        disabled={field.value === null}
                                        className="w-[160px] sm:w-[240px] cursor-pointer"
                                    />
                                    <div className="w-4 sm:w-6 text-sm font-semibold">{field.value !== null? (100 * (1 - field.value)).toFixed(0): "N/A"}%</div>
                                </div>
                            </FormControl>
                            <FormMessage />
                            <div className={
                                cn(
                                    'hidden absolute inset-0',
                                    field.value === null && 'block'
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

                        <div className='grid grid-cols-1 sm:grid-cols-[1.5fr_0.5fr] items-start gap-2'>
                            <FormDescription className='text-xs sm:text-sm text-black'>
                                These are any likes or dislikes you may have for the type of investments you want.
                                Your selections will increase/decrease the likelihood that stocks with these themes will be selected for you.
                            </FormDescription>

                            <div className='flex flex-row items-center sm:justify-end gap-2 sm:px-3'>
                                <FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => field.onChange({})}
                                    >
                                        Reset
                                    </Button>
                                </FormControl>
                            </div>
                        </div>
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