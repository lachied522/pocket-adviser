"use client";
import { useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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
    email: z.string({ required_error: "Required" })
      .min(1, "Email is required")
      .email("Invalid email"),
    password: z.string({ required_error: "Required" }).min(1, "Password is required"),
});

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
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
                    redirect: false,
                }
            );

            if (!response) {
                form.setError("email", { message: "Something went wrong, please try again later" });
                setIsLoading(false);
                return;
            }

            if (response.error) {
                // Auth.js cannot only provide generic error message
                // see https://github.com/nextauthjs/next-auth/discussions/8999
                // potential solution https://github.com/nextauthjs/next-auth/pull/9871
                form.setError("email", { message: "Email or password incorrect" });
                form.setError("password", { message: "Email or password incorrect" });
                setIsLoading(false);
                return;
            }

            router.replace(response.url || '/');
        },
        [form, router, setIsLoading]
    );

    return (
        <main className='min-h-screen flex items-center justify-center bg-slate-50'>
            <div className='w-full max-w-md p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-stretch justify-between gap-5'>
                        <H1>Login</H1>

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

                        <GoogleSigninButton disabled={isLoading} />

                        <ContinueAsGuestButton disabled={isLoading} />
                    </form>
                </Form>
            </div>
        </main>
    )
}