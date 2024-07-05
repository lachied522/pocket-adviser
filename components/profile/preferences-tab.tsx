"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import ObjectiveSelector from "./objective-selector";
import PreferencesSelector from "./preferences-selector";

const formSchema = z.object({
    objective: z.enum(["RETIREMENT", "INCOME", "PRESERVATION", "DEPOSIT", "CHILDREN", "TRADING"]),
    passive: z.number().nullable(),
    international: z.number().nullable(),
    preferences: z.record(
        z.string(),
        z.union([z.literal("like"), z.literal("dislike")]),
    ),
});

interface PreferenceTabProps {
    submitRef: React.RefObject<HTMLButtonElement>
}

export default function PreferencesTab({ submitRef }: PreferenceTabProps) {
    const { state, updateProfileAndUpdateState } = useGlobalContext() as GlobalState;
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: state?.profile?.objective || 'RETIREMENT',
            passive: null, // ignore this field for now
            international: state?.profile?.international || 70,
            preferences: state?.profile?.preferences as Record<string, 'like'|'dislike'> || {},
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        await updateProfileAndUpdateState({
            ...values,
        });
        setIsLoading(false);
        setIsDirty(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-12'>
                {/* Hidden submit button */}
                <Button
                    ref={submitRef}
                    type='submit'
                    disabled={isLoading}
                    className='hidden'
                />

                <p className='text-lg'>Tell Pocket Adviser your preferences so that it can provide personalised responses.</p>

                <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-lg'>Objective</FormLabel>
                            <FormDescription className='text-lg text-black'>
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
                    name="international"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className='text-lg'>Investment Region</FormLabel>
                            <FormDescription className='text-lg text-black'>
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
                            <FormLabel className='text-lg'>Likes/Dislikes</FormLabel>
                            <FormDescription className='xl:max-w-[75%] text-lg text-black'>
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
            </form>
        </Form>
    )
}