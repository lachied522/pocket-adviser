"use client";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import WealthChart from "./wealth-chart";
import Preferences from "./preferences";
import Finance from "./finance";
import MilestonesForm from "./milestones";
import RiskTolerance from "./risk-tolerance";

import { formSchema } from "./form-schema";

const TABS = [
    "Preferences",
    "Risk Tolerance",
    "Finance",
    "Milestones",
] as const;

// constants for forecasting wealth
const MARKET_RISK_PREMIUM = 0.05;
const RISK_FREE_RATE = 0.05;

interface ProfileDialogProps {
    children: React.ReactNode
}

export default function ProfileDialog({ children }: ProfileDialogProps) {
    const { state, calcPortfolioValue, updateProfileAndUpdateState } = useGlobalContext() as GlobalState;
    const [startingValue, setStartingValue] = useState<number>(0);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<typeof TABS[number]>(TABS[0]);
    const closeRef = useRef<HTMLButtonElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dob: state.profile?.dob ?? new Date(),
            income: state.profile?.income ?? 0,
            percentIncomeInvested: state.profile?.percentIncomeInvested ?? 0.10,
            experience: state.profile?.experience ?? 0,
            riskToleranceQ1: state.profile?.riskToleranceQ1 ?? 3,
            riskToleranceQ2: state.profile?.riskToleranceQ2 ?? 3,
            riskToleranceQ3: state.profile?.riskToleranceQ3 ?? 3,
            riskToleranceQ4: state.profile?.riskToleranceQ4 ?? 3,
            targetYield: state.profile?.targetYield ?? 0.01,
            international: state.profile?.international ?? 0.7,
            preferences: state.profile?.preferences as Record<string, 'like'|'dislike'> ?? {},
            milestones: state.profile?.milestones as any ?? [], // TO DO: type this properly
        },
    });
    const income = form.watch("income") ?? 0;
    const percentIncomeInvested = form.watch("percentIncomeInvested") ?? 0.10;
    const targetYield = form.watch("targetYield") ?? 0.01;
    const riskToleranceQ1 = form.watch("riskToleranceQ1") ?? 3;
    const riskToleranceQ2 = form.watch("riskToleranceQ2") ?? 3;
    const riskToleranceQ3 = form.watch("riskToleranceQ3") ?? 3;
    const riskToleranceQ4 = form.watch("riskToleranceQ4") ?? 3;
    const milestones = form.watch("milestones") ?? [];

    // useEffect(() => {
    //     (async function updateStartingValue() {
    //         setStartingValue(await calcPortfolioValue());
    //     })();
    // }, []);

    const expectedReturn = useMemo(() => {
        // use CAPM model to calculate expected return based on risk tolerance
        const riskScore = (
            Number(riskToleranceQ1) +
            Number(riskToleranceQ2) +
            Number(riskToleranceQ3) +
            Number(riskToleranceQ4)
        ) / 4;

        return RISK_FREE_RATE + MARKET_RISK_PREMIUM * (0.25 * (riskScore - 3) + 0.75);
    }, [riskToleranceQ1, riskToleranceQ2, riskToleranceQ3, riskToleranceQ4]);

    const wealthData = useMemo(() => {
        const annualContribution = percentIncomeInvested * income;

        console.log(startingValue);
        
        const _data = [];
        const date = new Date();
        let prevValue = startingValue;
        for (let t = 0; t < 100; t++) {
            date.setFullYear(new Date().getFullYear() + t);
            
            let wealth = t > 0? prevValue * (1 + expectedReturn) + annualContribution: startingValue;
            // adjust wealth for any milestones during year
            for (const obj of milestones) {
                if (new Date(obj.date).getFullYear() === date.getFullYear()) {
                    wealth -= obj.target;
                }
            }

            // ensure wealth is positive
            wealth = Math.max(wealth, 0);

            const principal = annualContribution * t + startingValue;
            const income = targetYield * wealth;

            _data.push({
                year: date.getFullYear(),
                wealth,
                income,
                principal,
            });
            prevValue = wealth;
        }

        return _data;
    }, [income, percentIncomeInvested, expectedReturn, startingValue, targetYield, milestones]);

    const onSave = useCallback(
        async (data: any) => {
            setIsSubmitLoading(true);
            await updateProfileAndUpdateState({ ...data });
            setIsSubmitLoading(false);
            // reset form state to new values
            form.reset(data);
            // close dialog
            if (closeRef.current) closeRef.current.click();
        },
        [form, setIsSubmitLoading, updateProfileAndUpdateState]
    );

    const onCancel = useCallback(
        () => {
            // reset form state to initial values
            form.reset({
                dob: state.profile?.dob ?? new Date(),
                income: state.profile?.income ?? 0,
                percentIncomeInvested: state.profile?.percentIncomeInvested ?? 0.10,
                experience: state.profile?.experience ?? 0,
                riskToleranceQ1: state.profile?.riskToleranceQ1 ?? 3,
                riskToleranceQ2: state.profile?.riskToleranceQ2 ?? 3,
                riskToleranceQ3: state.profile?.riskToleranceQ3 ?? 3,
                riskToleranceQ4: state.profile?.riskToleranceQ4 ?? 3,
                targetYield: state.profile?.targetYield ?? 0.01,
                international: state.profile?.international ?? 0.7,
                preferences: state.profile?.preferences as Record<string, 'like'|'dislike'> ?? {},
                milestones: state.profile?.milestones as any ?? [],
            });
        },
        [form, state]
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='h-screen w-full max-w-[100vw] flex flex-col border-none shadow-none rounded-none overflow-hidden'>
                <div className='h-full w-full max-w-6xl mx-auto overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle>
                            Profile
                        </DialogTitle>
                        <DialogDescription>
                            Tell Pocket Adviser about yourself.
                        </DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSave)}
                            className='h-[calc(100%-30px)] flex flex-col'
                        >
                            <div className='flex flex-wrap items-center justify-start gap-3 py-3'>
                                {TABS.map((tab) => (
                                <Button
                                    key={`tab-${tab}`}
                                    type='button'
                                    variant='outline'
                                    onClick={() => setActiveTab(tab)}
                                    className={
                                        cn(
                                            'h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm sm:py-2 rounded-md',
                                            activeTab === tab && 'border border-primary'
                                        )
                                    }
                                >
                                    {tab}
                                </Button>
                                ))}
                            </div>
                    
                            <div className='flex-1 overflow-y-scroll'>
                                <WealthChart data={wealthData} milestones={milestones} expectedReturn={expectedReturn} />
                                {activeTab === "Finance"? (
                                <Finance />
                                ): activeTab === "Milestones"? (
                                <MilestonesForm wealthData={wealthData} />
                                ): activeTab === "Risk Tolerance"? (
                                <RiskTolerance />
                                ): (
                                <Preferences />
                                )}
                            </div>
                            <div className='w-full flex flex-row justify-between py-3'>
                                <DialogClose asChild>
                                    <Button
                                        ref={closeRef}
                                        onClick={onCancel}
                                        type='button'
                                        variant='secondary'
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    type='button'
                                    disabled={isSubmitLoading}
                                    onClick={form.handleSubmit(onSave)}
                                    className='h-10 flex flex-row items-center gap-2'
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </DialogContent>
        </Dialog>
    )
}