"use client";
import { useRef } from "react";
import { signIn } from "next-auth/react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    DialogClose,
} from "@/components/ui/dialog";
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
    password: z.string({ required_error: "Required" }),
});

interface LoginFormProps {
    onNavigateSignup: () => void
}

export default function LoginForm({ onNavigateSignup }: LoginFormProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const response = await signIn("credentials", {
            ...values,
            redirect: false,
        });

        // call onSubmit
        // close dialog and reset form
        if (closeRef.current) closeRef.current.click();
    }

    const onClose = () => {
        // reset form after 1 sec
        setTimeout(() => form.reset(), 1000);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='min-h-[360px] flex flex-col gap-6'>
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

                <div>
                    Don&apos;t have an account? <span className="underline text-blue-400 cursor-pointer" onClick={onNavigateSignup}>Signup</span>
                </div>

                <div className='h-full flex flex-row items-end justify-between'>
                    <DialogClose asChild>
                        <Button
                            ref={closeRef}
                            type='button'
                            variant='secondary'
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button type='submit'>
                        Login
                    </Button>
                </div>
            </form>
        </Form>
    )
}