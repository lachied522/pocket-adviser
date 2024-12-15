import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";

import Statistics from "./statistics";
import Advanced from "./advanced";
import TransactionsTable from "./table";

import ErrorBoundary from "@/components/errors/error-boundary";

import type { Advice } from "@prisma/client";

function ErrorFallback({ text }: { text: string }) {
    return (
        <div className='h-64 w-full flex items-center justify-center'>
            <span>{text}</span>
        </div>
    )
}

interface RecommendationsProps {
    advice: Advice
}

export default function AdviceTabs({
    advice,
}: RecommendationsProps) {
    return (
        <div className='w-full'>
            <Tabs defaultValue="transactions">
                <TabsList className='h-7 gap-2'>
                    <TabsTrigger value="transactions" className='h-7 text-xs'>Transactions</TabsTrigger>
                    <TabsTrigger value="statistics" className='h-7 text-xs'>Statistics</TabsTrigger>
                    <TabsTrigger value="advanced" className='h-7 text-xs'>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="transactions">
                    <TransactionsTable transactions={advice.transactions} />
                </TabsContent>

                <TabsContent value="statistics">
                    <ErrorBoundary fallback={<ErrorFallback text="Not available" />}>
                        <Statistics statistics={advice.statistics} />
                    </ErrorBoundary>
                </TabsContent>
                <TabsContent value="advanced">
                    <ErrorBoundary fallback={<ErrorFallback text="Not available" />}>
                        <Advanced statistics={advice.statistics} stockData={advice.stockData} />
                    </ErrorBoundary>
                </TabsContent>
            </Tabs>
        </div>
    )
}