"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { motion, AnimatePresence } from "framer-motion";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import PreferencesForm from "./preferences-form";
import { OBJECTIVE_MAP } from "./objectives";

const formSchema = z.object({
    objective: z.enum(["RETIREMENT", "INCOME", "PRESERVATION", "DEPOSIT", "CHILDREN", "TRADING"]),
    passive: z.number().nullable(),
    international: z.number().nullable(),
    preferences: z.record(
        z.string(),
        z.union([z.literal("like"), z.literal("dislike")]),
    ),
});

export default function ProfileTabs() {
    const { state, updateProfileAndUpdateState } = useGlobalContext() as GlobalState;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isApplyButtonVisible, setIsApplyButtonVisible] = useState<boolean>(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: state?.profile?.objective || 'RETIREMENT',
            passive: null, // ignore this field for now
            international: state?.profile?.international || 70,
            preferences: state?.profile?.preferences as Record<string, 'like'|'dislike'> || {},
        },
    });

    const onSubmit = useCallback(
        async (data: any) => {
            setIsSubmitLoading(true);
            await updateProfileAndUpdateState({ ...data });
            setIsSubmitLoading(false);
            // reset form state to new values
            form.reset(data);
        },
        [form, setIsSubmitLoading, updateProfileAndUpdateState]
    );

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='flex flex-col gap-6'
            >
                <div className='lg:h-16 grid grid-cols-2 sm:grid-cols-3 items-center md:gap-2 py-2 lg:py-0'>
                    <div className='flex flex-row items-center gap-2 md:gap-3.5 order-first shrink-0'>
                        <Button
                            type='button'
                            variant='ghost'
                            onClick={() => setIsOpen(!isOpen)}
                            className='h-8 w-8 p-0'
                        >
                            <ChevronDown size={24} strokeWidth={2} className={cn('transition-transform duration-300', isOpen && '-rotate-180')} />
                        </Button>
                        <H3 className=''>My Profile</H3>
                    </div>
                    
                    <div className='hidden md:block'>
                        <AnimatePresence>
                            {!isOpen && (
                            <motion.div
                                key='profile-badges'
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    ease: "easeOut",
                                    duration: 0.32,
                                }}
                                className='flex flex-row items-center justify-center gap-3 xl:gap-6 order-last xl:order-2'
                            >
                                <div className='min-w-[180px] flex flex-col shrink-0 bg-white px-3.5 py-2 border border-slate-100 rounded-xl'>
                                    <span className='text-sm xl:text-base font-medium'>Objective</span>
                                    <span className='text-sm'>{OBJECTIVE_MAP[state?.profile?.objective || "RETIREMENT"].name}</span>
                                </div>

                                <div className='min-w-[180px] flex flex-col shrink-0 bg-white px-3.5 py-2 border border-slate-100 rounded-xl'>
                                    <span className='text-sm xl:text-base font-medium'>Region</span>
                                    <div className='flex flex-row items-center gap-2'>
                                        <Image
                                            src="/us-flag-icon.png"
                                            alt='flag'
                                            height={16}
                                            width={16}
                                        />
                                        <span className='text-sm'>{(state?.profile?.international || 70)}%</span>
                                        <Image
                                            src="/aus-flag-icon.png"
                                            alt='flag'
                                            height={16}
                                            width={16}
                                        />
                                        <span className='text-sm'>{100 - (state?.profile?.international || 70)}%</span>
                                    </div>
                                </div>

                                <div className='min-w-[180px] flex flex-col shrink-0 bg-white px-3.5 py-2 border border-slate-100 rounded-xl'>
                                    <span className='text-sm xl:text-base font-medium'>Preferences</span>
                                    <span className='text-sm'>{Object.keys(state?.profile?.preferences || {}).length}</span>
                                </div>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    
                    <div className='w-full flex flex-row justify-end xl:order-last justify-self-end'>
                        <AnimatePresence>
                            {isOpen && isApplyButtonVisible && (
                            <motion.div
                                key='profile-save-button'
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    ease: "easeOut",
                                    duration: 0.10,
                                }}
                            >
                                <Button
                                    type='submit'
                                    disabled={!form.formState.isDirty || isSubmitLoading}
                                    className='h-7 md:h-9 px-2 py-1 md:px-4 md:py-2'
                                >
                                    {isSubmitLoading? 'Saving': 'Save'}
                                </Button>
                            </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                    <motion.div
                        key='profile-tabs'
                        initial={{ opacity: 0, height: 0, y: -800 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -800 }}
                        transition={{
                            ease: "easeOut",
                            duration: 0.32,
                        }}
                        onAnimationComplete={() => setIsApplyButtonVisible((curr) => !curr)}
                        className='pb-12'
                    >
                        <PreferencesForm />
                    </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </FormProvider>
    )
}