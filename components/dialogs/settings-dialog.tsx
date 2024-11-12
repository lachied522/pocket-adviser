"use client";
import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import Link from "next/link";

const formSchema = z.object({
    email: z.string().min(1, { message: "Please provide your email" }).email("Please provide a valid email"),
    mailFrequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "NEVER"]).optional(),
});

interface SettingsDialogProps {
    children: React.ReactNode
}

export default function SettingsDialog({ children } : SettingsDialogProps) {
    const { state, updateUserAndUpdateState } = useGlobalContext() as GlobalState;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: state.email || '',
            mailFrequency: state.mailFrequency || "NEVER",
        },
    });
    const closeRef = useRef<HTMLButtonElement>(null);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        await updateUserAndUpdateState({
            email: values.email,
            ...(
                values.mailFrequency === "NEVER"? {
                    mailFrequency: null
                } : {
                    mailFrequency: values.mailFrequency
                }
            )
        });
        // close modal
        if (closeRef.current) closeRef.current.click();
        // reset form
        form.reset(values);
        setIsLoading(false);
    }

    return (
        <Dialog>
            <DialogTrigger className='p-0' asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='email'
                                            placeholder='email@example.com'
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="mailFrequency"
                            disabled={!state || state.accountType === "FREE"}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Frequency</FormLabel>
                                    <FormDescription>
                                        How often would you like to receive updates from Pocket Adviser?
                                    </FormDescription>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || "NEVER"} disabled={field.disabled}>
                                        <FormControl>
                                            <SelectTrigger className='w-[180px]'>
                                                <SelectValue placeholder="Never" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className='w-[180px]'>
                                            <SelectItem value="NEVER">Never</SelectItem>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                            <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <div className='h-full flex flex-row items-end justify-between'>
                            <DialogClose asChild>
                                <Button
                                    ref={closeRef}
                                    type='button'
                                    variant='secondary'
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type='submit'
                                disabled={isLoading}
                                className='h-10 flex flex-row items-center gap-2'
                            >
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}