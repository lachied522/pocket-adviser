"use client";
import { useRef } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import DatePicker from "./date-picker";

const formSchema = z.object({
    date: z.date(), // TO DO: add date validation
    target: z.coerce.number().min(0),
    description: z.enum(["holiday", "car", "school", "house", "wedding", "kids", "retirement", "other"]),
});

interface EditMilestoneProps {
    children: React.ReactNode
    initialValues?: z.infer<typeof formSchema>
    onSuccess: (values: z.infer<typeof formSchema>) => void
}

export default function EditMilestone({ children, initialValues, onSuccess }: EditMilestoneProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: (initialValues? {
            ...initialValues,
            date: new Date(initialValues.date),
        }: {
            description: "holiday",
            date: new Date(),
            target: 0,
        }),
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        onSuccess(values);
        // close dialog
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()} // prevent closing dialog on outside click
                className='max-w-2xl'
            >
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-1'>
                        {initialValues? "Edit Milestone": "New Milestone"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form className='flex flex-col gap-6'>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-lg'>Event</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={initialValues?.description}>
                                        <FormControl>
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Select one..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="holiday">🌴 Holiday</SelectItem>
                                            <SelectItem value="car">🚗 New car</SelectItem>
                                            <SelectItem value="school">👩‍🎓 School fees</SelectItem>
                                            <SelectItem value="house">🏠 House deposit</SelectItem>
                                            <SelectItem value="wedding">👰 Wedding</SelectItem>
                                            <SelectItem value="kids">👶 Kids</SelectItem>
                                            <SelectItem value="retirement">🎉 Retirement</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-lg'>Date</FormLabel>
                                    <FormDescription className=''>
                                        The date you will achieve this milestone on.
                                    </FormDescription>
                                    <FormControl>
                                        <DatePicker
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
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className='text-lg'>Target ($)</FormLabel>
                                    <FormDescription className=''>
                                        Target wealth for this milestone.
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            min={0}
                                            step={1_000}
                                            value={field.value || 0}
                                            onChange={field.onChange}
                                            className='w-[180px]'
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='w-full flex flex-row items-end justify-between pt-3'>
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
                                type='button'
                                onClick={form.handleSubmit(onSubmit)}
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