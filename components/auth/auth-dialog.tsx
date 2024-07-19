"use client";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import SignupForm from "./signup-form";
import LoginForm from "./login-form";

interface GetAdviceDialogProps {
    children: React.ReactNode
    initialTab?: 'login'|'signup'
}

export default function AuthDialog({ children, initialTab }: GetAdviceDialogProps) {
    const [tab, setTab] = useState<'login'|'signup'>(initialTab || 'signup');
    const closeRef = useRef<HTMLButtonElement>(null);

    const onSignin = async (provider: "credentials"|"github"|"google", values?: any) => {
        if (provider === "credentials") {
            await signIn("credentials", {
                ...values,
                redirect: false,
            });
            // refresh page
            window.location.reload();
        } else {
            await signIn(provider);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-sm'>
                <DialogHeader>
                    <DialogTitle>
                        {tab === 'signup'? 'Signup': 'Login'}
                    </DialogTitle>
                </DialogHeader>

                <div className='w-full flex flex-col gap-5 p-x-5'>
                    {tab === 'signup'? (
                    <SignupForm
                        onSuccess={onSignin}
                        onNavigateLogin={() => setTab('login')}
                    />
                    ) : (
                    <LoginForm
                        onSuccess={onSignin}
                        onNavigateSignup={() => setTab('signup')}
                    />
                    )}

                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onSignin("github")}
                        className='h-10 flex flex-row items-center gap-2'
                    >
                        <Image
                            src='/github-mark.png'
                            alt="Github logo"
                            height={18}
                            width={18}
                            sizes="18px"
                        />
                        Signin with Github
                    </Button>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onSignin("google")}
                        className='h-10 flex flex-row items-center gap-2'
                    >
                        <Image
                            src='/google-logo.png'
                            alt="Google logo"
                            height={18}
                            width={18}
                            sizes="18px"
                        />
                        Signin with Google
                    </Button>

                    <DialogClose ref={closeRef} />
                </div>
            </DialogContent>
        </Dialog>
    )
}