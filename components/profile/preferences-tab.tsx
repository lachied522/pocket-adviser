"use client";
import { useState } from "react";

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
    objective: z.enum(['RETIREMENT', 'INCOME', 'PRESERVATION', 'FIRSTHOME', 'CHILDREN', 'TRADING']),
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
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: state?.profile?.objective || 'RETIREMENT',
            passive: state?.profile?.passive || 70,
            international: state?.profile?.international || 30,
            preferences: state?.profile?.preferences as Record<string, 'like'|'dislike'> || {},
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        await updateProfileAndUpdateState({
            ...values,
        });
        setIsLoading(false);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-12'>
                <Button
                    ref={submitRef}
                    type='submit'
                    disabled={isLoading}
                    className='hidden'
                >
                    Apply
                </Button>

                <FormField
                    control={form.control}
                    name="objective"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Objective</FormLabel>
                            <FormDescription>
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
                    name="passive"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preference for Passive Investments</FormLabel>
                            <FormDescription>
                                This is the proportion of your portfolio you wish to be invested in ETFs and other passive investments.
                            </FormDescription>
                            <FormControl>
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    defaultValue={[field.value || 50]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    className="w-[240px] cursor-pointer"
                                />
                            </FormControl>
                            <div className="font-semibold">{field.value || 50}</div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="international"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Preference for International Investments</FormLabel>
                            <FormDescription>
                                This is the proportion of your portfolio you wish to be international investments.
                            </FormDescription>
                            <FormControl>
                                <Slider
                                    min={0}
                                    max={100}
                                    step={1}
                                    defaultValue={[field.value || 50]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    className="w-[240px] cursor-pointer"
                                />
                            </FormControl>
                            <div className="font-semibold">{field.value || 50}</div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Likes/Dislikes</FormLabel>
                            <FormDescription>
                                These are any likes or dislikes you may have for the type of investments you want.
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