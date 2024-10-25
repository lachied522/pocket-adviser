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

// import ObjectiveSelector from "./objective-selector";
import PreferencesSelector from "./preferences-selector";

import type { FormValues } from "./form-schema";

export default function Preferences() {
    const form = useFormContext<FormValues>();
    return (
        <div className='flex flex-col gap-6 px-2 mt-6'>
            <h3 className='text-lg font-medium'>Help us understand your investment preferences</h3>

            {/* <FormField
                control={form.control}
                name="objective"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Objective</FormLabel>
                        <FormDescription className='text-lg text-black'>
                            This is the main thing you wish to achieve by investing.
                        </FormDescription>
                        <FormControl>
                            <ObjectiveSelector value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            /> */}

            <FormField
                control={form.control}
                name="international"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className='text-base'>Investment Region</FormLabel>
                        <FormDescription className='text-sm text-black'>
                            Use this to select the proportion of your portfolio you wish to be invested in each country. We currently only cover stocks in US and Australia. 🙂
                        </FormDescription>
                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-5 py-5'>
                                <Image
                                    src="/us-flag-icon.png"
                                    alt='flag'
                                    height={24}
                                    width={24}
                                />
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[field.value ?? 50]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    className="w-[240px] cursor-pointer"
                                />
                                <div className="w-6 font-semibold">{field.value ?? 50}%</div>
                            </div>
                        </FormControl>

                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-5 py-5'>
                                <Image
                                    src="/aus-flag-icon.png"
                                    alt='flag'
                                    height={24}
                                    width={24}
                                />
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    value={[100 - (field.value ?? 50)]}
                                    onValueChange={(value: number[]) => field.onChange(100 - value[0])}
                                    className="w-[240px] cursor-pointer"
                                />
                                <div className="w-6 font-semibold">{100 - (field.value ?? 50)}%</div>
                            </div>
                        </FormControl>
                        <FormMessage />
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