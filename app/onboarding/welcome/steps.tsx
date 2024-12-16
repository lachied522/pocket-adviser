"use client";
import { useFormContext } from "react-hook-form";

import {
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
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { PlainTextMessage } from "@/components/ai/messages";

import type { FormValues } from "@/app/(main)/profile/components/form-schema";
import ObjectiveSelector from "@/app/(main)/profile/components/objective-selector";
import PreferencesSelector from "@/app/(main)/profile/components/preferences-selector";

export const STEPS = [
    {
        label: "start",
        content: (
`Hello! 👋\n
Welcome to Pocket Adviser! I am your AI stock market copilot, here to assist you on your investing journey.\n
I can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.\n
Let's start by completing your investment profile.`
)
    },
    {
        label: "objective",
        content: (
`Let's start with your primary investment objective. This is the main thing you wish to achieve by investing. Here are a few options:\n\n
1. Long-term Savings - Accumulate capital over the long term. Time Horizon 20-30 years.
2. Passive Income - Earn passive income to support your lifestyle. Time Horizon Indefinite.
3. Capital Preservation - Protect your hard-earned capital in safer investments. Time Horizon 1-3 years.
4. Upcoming Expense - Save for an upcoming expense, like a holiday or home deposit. Time Horizon 3-4 years.
5. Children - Provide for your children in 10-20 year's time. Time Horizon 10-20 years
6. Trading - Trade to profit in the short-term.`
)
    },
    {
        label: "riskToleranceQ1",
        content: (
`Great! Now let's understand your tolerance for risk. How do you feel about the possibility of losing money in the short term?\n
A) I'm very uncomfortable with any losses, even small ones.\n
B) I can tolerate small losses but prefer to avoid significant ones.\n
C) I'm okay with moderate losses if it means the potential for higher returns.\n
D) I'm comfortable with large losses in the short term for the chance of high rewards.`
)
    },
    {
        label: "riskToleranceQ2",
        content: (
`What would you do if your investment portfolio dropped 20% in value over a few months?\n
A) I'd sell my investments immediately to avoid further losses.\n
B) I'd feel uneasy but likely stick with my investments.\n
C) I'd view it as an opportunity to invest more while prices are low.\n
D) I don't know what I would do.`
)
    },
//     {
//         label: "riskToleranceQ3",
//         content: (
// `How much time do you have to reach your investment goals?
// A) Less than 1 year.\n
// A) Less than 3 years.\n
// B) 3-10 years.\n
// C) 10+ years.`
// )
//     },
    {
        label: "riskToleranceQ4",
        content: (
`4. Which of the following is most important to you?\n
A) Avoiding losses, even if it means lower returns.\n
B) Balancing risks and returns for moderate growth.\n
C) Maximizing returns, even if it means taking significant risks.`
)
    },
    {
        label: "experience",
        content: (
`Have you invested before?\n
A) No, I'm brand new to investing.\n
B) Yes, but I've mostly stuck with safer options like savings accounts or bonds.\n
C) Yes, I've invested in stocks, funds, or other growth-focused assets.\n
D) Yes, I've taken high-risk investments, like cryptocurrencies or speculative stocks.`
)
    },
    {
        label: "employmentStatus",
        content: "What is your current employment status?"
    },
    {
        label: "income",
        content: "Approximately what is your annual income?"
    },
    {
        label: "percentIncomeInvested",
        content: "Approximately what percentage of your income are you comfortable investing?"
    },
    {
        label: "percentAssetsInvested",
        content: "Approximately what percentage of your net assets are you comfortable investing in stocks?"
    },
    {
        label: "preferences",
        content: "Lastly, do you have any preferences for particular market sectors or categories?"
    },
    {
        label: "finish",
        content: "That's all. Thanks for completing your profile."
    }
] as const;

interface OnboardingStepProps {
    step: number
    isComplete?: boolean
    onNextStep: () => void
}

function StartStep({ isComplete, onNextStep }: OnboardingStepProps) {
    return (
        <>
            <div className='text-sm font-medium text-zinc-400'>
                Pocket Adviser
            </div>
            <PlainTextMessage content={STEPS[0].content} />
            <div className='w-full flex flex-row items-center justify-center p-6'>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Get started
                </Button>
            </div>
        </>
    )
}

function FinishStep({ step, isComplete, onNextStep }: OnboardingStepProps) {
    return (
        <>
            <div className='text-sm font-medium text-zinc-400'>
                Pocket Adviser
            </div>
            <PlainTextMessage content={STEPS[step].content} />
            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={() => {}}
                    disabled={isComplete}
                >
                    Restart
                </Button>
                <Button
                    type='submit'
                    disabled={isComplete}
                >
                    Submit
                </Button>
            </div>
        </>
    )
}

function ObjectiveStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="objective"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormLabel className='text-base'>Investment Objective</FormLabel>

                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Let&apos;s start with your primary investment objective. This is the main thing you wish to achieve by investing.
                        </FormDescription>

                        <FormControl>
                            <ObjectiveSelector
                                value={field.value}
                                disabled={field.disabled}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    disabled={isComplete}
                >
                    I'm not sure
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function PreferencesStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="preferences"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormLabel className='text-base'>Preferences</FormLabel>

                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Lastly, do you have preferences for any of the following investment categories?
                        </FormDescription>

                        <FormControl>
                            <PreferencesSelector
                                value={field.value}
                                disabled={field.disabled}
                                onChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function RiskToleranceStep1({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="riskToleranceQ1"
                render={({ field }) => (
                    <FormItem className=''>
                        <FormLabel className='text-base'>Risk Tolerance</FormLabel>

                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Great! Now let&apos;s move on to risk tolerance. How do you feel about the possibility of losing money in the short term?
                        </FormDescription>

                        <FormControl>
                            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 py-3'>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(1)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 1 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"A) I'm very uncomfortable with any losses, even small ones."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(2)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 2 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"B) I can tolerate small losses but prefer to avoid significant ones."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(3)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 3 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"C) I'm okay with moderate losses if it means the potential for higher returns."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(4)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 4 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"D) I'm comfortable with large losses in the short term for the chance of high rewards."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function RiskToleranceStep2({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="riskToleranceQ2"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormDescription className='text-xs sm:text-sm text-black'>
                            What would you do if your investment portfolio dropped 20% in value over a few months?
                        </FormDescription>

                        <FormControl>
                            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 py-3'>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(1)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 1 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"A) I'd sell my investments immediately to avoid further losses."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(2)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 2 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"B) I'd feel uneasy but likely stick with my investments."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(3)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 3 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"C) I'd view it as an opportunity to invest more while prices are low."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function RiskToleranceStep4({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="riskToleranceQ4"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Which of the following is most important to you?
                        </FormDescription>

                        <FormControl>
                            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 py-3'>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(1)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 1 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"A) Avoiding losses, even if it means lower returns."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(2)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 2 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"B) Balancing risks and returns for moderate growth."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem  className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(3)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 3 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"C) Maximizing returns, even if it means taking significant risks."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function ExperienceStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="experience"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Have you invested before?
                        </FormDescription>

                        <FormControl>
                            <div className='w-full grid grid-cols-1 sm:grid-cols-2 gap-3 py-3'>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(1)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 1 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"A) No, I'm brand new to investing."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(2)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 2 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"B) Yes, but I've mostly stuck with safer options like savings accounts or bonds."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(3)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 3 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"C) Yes, I've invested in stocks, funds, or other growth-focused assets."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            onClick={() => field.onChange(4)}
                                            disabled={field.disabled}
                                            className={cn(field.value === 4 && 'bg-zinc-100 border-zinc-200 hover:bg-zinc-100')}
                                        >
                                            {"D) Yes, I've taken high-risk investments, like cryptocurrencies or speculative stocks."}
                                        </Button>
                                    </FormControl>
                                </FormItem>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function EmploymentStatusStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <FormField
            control={form.control}
            disabled={isComplete}
            name="employmentStatus"
            render={({ field }) => (
                <FormItem className='w-full'>
                    <FormLabel className='text-base'>Finances</FormLabel>
                    <FormDescription className='text-xs sm:text-sm text-black'>
                        What is your current employment status?
                    </FormDescription>

                    <div className='flex flex-row items-center justify-center gap-3 p-12'>
                        <Select onValueChange={field.onChange} defaultValue={String(field.value)} disabled={field.disabled}>
                            <FormControl>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select one..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="CASUAL">Casual</SelectItem>
                                <SelectItem value="PARTTIME">Part Time</SelectItem>
                                <SelectItem value="FULLTIME">Full Time</SelectItem>
                                <SelectItem value="SELFEMPLOYED">Self Employed</SelectItem>
                                <SelectItem value="FREELANCE">Freelance</SelectItem>
                                <SelectItem value="RETIRED">Retired</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={onNextStep}
                            disabled={isComplete}
                        >
                            Skip
                        </Button>
                        <Button
                            type='button'
                            onClick={onNextStep}
                            disabled={isComplete}
                        >
                            Confirm
                        </Button>
                    </div>
                </FormItem>
            )}
        />
    )
}

function IncomeStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <FormField
            control={form.control}
            disabled={isComplete}
            name="income"
            render={({ field }) => (
                <FormItem className='w-full'>
                    <FormDescription className='text-xs sm:text-sm text-black'>
                        Approximately what is your annual income?
                    </FormDescription>

                    <div className='flex flex-row items-center justify-center gap-3 p-12'>
                        <FormControl>
                            <Input
                                type='number'
                                min={0}
                                step={10_000}
                                value={field.value || 0}
                                onChange={field.onChange}
                                disabled={field.disabled}
                                className='w-[180px]'
                            />
                        </FormControl>

                        <Button
                            type='button'
                            variant='secondary'
                            onClick={onNextStep}
                            disabled={isComplete}
                        >
                            Skip
                        </Button>
                        <Button
                            type='button'
                            onClick={onNextStep}
                            disabled={isComplete}
                        >
                            Confirm
                        </Button>
                    </div>
                </FormItem>
            )}
        />
    )
}

function PercentIncomeStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="percentIncomeInvested"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Approximately what percentage of your income are you comfortable investing?
                        </FormDescription>

                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-3 p-6'>
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={[field.value ?? 0.5]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    disabled={field.disabled}
                                    className="w-[240px] cursor-pointer"
                                />
                                <div className="w-6 font-semibold">{(100 * (field.value ?? 0.5)).toFixed(0)}%</div>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

function PercentAssetsStep({ isComplete, onNextStep }: OnboardingStepProps) {
    const form = useFormContext<FormValues>();
    return (
        <>
            <FormField
                control={form.control}
                disabled={isComplete}
                name="percentAssetsInvested"
                render={({ field }) => (
                    <FormItem className='w-full'>
                        <FormDescription className='text-xs sm:text-sm text-black'>
                            Approximately what percentage of your net assets are you comfortable investing in stocks?
                        </FormDescription>

                        <FormControl>
                            <div className='flex flex-row items-center justify-center gap-3 p-6'>
                                <Slider
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={[field.value ?? 0.5]}
                                    onValueChange={(value: number[]) => field.onChange(value[0])}
                                    disabled={field.disabled}
                                    className="w-[240px] cursor-pointer"
                                />
                                <div className="w-6 font-semibold">{(100 * (field.value ?? 0.5)).toFixed(0)}%</div>
                            </div>
                        </FormControl>
                    </FormItem>
                )}
            />

            <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                <Button
                    type='button'
                    variant='secondary'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Skip
                </Button>
                <Button
                    type='button'
                    onClick={onNextStep}
                    disabled={isComplete}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}

export function OnboardingStep(props: OnboardingStepProps) {
    switch (STEPS[props.step].label) {
        case "start": {
            return <StartStep {...props} />
        }
        case "objective": {
            return <ObjectiveStep {...props} />
        }
        case "riskToleranceQ1": {
            return <RiskToleranceStep1 {...props} />
        }
        case "riskToleranceQ2": {
            return <RiskToleranceStep2 {...props} />
        }
        // case "riskToleranceQ3": {
        //     return <RiskToleranceStep1 {...props} />
        // }
        case "riskToleranceQ4": {
            return <RiskToleranceStep4 {...props} />
        }
        case "experience": {
            return <ExperienceStep {...props} />
        }
        case "employmentStatus": {
            return <EmploymentStatusStep {...props} />
        }
        case "income": {
            return <IncomeStep {...props} />
        }
        case "percentIncomeInvested": {
            return <PercentIncomeStep {...props} />
        }
        case "percentAssetsInvested": {
            return <PercentAssetsStep {...props} />
        }
        case "preferences": {
            return <PreferencesStep {...props} />
        }
        case "finish": {
            return <FinishStep {...props} />
        }
    }
}