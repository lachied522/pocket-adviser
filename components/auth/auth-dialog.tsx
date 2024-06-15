"use client";
import { useState, useRef } from "react";
import { signIn } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import SignupForm from "./signup-form";
import LoginForm from "./login-form";

interface GetAdviceDialogProps {
    children: React.ReactNode
    initialTab?: 'login'|'signup'
}

export default function SignupDialog({ children, initialTab }: GetAdviceDialogProps) {
    const [tab, setTab] = useState<'login'|'signup'>(initialTab || 'signup');
    const closeRef = useRef<HTMLButtonElement>(null);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="min-w-[720px]">
                <DialogHeader>
                    <DialogTitle>
                        {tab === 'signup'? 'Sign up to save your data!': 'Login'}
                    </DialogTitle>
                </DialogHeader>

                {tab === 'signup'? (
                <SignupForm
                    onNavigateLogin={() => setTab('login')}
                />
                ) : (
                <LoginForm
                    onNavigateSignup={() => setTab('signup')}
                />
                )}
            </DialogContent>
        </Dialog>
    )
}