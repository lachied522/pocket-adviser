"use client";
import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { H1 } from "@/components/ui/typography";

import GoogleSigninButton from "../components/signin-with-google";
import ContinueAsGuestButton from "../components/continue-as-guest";

const formSchema = z.object({
    name: z.string({ required_error: "Name is required" })
        .min(1, "Name is required")
        .max(64, "Name too long"),
    email: z.string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be more than 8 characters")
        .max(32, "Password must be less than 32 characters"),
    passwordConfirm: z.string({ required_error: "Password is required" })
        .min(1, "Password is required")
})
.refine(({ password, passwordConfirm }) => password === passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"]
});

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            passwordConfirm: '',
        },
    });
    
    const onSubmit = useCallback(
        async (values: z.infer<typeof formSchema>) => {
            setIsLoading(true);

            const response = await fetch('/api/register', {
                method: "POST",
                body: JSON.stringify(values),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                const { error } = await response.json();
                if (error === "User already exists") {
                    form.setError("email", { message: "Email already in use" });
                } else {
                    form.setError("email", { message: "Something went wrong" });
                }
                setIsLoading(false);
                return;
            }

            // sign in with credentials
            await signIn(
                "credentials",
                {
                    ...values,
                    callbackUrl: '/onboarding/profile',
                    redirect: true,
                }
            );
        },
        [form, setIsLoading]
    );

    return (
        <main className='min-h-screen flex items-center justify-center bg-slate-50'>
            <div className='w-full max-w-md p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-stretch justify-between gap-5'>
                        <H1>Signup</H1>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="text"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="passwordConfirm"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Confirm Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='text-sm text-right'>
                            Already have an account? <Link href='/login' className='underline text-blue-400 cursor-pointer'>Login</Link>
                        </div>

                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='h-10 border border-input shadow-sm'
                        >
                            Signup
                        </Button>

                        <Separator />

                        <GoogleSigninButton disabled={isLoading} />

                        <ContinueAsGuestButton disabled={isLoading} />
                    </form>
                </Form>
            </div>
        </main>
    )
}