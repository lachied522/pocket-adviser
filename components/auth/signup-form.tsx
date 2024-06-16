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
    onNavigateLogin: () => void
}

export default function SignupForm({ onNavigateLogin }: SignupFormProps) {
    const closeRef = useRef<HTMLButtonElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const response = await fetch('/api/register', {
            method: "POST",
            body: JSON.stringify(values),
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((res) => res.json());

        // sign in with credentials
        await signIn("credentials", {
            ...values,
            redirect: false,
        });
        
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

                <div>
                    Already have an account? <span className="underline text-blue-400 cursor-pointer" onClick={onNavigateLogin}>Login</span>
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
                        Signup
                    </Button>
                </div>
            </form>
        </Form>
    )
}