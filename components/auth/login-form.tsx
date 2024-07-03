"use client";
import { signIn } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    email: z.string({ required_error: "Required" })
      .min(1, "Email is required")
      .email("Invalid email"),
    password: z.string({ required_error: "Required" }).min(1, "Password is required"),
});

interface LoginFormProps {
    onSuccess: () => void
    onNavigateSignup: () => void
}

export default function LoginForm({ onSuccess, onNavigateSignup }: LoginFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSigninWithEmail = async (values: z.infer<typeof formSchema>) => {
        await signIn("credentials", {
            ...values,
            redirect: false,
        });

        // close dialog and reset form
        onSuccess();
        // reset form after 1 sec
        setTimeout(() => form.reset(), 1000);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSigninWithEmail)} className='w-full flex flex-col items-stretch justify-between gap-5'>
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
                    Don&apos;t have an account? <span className="underline text-blue-400 cursor-pointer" onClick={onNavigateSignup}>Signup</span>
                </div>

                <Button
                    type='submit'
                    className='h-10'
                >
                    Login
                </Button>
            </form>
        </Form>
    )
}