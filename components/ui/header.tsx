"use client";
import { useState } from "react";

import { signOut } from "next-auth/react";

import { LogOut, Mail, ScrollText, Settings } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";

import Logo from "@/components/ui/logo";
import Container from "@/components/ui/container";
import AboutDialog from "@/components/modals/about-dialog";
import PricingDialog from "@/components/modals/pricing-dialog";
import EmailsDialog from "@/components/modals/emails-dialog";
import AuthDialog from "@/components/auth/auth-dialog";

import { useCookies } from "@/hooks/useCookies";

import { createBillingPortalSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

export default function Header() {
    const { state } = useGlobalContext() as GlobalState;
    const { signupRef, pricingRef } = useUIContext() as UIState;
    const { isGuest, removeCookies } = useCookies();
    const [isBillingPortalLoading, setIsBillingPortalLoading] = useState<boolean>(false);

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
        <div className='bg-sky-600/80 p-3.5'>
            <Container className='flex flex-row items-center justify-between'>
                <Logo />

                {/* TO DO: add a dropdown menu for these items */}
                <div className="hidden md:flex flex-row items-center gap-3.5">
                    <AboutDialog>
                        <Button
                            variant='ghost'
                            className='text-white hover:text-white hover:bg-transparent hover:opacity-90'
                        >
                            About
                        </Button>
                    </AboutDialog>

                    <PricingDialog>
                        <Button
                            ref={pricingRef}
                            variant='ghost'
                            className='text-white hover:text-white hover:bg-transparent hover:opacity-90'
                        >
                            Pricing
                        </Button>
                    </PricingDialog>

                    <a href="mailto:lachie@pocketadviser.com.au">
                        <Button
                            type='button'
                            variant='ghost'
                            className='text-white hover:text-white hover:bg-transparent hover:opacity-90'
                        >
                            Contact
                        </Button>
                    </a>
                </div>

                {state && !isGuest ? (
                <div className="flex flex-row items-center gap-3.5">
                    <Text className="text-white mr-2">Welcome {state.name}</Text>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                title='Settings'
                                aria-label='settings'
                                variant='ghost'
                                className='h-8 w-8 p-0 hover:bg-slate-100/10'
                            >
                                <Settings size={18} strokeWidth={2} color='white' />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-fit flex flex-col p-2 bg-slate-100'>
                            <Button
                                aria-label='billing'
                                variant='ghost'
                                size='sm'
                                onClick={onBillingButtonClick}
                                className='h-[42px] w-full flex font-medium justify-start gap-2'
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
                                    className='h-[42px] flex font-medium justify-start gap-2'
                                >
                                    <Mail size={16} strokeWidth={2} />
                                    <span className='text-xs'>Email</span>
                                </Button>
                            </EmailsDialog>
                        </PopoverContent>
                    </Popover>
                    <Button
                        title='Logout'
                        aria-label='logout'
                        variant='ghost'
                        onClick={onSignOut}
                        className="h-8 w-8 p-0 hover:bg-slate-100/10"
                    >
                        <LogOut size={16} strokeWidth={2.5} color='white' />
                    </Button>
                </div>
                ) : (
                <div className="flex flex-row items-center gap-3.5">
                    <AuthDialog initialTab="login">
                        <Button
                            variant='outline'
                            className='font-medium bg-transparent text-white'
                        >
                            Login
                        </Button>
                    </AuthDialog>
                    <AuthDialog initialTab="signup">
                        <Button
                            ref={signupRef}
                            variant='secondary'
                            className='font-medium'
                        >
                            Signup
                        </Button>
                    </AuthDialog>
                </div>
                )}
            </Container>
        </div>
    )
}