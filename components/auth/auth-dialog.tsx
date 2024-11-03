"use client";
import { useState, useCallback, useRef } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import SignupForm from "./signup-form";
import LoginForm from "./login-form";

interface AuthDialogProps {
    children: React.ReactNode
    initialTab?: 'login'|'signup'
}

export default function AuthDialog({ children, initialTab }: AuthDialogProps) {
    const [tab, setTab] = useState<'login'|'signup'>(initialTab || 'signup');
    const [loginError, setLoginError] = useState<string|null>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const onSignin = useCallback(
        async (provider: "credentials"|"github"|"google", values?: any) => {
            setLoginError(null);

            if (provider === "credentials") {
                const response = await signIn("credentials", {
                    ...values,
                    redirect: false,
                });

                if (!response) {
                    setLoginError("Something went wrong");
                    return;
                }

                if (response.error) {
                    // Auth.js cannot only provide generic error message
                    // see https://github.com/nextauthjs/next-auth/discussions/8999
                    setLoginError("Email or password incorrect");
                    return;
                }

                // success - reload page
                window.location.reload();
            } else {
                await signIn(provider);
            }
        },
        [setLoginError]
    );

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
                        loginError={loginError}
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