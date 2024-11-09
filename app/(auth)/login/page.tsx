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

const formSchema = z.object({
    email: z.string({ required_error: "Required" })
      .min(1, "Email is required")
      .email("Invalid email"),
    password: z.string({ required_error: "Required" }).min(1, "Password is required"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    
    const onSubmit = useCallback(
        async (values: z.infer<typeof formSchema>) => {
            setIsLoading(true);

            const response = await signIn(
                "credentials",
                {
                    ...values,
                    callbackUrl: '/',
                    redirect: true,
                }
            );

            if (response?.error) {
                // Auth.js cannot only provide generic error message
                // see https://github.com/nextauthjs/next-auth/discussions/8999
                form.setError("email", { message: "Email or password incorrect" });
                form.setError("password", { message: "Email or password incorrect" });
                setIsLoading(false);
                return;
            }
        },
        [form, setIsLoading]
    );

    return (
        <main className='min-h-screen flex items-center justify-center bg-slate-50'>
            <div className='w-full max-w-lg flex flex-col gap-6 py-6'>
                <div className='flex flex-col gap-12 p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                    <H1>Login</H1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-stretch justify-between gap-5'>
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

                            <div className='text-sm text-right'>
                                Don&apos;t have an account? <Link href='/signup' className='underline text-blue-400 cursor-pointer'>Signup</Link>
                            </div>

                            <Button
                                type='submit'
                                disabled={isLoading}
                                className='h-10 border border-input shadow-sm'
                            >
                                Login
                            </Button>

                            <Separator />

                            <GoogleSigninButton />
                        </form>
                    </Form>
                </div>
            </div>
        </main>
    )
}