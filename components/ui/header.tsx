"use client";
import { useState } from "react";

import { signOut } from "next-auth/react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import Logo from "@/components/ui/logo";
import Container from "@/components/ui/container";
import AboutDialog from "@/components/modals/about-dialog";
import AuthDialog from "@/components/auth/auth-dialog";
import PricingDialog from "@/components/modals/pricing-dialog";

import { useCookies } from "@/hooks/useCookies";

import { createBillingPortalSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

export default function Header() {
    const { state } = useGlobalContext() as GlobalState;
    const { signupRef } = useUIContext() as UIState;
    const { isGuest, removeCookies } = useCookies();
    const [isBillingPortalLoading, setIsBillingPortalLoading] = useState<boolean>(false);

    const onSignOut = async () => {
        // signout
        await signOut();
        // remove cookies
        removeCookies();
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

                <div className="flex flex-row items-center gap-3.5">
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
                            variant='ghost'
                            className='text-white hover:text-white hover:bg-transparent hover:opacity-90'
                        >
                            Pricing
                        </Button>
                    </PricingDialog>
                </div>

                {state && !isGuest ? (
                <div className="flex flex-row items-center gap-3.5">
                    <Text className="text-white">Welcome {state.name}</Text>
                    <Button
                        variant='ghost'
                        onClick={onSignOut}
                        className="h-8 w-8 p-0 group"
                    >
                        <LogOut size={16} strokeWidth={3} className='text-white group-hover:text-red-600' />
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