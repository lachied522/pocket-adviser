"use client";
import { useSession, signOut } from "next-auth/react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import AuthDialog from "./auth/auth-dialog";

export default function Header() {
    const { data: session, status } = useSession();
    console.log(session);

    return (
        <div className='flex flex-row items-center justify-between bg-white p-6 border-b shadow-sm'>
            Header

            {session? (
            <div className="flex flex-row items-center gap-3.5">
                Welcome {session.user?.name}
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
    )
}