"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

import { CircleUserRound, LogOut, Settings, Sparkles } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import SettingsDialog from "@/components/dialogs/settings-dialog";
import PremiumDialog from "@/components/dialogs/premium-dialog";
import BillingButton from "./billing-button";

import { removeCookies } from "@/utils/cookies";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

function LogoutButton() {
    return (
        <Button
            title='Logout'
            aria-label='logout'
            variant='ghost'
            onClick={() => {
                // must remove cookies before signout
                removeCookies();
                signOut();
            }}
            className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
        >
            <LogOut size={16} strokeWidth={2} />
            <span className='text-xs'>Logout</span>
        </Button>
    )
}

export default function SettingsMenu() {
    const { state } = useGlobalContext() as GlobalState;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-7 w-7 ml-2'>
                    <CircleUserRound size={18} />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent collisionPadding={{ right: 10 }}>
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
                {state.accountType === "GUEST" ? (
                <>
                    <div className='text-sm p-2'>
                        Logged in as: Guest
                    </div>

                    <DropdownMenuSeparator className='' />

                    <LogoutButton />

                    <DropdownMenuSeparator className='' />

                    <Link href='/signup'>
                        <Button
                            title='Signup'
                            aria-label='signup'
                            variant='ghost'
                            className='w-full font-medium'
                        >
                            Signup
                        </Button>
                    </Link>
                </>
                ) : (
                <>
                    {state.accountType !== "STUDENT" && (
                    <>
                        <PremiumDialog>
                            <Button
                                variant='ghost'
                                className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                            >
                                <Sparkles size={18} strokeWidth={2} />
                                <span className='text-xs'>Premium</span>
                            </Button>
                        </PremiumDialog>

                        <BillingButton />

                        <DropdownMenuSeparator className='' />
                    </>
                    )}

                    <SettingsDialog>
                        <Button
                            aria-label='settings'
                            variant='ghost'
                            size='sm'
                            className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
                        >
                            <Settings size={18} strokeWidth={2} />
                            <span className='text-xs'>Settings</span>
                        </Button>
                    </SettingsDialog>

                    <DropdownMenuSeparator className='' />

                    <LogoutButton />
                </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}