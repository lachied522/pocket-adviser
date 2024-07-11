"use client";
import { useRef, useState } from "react";
import Image from "next/image";

import { motion, AnimatePresence } from "framer-motion";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

// import AboutTab from "./about-tab";
import PreferencesTab from "./preferences-tab";
import { OBJECTIVE_MAP } from "./objectives";

export default function ProfileTabs() {
    const { state } = useGlobalContext() as GlobalState;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isApplyButtonVisible, setIsApplyButtonVisible] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    // const [currentTab, setCurrentTab] = useState<'about'|'preferences'>('about');
    const submitRef = useRef<HTMLButtonElement>(null);

    const onSubmit = () => {
        if (submitRef.current) submitRef.current.click();
    }

    return (
        <div className='flex flex-col gap-6'>
            <div className='lg:h-16 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 py-2 lg:py-0'>
                <div className='flex flex-row items-center gap-3.5 order-first shrink-0'>
                    <Button
                        variant='ghost'
                        onClick={() => setIsOpen(!isOpen)}
                        className='h-8 w-8 p-0'
                    >
                        <ChevronDown size={24} strokeWidth={2} className={cn('transition-transform duration-300', isOpen && '-rotate-180')} />
                    </Button>
                    <H3 className=''>My Profile</H3>
                </div>
                
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
                        className='hidden md:flex flex-row items-center gap-3 xl:gap-6 order-last xl:order-2'
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
                
                <div className='w-full lg:w-[160px] flex flex-row justify-end xl:order-last'>
                    <AnimatePresence>
                        {isOpen && isApplyButtonVisible && (
                        <motion.div
                            key='profile-apply-button'
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
                                onClick={onSubmit}
                            >
                                Save
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
                    <PreferencesTab submitRef={submitRef} />
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}