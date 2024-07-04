"use client";
import { useMemo, useRef } from "react";

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

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type AdviserState, useChatContext } from "@/context/ChatContext";

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
    const { portfolioValue } = useGlobalContext() as GlobalState;
    const { onSubmit } = useChatContext() as AdviserState;
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
        return action === "deposit"? portfolioValue + Number(amount): Math.max(portfolioValue - Number(amount), 0);
    }, [portfolioValue, amount, action]);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        const content = `I would like to ${values.action} ${formatDollar(values.amount)}. Can you give me some ideas?`;
        // call onSubmit
        onSubmit(content);
        // close dialog and reset form
        if (closeRef.current) closeRef.current.click();
    }

    const onClose = () => {
        // reset form after 1 sec
        setTimeout(() => form.reset(), 1000);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>
                        Quickly Ask for Ideas
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='min-h-[360px] flex flex-col gap-6'>
                        <p>I would like to...</p>
                        <div className="flex flex-row items-center justify-center gap-3">
                            <Button
                                type="button"
                                variant={action==='deposit' ? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'deposit')}
                                className="grid grid-cols-[36px_1fr] items-center justify-center"
                            >
                                <TrendingUp size={20} />
                                Invest some money
                            </Button>
                            <Button
                                type="button"
                                variant={action==='withdraw' ? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'withdraw')}
                                className="grid grid-cols-[36px_1fr] items-center justify-center"
                            >
                                <PiggyBank size={24} />
                                Make a withdrawal
                            </Button>
                        </div>

                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <span className='text-lg font-medium'>Amount to deposit/withdraw</span>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            className="w-[180px] h-[36px] text-base"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex flex-col gap-2 space-y-2">
                            <span className='text-lg font-medium'>Current portfolio value</span>
                            {formatDollar(portfolioValue || 0)}
                        </div>

                        <div className="flex flex-col gap-2 space-y-2">
                            <span className='text-lg font-medium'>Proposed portfolio value</span>
                            {formatDollar(proposedValue || 0)}
                        </div>

                        <div className='h-full flex flex-row items-end justify-between'>
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

                            <Button type='submit'>
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}