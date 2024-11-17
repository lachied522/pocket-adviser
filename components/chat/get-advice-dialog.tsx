"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PiggyBank, TrendingUp } from "lucide-react";

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

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

const formSchema = z.object({
    action: z.enum(["deposit", "withdraw"]),
    amount: z.coerce.number().min(0, {
        message: "Please enter an amount above $0!"
    }),
});

interface GetAdviceDialogProps {
    children: React.ReactNode
}

export default function GetAdviceDialog({ children }: GetAdviceDialogProps) {
    const { calcPortfolioValue } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as ChatState;
    const { setOpenMobile } = useSidebar();
    const [currentValue, setCurrentValue] = useState<number>(0);
    const closeRef = useRef<HTMLButtonElement>(null);
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
        return action === "deposit"? currentValue + Number(amount): Math.max(currentValue - Number(amount), 0);
    }, [currentValue, amount, action]);

    useEffect(() => {
        (async function getCurrenctValue() {
            setCurrentValue(await calcPortfolioValue());
        })();
    }, []);

    const handleSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            const content = values.action === "deposit"? `What can I buy with ${formatDollar(values.amount)}?`: `I need to raise ${formatDollar(values.amount)}. What should I sell?`;
            onSubmit(content, 'getRecommendations');
            if (closeRef.current) closeRef.current.click();
            // close sidebar on mobile
            setOpenMobile(false);
        },
        [onSubmit]
    );

    const onClose = () => {
        // reset form after 1 sec
        setTimeout(() => form.reset(), 1000);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle>
                        Quickly Ask for Ideas
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-6'>
                        <p>I would like to...</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-3">
                            <Button
                                type="button"
                                variant={action==='deposit' ? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'deposit')}
                                className="flex flex-row gap-3 items-center justify-center"
                            >
                                <TrendingUp size={20} />
                                Invest some money
                            </Button>
                            <Button
                                type="button"
                                variant={action==='withdraw' ? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'withdraw')}
                                className="flex flex-row gap-3 items-center justify-center"
                            >
                                <PiggyBank size={24} />
                                Make a withdrawal
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem className='flex flex-col gap-3'>
                                    <span>Amount to invest/withdraw ($)</span>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            step={100}
                                            className="w-[180px] h-[36px] text-base mx-3"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className=''>Current portfolio value</span>
                            <div className='px-3'>{formatDollar(currentValue ?? 0)}</div>
                        </div>

                        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className=''>Proposed portfolio value</span>
                            <div className='px-3'>{formatDollar(proposedValue ?? 0)}</div>
                        </div>

                        <div className='h-full flex flex-row items-end justify-between mt-3'>
                            <DialogClose asChild>
                                <Button
                                    ref={closeRef}
                                    type='button'
                                    variant='secondary'
                                    onClick={onClose}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type='submit'
                                disabled={proposedValue === 0}
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