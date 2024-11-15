"use client";
import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";

import Finance from "@/components/profile/finance";
import Milestones from "@/components/profile/milestones";
import Preferences from "@/components/profile/preferences";
import RiskTolerance from "@/components/profile/risk-tolerance";
import { formSchema } from "@/components/profile/form-schema";

import { updateProfileAction } from "@/actions/crud/profile";

const TABS = [
    "preferences",
    "risk-tolerance",
    "finance",
    "milestones",
] as const;

function convertDatesToString(values: z.infer<typeof formSchema>) {
    return {
        ...values,
        milestones: values.milestones.map(
            (milestone) => ({
                ...milestone,
                date: milestone.date.toISOString(),
            })
        )
    }
}

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>(TABS[0]);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const session = useSession();
    const router  = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dob: new Date(),
            income: 10_000,
            percentIncomeInvested: 0.10,
            experience: 0,
            riskToleranceQ1: 3,
            riskToleranceQ2: 3,
            riskToleranceQ3: 3,
            riskToleranceQ4: 3,
            targetYield: 0.01,
            international: 0.7,
            preferences: {},
            milestones: [],
        },
    });

    const onSubmit = useCallback(
        async (values: z.infer<typeof formSchema>) => {
            if (!(session && session.data)) return;
            setIsSubmitLoading(true);

            try {
                await updateProfileAction(
                    session.data.user.id,
                    convertDatesToString(values)
                );
                router.replace('/onboarding/portfolio');
            } catch (e) {
                // TO DO:
            }
        }, [session, router, setIsSubmitLoading]
    );

    return (
        <main className='min-h-screen flex items-center justify-center bg-white'>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='w-full max-w-6xl flex flex-col items-stretch justify-center gap-12 p-12 mx-auto'
                >
                    <div className='w-full flex flex-row justify-between'>
                        <div>
                            <H1>Profile</H1>
                            <p className='text-sm'>Tailor your experience by telling Pocket Adviser a little bit about yourself.</p>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => router.push('/onboarding/portfolio')}
                        >
                            Skip
                        </Button>
                    </div>

                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => setActiveTab(value as typeof TABS[number])}
                        defaultValue="preferences"
                        className="w-full"
                    >
                        <TabsList className='h-10'>
                            <TabsTrigger value="preferences" className='h-8'>Preferences</TabsTrigger>
                            <TabsTrigger value="risk-tolerance" className='h-8'>Risk Tolerance</TabsTrigger>
                            <TabsTrigger value="finance" className='h-8'>Finance</TabsTrigger>
                            <TabsTrigger value="milestones" className='h-8'>Milestones</TabsTrigger>
                        </TabsList>

                        <TabsContent value="preferences" className='h-[960px] mt-6 overflow-y-scroll'>
                            <Preferences />
                        </TabsContent>

                        <TabsContent value="risk-tolerance" className='h-[960px] mt-6 overflow-y-scroll'>
                            <RiskTolerance />
                        </TabsContent>

                        <TabsContent value="finance" className='h-[960px] mt-6 overflow-y-scroll'>
                            <Finance />
                        </TabsContent>

                        <TabsContent value="milestones" className='h-[960px] mt-6 overflow-y-scroll'>
                            <Milestones />
                        </TabsContent>
                    </Tabs>

                    <div className='w-full flex flex-row justify-end'>
                        {activeTab === "milestones"? (
                        <Button type="submit" disabled={isSubmitLoading}>
                            Proceed
                        </Button>
                        ) : (
                        <Button
                            type="button"
                            onClick={() => setActiveTab((curr) => TABS[TABS.indexOf(curr) + 1])}
                        >
                            Next
                        </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </main>
    )
}