"use client";
import {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from "react";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { updateProfileAction } from "@/actions/crud/profile";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type FormValues, formSchema } from "@/components/profile/form-schema";

import type { Profile } from "@prisma/client";

function defaultValues(initialProfile: Profile | null) {
    return {
        dob: initialProfile?.dob ?? new Date(),
        objective: initialProfile?.objective ?? "RETIREMENT",
        employmentStatus: initialProfile?.employmentStatus ?? "CASUAL",
        income: initialProfile?.income ?? 0,
        percentIncomeInvested: initialProfile?.percentIncomeInvested ?? 0.10,
        percentAssetsInvested: initialProfile?.percentAssetsInvested ?? 0.10,
        experience: initialProfile?.experience ?? 1,
        riskToleranceQ1: initialProfile?.riskToleranceQ1 ?? 3,
        riskToleranceQ2: initialProfile?.riskToleranceQ2 ?? 3,
        riskToleranceQ3: initialProfile?.riskToleranceQ3 ?? 3,
        riskToleranceQ4: initialProfile?.riskToleranceQ4 ?? 3,
        targetYield: initialProfile?.targetYield ?? 0.01,
        international: initialProfile?.international ?? 0.7,
        preferences: initialProfile?.preferences as Record<string, 'like'|'dislike'> ?? {},
        milestones: initialProfile?.milestones ?? [], // TO DO: type this properly
    }
}

// constants for calculating forecast wealth
const MARKET_RISK_PREMIUM = 0.05;
const RISK_FREE_RATE = 0.05;

function getExpectedReturnFromValues(values: FormValues) {
    // use CAPM model to calculate expected return based on risk tolerance
    const riskScore = (
        values.riskToleranceQ1 +
        values.riskToleranceQ2 +
        values.riskToleranceQ3 +
        values.riskToleranceQ4
    ) / 4;

    return RISK_FREE_RATE + MARKET_RISK_PREMIUM * (0.25 * (riskScore - 3) + 0.75);
}

type ForecastDataPoint = {
    year: number;
    wealth: number;
    principal: number;
}

export type ProfileState = {
    form: ReturnType<typeof useForm<FormValues>>
    forecastData: ForecastDataPoint[]
    isSubmitLoading: boolean
    onCancel: () => Promise<void>
    onSave: () => Promise<void>
}

const ProfileContext = createContext<any>(null);

export const useProfileContext = () => {
    return useContext(ProfileContext);
}

interface ProfileProviderProps {
    children: React.ReactNode
    initialProfile: Profile | null
}

export const ProfileProvider = ({
  children,
  initialProfile,
}: ProfileProviderProps) => {
    const { state, calcPortfolioValue } = useGlobalContext() as GlobalState;
    const [startingValue, setStartingValue] = useState<number>(0);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues(initialProfile),
    });

    useEffect(() => {
        (async function updateStartingValue() {
            setStartingValue(await calcPortfolioValue());
        })();
    }, [calcPortfolioValue, setStartingValue]);

    const forecastData = useMemo(() => {
        const values = form.getValues();
        const expectedReturn = getExpectedReturnFromValues(values);
        const annualContribution = values.percentIncomeInvested * values.income;

        const _data = [];
        const date = new Date();
        let prevValue = startingValue;
        for (let t = 0; t < 100; t++) {
            date.setFullYear(new Date().getFullYear() + t);

            let wealth = t > 0? prevValue * (1 + expectedReturn) + annualContribution: startingValue;
            // adjust wealth for any milestones during year
            for (const obj of values.milestones) {
                if (new Date(obj.date).getFullYear() === date.getFullYear()) {
                    wealth -= obj.target;
                }
            }

            // ensure wealth is positive
            wealth = Math.max(wealth, 0);

            const principal = annualContribution * t + startingValue;
            const income = (values.targetYield ?? 0) * wealth;

            _data.push({
                year: date.getFullYear(),
                wealth,
                income,
                principal,
            });
            prevValue = wealth;
        }

        return _data;
    }, [form.getValues, startingValue]);

    const onSave = useCallback(
        async (values: FormValues) => {
            setIsSubmitLoading(true);
            await updateProfileAction(
                state.id,
                { userId: state.id, ...values }
            );
            setIsSubmitLoading(false);
            // reset form state to new values
            form.reset(values);
        },
        [form, setIsSubmitLoading]
    );

    const onCancel = useCallback(
        () => {
            form.reset(defaultValues(initialProfile));
        },
        [form, initialProfile]
    );

    return (
        <ProfileContext.Provider
            value={{
                form,
                forecastData,
                isSubmitLoading,
                onSave,
                onCancel,
            }}
        >
            <FormProvider {...form}>
                {children}
            </FormProvider>
        </ProfileContext.Provider>
  )
}