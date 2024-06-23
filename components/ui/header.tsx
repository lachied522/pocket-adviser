"use client";
import { useSession, signOut } from "next-auth/react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/typography";
import { Logo } from "@/components/ui/logo";

import AuthDialog from "../auth/auth-dialog";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <div className='bg-sky-600 p-3.5'>
            <div className='container flex flex-row items-center justify-between'>
                <Logo />

                {session? (
                <div className="flex flex-row items-center gap-3.5">
                    <Text className="text-white">Welcome {session.user?.name}</Text>
                    <Button
                        variant='ghost'
                        onClick={() => signOut()}
                        className="h-8 w-8 p-0"
                    >
                        <LogOut size={14} color='red' />
                    </Button>
                </div>
                ) : (
                <div className="flex flex-row items-center gap-3.5">
                    <AuthDialog initialTab="signup">
                        <Button variant='secondary'>
                            Signup
                        </Button>
                    </AuthDialog>
                    <AuthDialog initialTab="login">
                        <Button>
                            Login
                        </Button>
                    </AuthDialog>
                </div>
                )}
            </div>
        </div>
    )
}