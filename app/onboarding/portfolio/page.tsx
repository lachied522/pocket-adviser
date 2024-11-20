"use client";
import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/typography";

import { bulkInsertHoldingAction } from "@/actions/crud/holdings";

import DataTable from "./data-table";
import SearchBar from "./search-bar";

import type { PopulatedHolding } from "@/types/helpers";

export default function PortfolioPage() {
    const [populatedHoldings, setPopulatedHoldings] = useState<PopulatedHolding[]>([]);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const session = useSession();
    const router = useRouter();

    const onSubmit = useCallback(
        async () => {
            if (!(session && session.data)) {
                throw new Error("Session or user does not exist");
            }

            setIsSubmitLoading(true);

            try {
                await bulkInsertHoldingAction(
                    populatedHoldings.map((holding) => ({
                        stockId: holding.stockId,
                        units: holding.units,
                        userId: session.data.user.id,
                    }))
                );
                router.replace('/?welcome=true');
            } catch (e) {
                // TO DO:
            }
        }, [populatedHoldings, session, router, setIsSubmitLoading]
    );

    return (
        <main className='h-screen flex items-center justify-center'>
            <div className='h-full w-full max-w-6xl flex flex-col items-stretch justify-center gap-12 p-12 mx-auto'>
                <div className='w-full flex flex-row justify-between'>
                    <div>
                        <H1>Portfolio</H1>
                        <p className='text-sm'>Tell Pocket Adviser which stocks you have in your portfolio.</p>
                    </div>

                    <Button
                        type="button"
                        size="lg"
                        variant="secondary"
                        onClick={() => router.replace('/?welcome=true')}
                    >
                        Skip
                    </Button>
                </div>

                <div className='flex-1 flex flex-col gap-12 overflow-hidden relative'>
                    <SearchBar setPopulatedHoldings={setPopulatedHoldings} />

                    <DataTable  
                        populatedHoldings={populatedHoldings}
                        setPopulatedHoldings={setPopulatedHoldings}
                    />                        
                </div>

                <div className='w-full flex flex-row justify-end'>
                    <Button
                        type="button"
                        onClick={onSubmit}
                        disabled={isSubmitLoading}
                    >
                        Proceed
                    </Button>
                </div>
            </div>
        </main>
    )
}