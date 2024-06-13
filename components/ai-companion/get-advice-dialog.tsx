"use client";
import { useMemo, useRef } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PiggyBank, RefreshCw, TrendingUp } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { formatDollar } from "@/utils/formatting";

import { type GlobalState, useGlobalContext } from "@/app/context/GlobalContext";

const formSchema = z.object({
    action: z.enum(["deposit", "withdraw", "review"]),
    amount: z.coerce.number(),
})
.refine(({ action, amount }) => action === 'review' || amount > 0, {
    message: "Please enter an amount above $0!",
    path: ["amount"],
});

interface GetAdviceDialogProps {
    children: React.ReactNode
    onSubmit: (values: z.infer<typeof formSchema>) => void
}

export default function GetAdviceDialog({ children, onSubmit }: GetAdviceDialogProps) {
    const { portfolioValue } = useGlobalContext() as GlobalState;
    const closeRef = useRef<HTMLButtonElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            action: 'deposit',
            amount: 0,
        },
    });
    const amount = form.watch("amount");
    const action = form.watch("action");

    const proposedValue = useMemo(() => {
        if (action === "review") return portfolioValue;
        return action === "deposit"? portfolioValue + Number(amount): Math.max(portfolioValue - Number(amount), 0);
    }, [portfolioValue, amount, action]);

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        // call onSubmit
        onSubmit(values);
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
            <DialogContent className="min-w-[720px]">
                <DialogHeader>
                    <DialogTitle>
                        Quickly Ask My Adviser for Advice
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className='min-h-[360px] flex flex-col gap-6'>
                        <p>I would like to...</p>
                        <div className="grid grid-cols-3 gap-4 place-items-center">
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
                                variant={action==='review' ? 'default': 'secondary'}
                                onClick={() => form.setValue('action', 'review')}
                                className="grid grid-cols-[36px_1fr] items-center justify-center"
                            >
                                <RefreshCw size={18} />
                                Review my portfolio
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
                                    <FormLabel>
                                        Amount deposit/withdraw
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            disabled={action === "review"}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2">
                            <p>Current portfolio value</p>
                            {formatDollar(portfolioValue)}
                        </div>

                        <div className="space-y-2">
                            <p>Proposed portfolio value</p>
                            {formatDollar(proposedValue)}
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
                                Get Advice
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}