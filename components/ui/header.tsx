"use client";
import { useState, useEffect } from "react";

import { signOut } from "next-auth/react";

import { BookA, LogOut, Mail, Menu, ScrollText, Settings, Sparkles } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import Logo from "@/components/ui/logo";
import Container from "@/components/ui/container";
import AboutDialog from "@/components/modals/about-dialog";
import EmailsDialog from "@/components/modals/emails-dialog";
import PremiumDialog from "@/components/modals/premium-dialog";
import AuthDialog from "@/components/auth/auth-dialog";

import { useCookies } from "@/hooks/useCookies";

import { createBillingPortalSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

export default function Header() {
    const { state } = useGlobalContext() as GlobalState;
    const { isMobile, signupRef } = useUIContext() as UIState;
    const { getIsGuestFromCookies, removeCookies } = useCookies();
    const [isGuest, setIsGuest] = useState<boolean>(true);
    const [isBillingPortalLoading, setIsBillingPortalLoading] = useState<boolean>(false);

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

    const onBillingButtonClick = async () => {
        if (isBillingPortalLoading) return; // prevent multiple requests
        setIsBillingPortalLoading(true);

        // create billing portal session and open in new tab
        const res = await createBillingPortalSession(state!);

        if (!(res && res.url)) {
            // TO DO
            return;
        }

        window.open(res.url, '_blank');
        setIsBillingPortalLoading(false);
    }

    return (
        <Container className='grid grid-cols-[45px_1fr] md:grid-cols-3 items-center px-2 pt-3.5 md:gap-3.5'>
            <Logo />

            <div className='hidden md:flex flex-row items-center justify-center gap-3.5'>
                <AboutDialog>
                    <Button
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 py-0'
                    >
                        About
                    </Button>
                </AboutDialog>

                <PremiumDialog>
                    <Button
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 py-0'
                    >
                        Premium
                    </Button>
                </PremiumDialog>

                <a href="mailto:lachie@pocketadviser.com.au">
                    <Button
                        type='button'
                        variant='ghost'
                        className='h-auto text-white hover:text-white hover:bg-transparent hover:opacity-90 py-0'
                    >
                        Contact
                    </Button>
                </a>
            </div>

            <div className='place-self-end flex flex-row items-center gap-2 md:gap-3.5'>
                {state && !isGuest? (
                <span className='text-sm sm:text-base text-white text-right font-medium'>Welcome {state.name}</span>
                ) : (
                <div className='flex flex-row items-center gap-3.5'>
                    <AuthDialog initialTab="login">
                        <Button
                            variant='outline'
                            className='h-7 md:h-9 px-2 py-1 md:px-4 md:py-2 font-medium bg-transparent text-white'
                        >
                            <span className='text-xs md:text-base'>Login</span>
                        </Button>
                    </AuthDialog>
                    <AuthDialog initialTab="signup">
                        <Button
                            ref={signupRef}
                            variant='secondary'
                            className='h-7 md:h-9 px-2 py-1 md:px-4 md:py-2 font-medium'
                        >
                            <span className='text-xs md:text-base'>Signup</span>
                        </Button>
                    </AuthDialog>
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
                            <Menu size={18} strokeWidth={2} color='white' />
                            ) : (
                            <Settings size={18} strokeWidth={2} color='white' />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-fit flex flex-col justify-center p-2 bg-slate-100'>
                        {state && !isGuest && (
                        <>
                            <Button
                                aria-label='billing'
                                variant='ghost'
                                size='sm'
                                onClick={onBillingButtonClick}
                                className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                            >
                                <ScrollText size={18} strokeWidth={2} />
                                <span className='text-xs'>Billing</span>
                            </Button>

                            <Separator className='my-1' />

                            <EmailsDialog>
                                <Button
                                    aria-label='email-preferences'
                                    variant='ghost'
                                    size='sm'
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <Mail size={18} strokeWidth={2} />
                                    <span className='text-xs'>Email</span>
                                </Button>
                            </EmailsDialog>
                        </>
                        )}

                        {isMobile && state && !isGuest && (
                        <Separator className='my-1' />
                        )}

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

                            <Separator className='my-1' />
                            
                            <a href="mailto:lachie@pocketadviser.com.au">
                                <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <Mail size={18} strokeWidth={2} />
                                    <span className='text-xs'>Contact</span>
                                </Button>
                            </a>
                            
                            {state && !isGuest && (
                            <>
                                <Separator className='my-1' />

                                <Button
                                    title='Logout'
                                    aria-label='logout'
                                    variant='ghost'
                                    size='sm'
                                    onClick={onSignOut}
                                    className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                                >
                                    <LogOut size={18} strokeWidth={2.5} />
                                    <span className='text-xs'>Logout</span>
                                </Button>
                            </>
                            )}
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
                    className='hidden md:flex h-8 w-8 p-0 hover:bg-slate-100/10'
                >
                    <LogOut size={16} strokeWidth={2.5} color='white' />
                </Button>
                )}
            </div>            
        </Container>
    )
}