"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PiggyBank, SearchCheck, TrendingUp } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";

import { formatDollar } from "@/utils/formatting";

import { useChatNavigation } from "@/hooks/useChatNavigation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

const formSchema = z.object({
    action: z.enum(["deposit", "withdraw", "review"]),
    amount: z.coerce.number(),
});

interface QuickActionsDialogProps {
    children: React.ReactNode
}

export default function QuickActionsDialog({ children }: QuickActionsDialogProps) {
    const { calcPortfolioValue } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatNavigation();
    const { setOpenMobile: setSidebarOpen } = useSidebar();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [currentValue, setCurrentValue] = useState<number>(0);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            action: 'deposit',
            amount: 1000,
        },
    });
    const amount = form.watch("amount");
    const action = form.watch("action");

    const proposedValue = useMemo(() => {
        return Math.max(
            currentValue + (action === "deposit"? Number(amount): action === "withdraw"? - Number(amount): 0),
            0
        );
    }, [currentValue, amount, action]);

    useEffect(() => {
        // get current portfolio value when dialog opens
        if (isOpen) getCurrentValue();

        async function getCurrentValue() {
            setCurrentValue(await calcPortfolioValue());
        }
    }, [isOpen, calcPortfolioValue]);

    const handleSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            onSubmit(
                values.action === "deposit"? `What can I buy with ${formatDollar(values.amount)}?`: values.action === "withdraw"? `I need to raise ${formatDollar(values.amount)}. What should I sell?`: "Can you review my portfolio and provide some suggestions?",
                { toolName: "getRecommendations" }
            );
            setIsOpen(false);
            // close sidebar on mobile
            setSidebarOpen(false);
        },
        [onSubmit, setIsOpen, setSidebarOpen]
    );

    return (
        <Dialog open={isOpen} onOpenChange={(value: boolean) => setIsOpen(value)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Quick Actions
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6 py-3'>
                        <p>I would like to...</p>
                        <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
                            <Button
                                type="button"
                                variant={action==='deposit'? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'deposit')}
                                className="flex flex-row gap-2 items-center justify-center"
                            >
                                <TrendingUp size={16} />
                                Invest some money
                            </Button>
                            <Button
                                type="button"
                                variant={action==='withdraw'? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'withdraw')}
                                className="flex flex-row gap-2 items-center justify-center"
                            >
                                <PiggyBank size={20} />
                                Make a withdrawal
                            </Button>
                            <Button
                                type="button"
                                variant={action==='review'? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'review')}
                                className="flex flex-row gap-2 items-center justify-center"
                            >
                                <SearchCheck size={16} />
                                Review my portfolio
                            </Button>
                        </div>

                        {action !== "review" && (
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className='w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 space-y-0'>
                                    <span>Amount to invest/withdraw ($)</span>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100}
                                            className="w-[100px] py-0 ml-3"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        )}

                        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className=''>Current portfolio value</span>
                            <div className='ml-3'>{formatDollar(currentValue ?? 0)}</div>
                        </div>

                        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className=''>Proposed portfolio value</span>
                            <div className='ml-3'>{formatDollar(proposedValue ?? 0)}</div>
                        </div>

                        <div className='h-full flex flex-row items-end justify-between mt-3'>
                            <DialogClose asChild>
                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={() => {
                                        // reset form after 1 sec
                                        setTimeout(() => form.reset(), 1000);
                                    }}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type='submit'
                                disabled={action!=="review" && (proposedValue === currentValue || proposedValue === 0)}
                            >
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}