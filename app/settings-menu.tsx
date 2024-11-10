"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { signOut } from "next-auth/react";

import { BookA, CircleUserRound, LogOut, Menu, Settings, Sparkles } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import Container from "@/components/ui/container";
import AboutDialog from "@/components/dialogs/about-dialog";
import SettingsDialog from "@/components/dialogs/settings-dialog";
import BillingButton from "./billing-button";

import { getIsGuestFromCookies, removeCookies } from "@/utils/cookies";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import PremiumDialog from "@/components/dialogs/premium-dialog";

export default function SettingsMenu() {
    const { state } = useGlobalContext() as GlobalState;
    const [isGuest, setIsGuest] = useState<boolean>(true);
    const isMobile = useMediaQuery();

    useEffect(() => {
        if (state) {
            setIsGuest(getIsGuestFromCookies());
        }
    }, [state, getIsGuestFromCookies]);

    const onSignOut = async () => {
        // must remove cookies before calling signout
        removeCookies();
        // signout
        await signOut();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className='w-12 flex items-center justify-center pr-3'>
                    <CircleUserRound size={22} />
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent collisionPadding={{ right: 20 }}>
                {/* <AboutDialog>
                    <Button
                        variant='ghost'
                        className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                    >
                        <BookA size={18} strokeWidth={2} />
                        <span className='text-xs'>About</span>
                    </Button>
                </AboutDialog> */}

                {/* <DropdownMenuSeparator className='my-1' /> */}

                <PremiumDialog>
                    <Button
                        variant='ghost'
                        className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                    >
                        <Sparkles size={18} strokeWidth={2} />
                        <span className='text-xs'>Premium</span>
                    </Button>
                </PremiumDialog>

                <BillingButton userId={state?.id} />

                <DropdownMenuSeparator className='' />

                <SettingsDialog>
                    <Button
                        aria-label='email-preferences'
                        variant='ghost'
                        size='sm'
                        className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                    >
                        <Settings size={18} strokeWidth={2} />
                        <span className='text-xs'>Email settings</span>
                    </Button>
                </SettingsDialog>

                <DropdownMenuSeparator className='' />

                <Button
                    title='Logout'
                    aria-label='logout'
                    variant='ghost'
                    onClick={onSignOut}
                    className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                >
                    <LogOut size={16} strokeWidth={2} />
                    <span className='text-xs'>Logout</span>
                </Button>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}