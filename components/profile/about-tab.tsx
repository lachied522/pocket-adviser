"use client";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    dob: z.string().optional(),
    country: z.string().nullable(),
    employment: z.string().nullable(),
    salary: z.coerce.number().nullable(),
    assets: z.coerce.number().nullable(),
    borrowing: z.coerce.boolean().nullable(),
    experience: z.coerce.number().nullable(),
    risk_tolerance_q1: z.coerce.number().nullable(),
    risk_tolerance_q2: z.coerce.number().nullable(),
    risk_tolerance_q3: z.coerce.number().nullable(),
    risk_tolerance_q4: z.coerce.number().nullable(),
});

interface AboutTabProps {
}

export default function AboutTab({}: AboutTabProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>

                <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormDescription>
                                This helps us determine which investments are right for you.
                            </FormDescription>
                            <FormControl>
                                <Input
                                    type='date'
                                    className='w-[180px]'
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
                    name="employment"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Employment</FormLabel>
                            <FormDescription>
                                What is your type of employment?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select one..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="unemployed">Unemployed</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="casual">Casual</SelectItem>
                                    <SelectItem value="part-time">Part Time</SelectItem>
                                    <SelectItem value="full-time">Full Time</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                    <SelectItem value="retired">Retired</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Salary</FormLabel>
                            <FormDescription>
                                What proportion of your monthly salary do you usually invest?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select one..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="0">0%</SelectItem>
                                    <SelectItem value="1">1% - 5%</SelectItem>
                                    <SelectItem value="2">5% - 10%</SelectItem>
                                    <SelectItem value="3">10% - 25%</SelectItem>
                                    <SelectItem value="4">25% - 50%</SelectItem>
                                    <SelectItem value="5">50%+</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="assets"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assets</FormLabel>
                            <FormDescription>
                                What proportion of your net worth do your investments make up?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select one..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="0">0% - 10%</SelectItem>
                                    <SelectItem value="1">10% - 25%</SelectItem>
                                    <SelectItem value="2">25% - 50%</SelectItem>
                                    <SelectItem value="3">50% - 75%</SelectItem>
                                    <SelectItem value="4">75%+</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Experience</FormLabel>
                            <FormDescription>
                                How many years&apos; experience do you have investing in stocks?
                            </FormDescription>
                            <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                <FormControl>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select one..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5+</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />

                <div className='flex flex-row justify-end'>
                    <Button type='submit' onClick={() => console.log(form.formState.errors)}>
                        Apply
                    </Button>
                </div>
            </form>
        </Form>
    )
}