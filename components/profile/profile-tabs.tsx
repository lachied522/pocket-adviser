"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/typography";

import AboutTab from "./about-tab";
import PreferencesTab from "./preferences-tab";

export default function ProfileTabs() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentTab, setCurrentTab] = useState<'about'|'preferences'>('about');

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-row items-center gap-3.5'>
                <Button
                    variant='secondary'
                    onClick={() => setIsOpen(!isOpen)}
                    className='h-8 w-8 p-0'
                >
                    <ChevronDown size={16} className={cn('transition-transform duration-300', isOpen && '-rotate-180')} />
                </Button>

                <H3 className=''>My Profile</H3>
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
                >
                    <div className='flex flex-row gap-3.5 mb-6'>
                        <Button
                            variant={currentTab==='about'? 'default': 'secondary'}
                            onClick={() => setCurrentTab('about')}
                        >
                            About Me
                        </Button>

                        <Button
                            variant={currentTab==='preferences'? 'default': 'secondary'}
                            onClick={() => setCurrentTab('preferences')}
                        >
                            Preferences
                        </Button>
                    </div>

                    {currentTab ==='about' && <AboutTab />}
                    {currentTab ==='preferences' && <PreferencesTab />}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}