"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { signOut } from "next-auth/react";

import { BookA, LogOut, Menu, Settings, Sparkles } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import Container from "@/components/ui/container";
import AboutDialog from "@/components/dialogs/about-dialog";
import SettingsDialog from "@/components/dialogs/settings-dialog";
import PremiumDialog from "@/components/dialogs/premium-dialog";
import BillingButton from "./billing-button";
import Logo from "./logo";

import { getIsGuestFromCookies, removeCookies } from "@/utils/cookies";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

export default function Header() {
    const { state } = useGlobalContext() as GlobalState;
    const { signupRef } = useUIContext() as UIState;
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
        <Container className='grid grid-cols-[45px_1fr] md:grid-cols-[1fr_minmax(320px,_1fr)_1fr] items-center px-1 sm:px-1 md:px-2 pt-3.5'>
            <Logo />

            <div className='hidden w-[300px] md:flex flex-row items-center justify-center gap-5 mx-auto'>
                <AboutDialog>
                    <Button
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 p-0'
                    >
                        About
                    </Button>
                </AboutDialog>

                <Link href='\pricing' target="_blank">
                    <Button
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 p-0'
                    >
                        Pricing
                    </Button>
                </Link>

                <a href="mailto:lachie@pocketadviser.com.au" className='flex items-center justify-center p-0'>
                    <Button
                        type='button'
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 p-0'
                    >
                        Contact
                    </Button>
                </a>

                <a href="https://pocket-adviser.beehiiv.com/" target="_blank" className='flex items-center justify-center p-0'>
                    <Button
                        type='button'
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 p-0'
                    >
                        Newsletter
                    </Button>
                </a>
            </div>

            <div className='place-self-end flex flex-row items-center gap-3'>
                {state && !isGuest? (
                <div className='text-sm lg:text-base text-white text-right font-medium shrink-0'>Welcome {state.name}</div>
                ) : (
                <div className='flex flex-row items-center gap-3.5'>
                    <Link href='/login'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='h-7 md:h-9 bg-transparent text-white'
                        >
                            <span className='text-xs md:text-sm'>Login</span>
                        </Button>
                    </Link>
                    <Link href='signup'>
                        <Button
                            ref={signupRef}
                            variant='secondary'
                            size='sm'
                            className='h-7 md:h-9'
                        >
                            <span className='text-xs md:text-sm'>Signup</span>
                        </Button>
                    </Link>
                </div>
                )}

                {(isMobile || (state && !isGuest)) &&(
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            title='Settings'
                            aria-label='settings'
                            variant='ghost'
                            className='h-8 w-8 p-0 hover:bg-slate-100/10'
                        >
                            {isMobile ? (
                            <Menu size={20} strokeWidth={2} color='white' />
                            ) : (
                            <Settings size={20} strokeWidth={2} color='white' />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-fit flex flex-col justify-center p-2 bg-slate-100'>
                        {isMobile && (
                        <>
                            <AboutDialog>
                                <Button
                                    variant='ghost'
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <BookA size={18} strokeWidth={2} />
                                    <span className='text-xs'>About</span>
                                </Button>
                            </AboutDialog>

                            <Separator className='my-1' />

                            <PremiumDialog>
                                <Button
                                    variant='ghost'
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <Sparkles size={18} strokeWidth={2} />
                                    <span className='text-xs'>Premium</span>
                                </Button>
                            </PremiumDialog>
                        </>
                        )}

                        {state && !isGuest && (
                        <>
                            {isMobile && <Separator className='my-1' />}

                            <BillingButton userId={state?.id} />

                            <Separator className='my-1' />

                            <SettingsDialog>
                                <Button
                                    aria-label='email-preferences'
                                    variant='ghost'
                                    size='sm'
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <Settings size={18} strokeWidth={2} />
                                    <span className='text-xs'>Settings</span>
                                </Button>
                            </SettingsDialog>
                        </>
                        )}
                    </PopoverContent>
                </Popover>)}

                {state && !isGuest && (
                <Button
                    title='Logout'
                    aria-label='logout'
                    variant='ghost'
                    onClick={onSignOut}
                    className='flex h-8 w-8 p-0 hover:bg-slate-100/10'
                >
                    <LogOut size={16} strokeWidth={2.5} color='white' />
                </Button>
                )}
            </div>            
        </Container>
    )
}