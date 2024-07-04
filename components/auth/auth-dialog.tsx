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

export default function SignupDialog({ children, initialTab }: GetAdviceDialogProps) {
    const [tab, setTab] = useState<'login'|'signup'>(initialTab || 'signup');
    const closeRef = useRef<HTMLButtonElement>(null);

    const onClose = () => {
        if (closeRef.current) closeRef.current.click();
    }

    const onSigninWithOAuth = async (provider: "github"|"google") => {
        await signIn(provider);
        // close dialog and reset form
        onClose();
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
                        onSuccess={onClose}
                        onNavigateLogin={() => setTab('login')}
                    />
                    ) : (
                    <LoginForm
                        onSuccess={onClose}
                        onNavigateSignup={() => setTab('signup')}
                    />
                    )}

                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => onSigninWithOAuth("github")}
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
                        onClick={() => onSigninWithOAuth("google")}
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