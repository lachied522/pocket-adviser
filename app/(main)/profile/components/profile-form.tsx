"use client";
import { useState } from "react";
import Link from "next/link";

import { Pencil, ExternalLink } from "lucide-react";

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
import { H3 } from "@/components/ui/typography";

export default function ProfileForm() {
    const { onSave, onCancel } = useProfileContext() as ProfileState;
    const [isEditting, setIsEditting] = useState<boolean>(false);

    return (
        <form onSubmit={onSave} className='w-full max-w-6xl flex flex-col gap-3 mx-auto'>
            <div className='w-full flex flex-col sm:flex-row items-center justify-between gap-3'>
                <div className='flex flex-col gap-2'>
                    <H3>My Profile</H3>
                    <p className='text-sm'>Tell Pocket Adviser about yourself so it can provide accurate suggestions.</p>
                </div>

                <div className='w-full sm:w-auto flex flex-row items-center gap-2'>
                    {isEditting ? (
                    <>
                        <Button
                            type='button'
                            variant='secondary'
                            size='sm'
                            onClick={() => {
                                onCancel();
                                setIsEditting(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type='submit' size='sm'>
                            Save
                        </Button>
                    </>
                    ) : (
                    <>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setIsEditting(true)}
                            className='flex flex-row gap-2 justify-start'
                        >
                            <Pencil size={13} />
                            Edit manually
                        </Button>
                        <Link href='/onboarding/profile'>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                className='flex flex-row gap-2 justify-start'
                            >
                                Take survey
                                <ExternalLink size={13} />
                            </Button>
                        </Link>
                    </>
                    )}
                </div>
            </div>

            <div className='flex-1 flex flex-col gap-3'>
                <Tabs
                    defaultValue="preferences"
                    className="flex-1"
                >
                    <TabsList className='w-full justify-between gap-3 bg-transparent border-b border-zinc-200'>
                        <TabsTrigger value="forecasts" className='hidden sm:flex'>Forecasts</TabsTrigger>
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
            </div>
        </form>
    )
}