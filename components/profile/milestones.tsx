"use client";
import { useState, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { format, setISODay } from "date-fns";

import { Check, CircleAlert, Pencil, Plus, Trash2, X } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

import NewMilestoneDialog from "./edit-milestone";

import type { FormValues } from "./form-schema";
import EditMilestone from "./edit-milestone";

const MILESTONE_MAP = {
    "holiday": "🌴 Holiday",
    "car": "🚗 New car",
    "school": "👩‍🎓 School fees",
    "house": "🏠 House deposit",
    "wedding": "👰 Wedding",
    "kids": "👶 Kids",
    "retirement": "🎉 Retirement",
    "other": "Other",
} as const;

interface MilestonesProps {
    wealthData?: {
        year: number;
        wealth: number;
        principal: number;
    }[]
}

export default function Milestones({ wealthData = [] }: MilestonesProps) {
    const form = useFormContext<FormValues>();
    const milestones = form.watch("milestones") || [];

    const addMilestone = useCallback(
        (values: typeof milestones[number]) => {
            form.setValue('milestones', [...milestones, values]);
        },
        [form, milestones]
    );

    const editMilestone = useCallback(
        (values: typeof milestones[number], index: number) => {
            const _milestones = milestones; // create copy of milestones array
            _milestones[index] = values; // update values at index
            form.setValue('milestones', _milestones);
        },
        [form, milestones]
    );

    return (
        <div className='flex flex-col items-stretch gap-6 px-2'>
            <div className='flex flex-row items-center justify-between'>
                <FormLabel className='text-lg'>Milestones</FormLabel>

                <NewMilestoneDialog
                    onSuccess={addMilestone}
                >
                    <Button
                        type='button'
                        variant='outline'
                        className='flex flex-row gap-2 justify-start font-medium py-3 border border-neutral-600'
                    >
                        <Plus size={16} />
                        New milestone
                    </Button>
                </NewMilestoneDialog>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-slate-50'>
                            <TableHead className=''/> { /* placeholder */ }
                            <TableHead className='py-3.5 font-medium text-center'>
                                Date
                            </TableHead>
                            <TableHead className='py-3.5 font-medium text-center'>
                                Milestone
                            </TableHead>
                            <TableHead className='py-3.5 font-medium text-center'>
                                Target
                            </TableHead>
                            <TableHead className='py-3.5 font-medium text-center'>
                                Edit/Delete
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {milestones.length > 0? (
                        <>
                            {milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone, i) => (
                            <TableRow key={`milestone-${i}`}>
                                <TableCell className='p-3 md:p-6'>
                                    {
                                        wealthData.filter((d) => d.year === new Date(milestone.date).getFullYear())
                                        .map((d, _) => (
                                            <>
                                                {d.wealth < 100 && (
                                                <HoverCard key={'alert'}>
                                                    <HoverCardTrigger>
                                                        <CircleAlert size={18} color='rgb(220 38 38)' />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side='top'>
                                                        This milestone may not be achievable based on your profile
                                                    </HoverCardContent>
                                                </HoverCard>
                                                )}
                                            </>
                                        ))
                                    }
                                </TableCell>
                                <TableCell className='font-medium text-xs md:text-base text-center p-3 line-clamp-1'>
                                    {format(milestone.date, 'MMM do, Y')}
                                </TableCell>
                                <TableCell className='font-medium text-xs md:text-base text-center p-3'>
                                    {MILESTONE_MAP[milestone.description]}
                                </TableCell>
                                <TableCell className='font-medium text-xs md:text-base text-center p-3'>
                                    ${milestone.target.toLocaleString()}
                                </TableCell>
                                <TableCell className='flex flex-row items-center justify-center gap-1 p-3'>
                                    <EditMilestone
                                        initialValues={milestone}
                                        onSuccess={(values) => editMilestone(values, i)}
                                    >
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className='h-8 md:h-10 w-8 md:w-10 p-0'
                                        >
                                            <Pencil size={18} />
                                        </Button>
                                    </EditMilestone>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className='h-8 md:h-10 w-8 md:w-10 p-0'
                                        onClick={() => form.setValue("milestones", milestones.filter((m) => m != milestone))}
                                    >
                                        <Trash2 size={18} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </>
                        ) : (
                        <TableRow>
                            <TableCell colSpan={5} className='h-[240px] sm:h-[360px] text-center'>
                                <span>No milestones yet.</span>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}