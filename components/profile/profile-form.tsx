"use client";
import { useState, useCallback, useRef } from "react";
import Image from "next/image";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

import ObjectiveSelector from "./objective-selector";
import PreferencesSelector from "./preferences-selector";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

const formSchema = z.object({
    objective: z.enum(["RETIREMENT", "INCOME", "PRESERVATION", "DEPOSIT", "CHILDREN", "TRADING"]),
    passive: z.number().nullable(),
    international: z.number().nullable(),
    preferences: z.record(
        z.string(),
        z.union([z.literal("like"), z.literal("dislike")]),
    ),
});

export default function ProfileForm() {
    const { state, updateProfileAndUpdateState } = useGlobalContext() as GlobalState;
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: state?.profile?.objective || 'RETIREMENT',
            passive: null, // ignore this field for now
            international: state?.profile?.international || 70,
            preferences: state?.profile?.preferences as Record<string, 'like'|'dislike'> || {},
        },
    });

    const onSave = useCallback(
        async (data: any) => {
            setIsSubmitLoading(true);
            await updateProfileAndUpdateState({ ...data });
            setIsSubmitLoading(false);
            // reset form state to new values
            form.reset(data);
            // close dialog
            if (closeRef.current) closeRef.current.click();
        },
        [form, setIsSubmitLoading, updateProfileAndUpdateState]
    );

    const onCancel = useCallback(
        () => {
            // reset form state to initial values
            form.reset({
                objective: state?.profile?.objective || 'RETIREMENT',
                passive: null, // ignore this field for now
                international: state?.profile?.international || 70,
                preferences: state?.profile?.preferences as Record<string, 'like'|'dislike'> || {},
            });
        },
        [form, setIsSubmitLoading, updateProfileAndUpdateState]
    );

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSave)}
                className='flex flex-col gap-6'
            >
                <ScrollArea className='max-h-[75vh] sm:max-h-[80vh]'>
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
                </ScrollArea>

                <div className='w-full flex flex-row items-end justify-between'>
                    <DialogClose asChild>
                        <Button
                            ref={closeRef}
                            onClick={onCancel}
                            type='button'
                            variant='secondary'
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button
                        type='submit'
                        disabled={isSubmitLoading}
                        className='h-10 flex flex-row items-center gap-2'
                    >
                        Save
                    </Button>
                </div>
            </form>
        </FormProvider>
    )
}