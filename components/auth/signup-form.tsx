"use client";
import { useState, useEffect, useCallback } from "react";

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

const formSchema = z.object({
    name: z.string().optional(),
    email: z.string({ required_error: "Email is required" })
      .min(1, "Email is required")
      .email("Invalid email"),
    password: z.string({ required_error: "Password is required" })
      .min(1, "Password is required")
      .min(8, "Password must be more than 8 characters")
      .max(32, "Password must be less than 32 characters"),
});

interface SignupFormProps {
    onSuccess: (provider: "credentials"|"github"|"google", values: any) => Promise<void>
    onNavigateLogin: () => void
}

export default function SignupForm({ onSuccess, onNavigateLogin }: SignupFormProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
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
            await onSuccess("credentials", {
                ...values,
                redirect: false,
            });

            // reset form after 1 sec
            setTimeout(() => form.reset(), 1000);

            setIsLoading(false);
        },
        [form, setIsLoading, onSuccess]
    );

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='w-full flex flex-col items-stretch justify-between gap-5'>
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Name <span className='text-sm'>(optional)</span>
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

                <div className='text-sm text-right'>
                    Already have an account? <span className="underline text-blue-400 cursor-pointer" onClick={onNavigateLogin}>Login</span>
                </div>

                <Button
                    type='submit'
                    disabled={isLoading}
                    className='h-10'
                >
                    Signup
                </Button>
            </form>
        </Form>
    )
}