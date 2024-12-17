"use client";
import { useState } from "react";
import Link from "next/link";

import { NotebookPen, Pencil } from "lucide-react";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

import { type ProfileState, useProfileContext } from "../context";

import Preferences from "./preferences";
import Finance from "./finance";
import Milestones from "./milestones";
import RiskTolerance from "./risk-tolerance";
import WealthChart from "./forecast";

export default function ProfileForm() {
    const { onSave, onCancel } = useProfileContext() as ProfileState;
    const [isEditting, setIsEditting] = useState<boolean>(false);

    return (
        <form
            onSubmit={onSave}
            className='flex-1 flex flex-col py-3'
        >
            <div className='w-full flex flex-row items-center justify-end gap-3 py-6'>
                {isEditting ? (
                <>
                    <Button
                        type='button'
                        variant='secondary'
                        onClick={() => {
                            onCancel();
                            setIsEditting(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type='submit'>
                        Save
                    </Button>
                </>
                ) : (
                <>
                    <Link href='/onboarding/profile'>
                        <Button
                            type='button'
                            variant='outline'
                            className='flex flex-row gap-2 justify-start'
                        >
                            <NotebookPen size={16} />
                            Survey
                        </Button>
                    </Link>

                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => setIsEditting(true)}
                        className='flex flex-row gap-2 justify-start'
                    >
                        <Pencil size={16} />
                        Edit manually
                    </Button>
                </>
                )}
            </div>

            <Tabs
                defaultValue="preferences"
                className="flex-1"
            >
                <TabsList className='w-full justify-between gap-3 bg-transparent border-b border-zinc-200'>
                    <TabsTrigger value="forecasts" className=''>Forecasts</TabsTrigger>
                    <TabsTrigger value="preferences" className=''>Preferences</TabsTrigger>
                    <TabsTrigger value="risk-tolerance" className=''>Risk Tolerance</TabsTrigger>
                    <TabsTrigger value="finance" className=''>Finance</TabsTrigger>
                    <TabsTrigger value="milestones" className=''>Milestones</TabsTrigger>
                </TabsList>

                <TabsContent value="forecasts" className='sm:mt-6'>
                    <WealthChart />
                </TabsContent>

                <div className='relative'>
                    {!isEditting && <div className='z-10 absolute inset-0 bg-white opacity-20' />}

                    <TabsContent value="preferences" className='sm:mt-6'>
                        <Preferences />
                    </TabsContent>

                    <TabsContent value="risk-tolerance" className='sm:mt-6'>
                        <RiskTolerance />
                    </TabsContent>

                    <TabsContent value="finance" className='sm:mt-6'>
                        <Finance />
                    </TabsContent>

                    <TabsContent value="milestones" className='sm:mt-6'>
                        <Milestones />
                    </TabsContent>
                </div>
            </Tabs>
        </form>
    )
}