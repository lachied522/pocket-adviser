"use client";
import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import type { Stock } from "@prisma/client";

const formSchema = z.object({
    stockId: z.number(),
    units: z.coerce.number().min(1, {
      message: "Units required",
    }),
});

interface AddStockDialogProps {
    children: React.ReactNode
    data: Stock
    onComplete: () => void
}

export default function AddHoldingDialog({ children, data, onComplete }: AddStockDialogProps) {
    const { insertHoldingAndUpdateState } = useGlobalContext() as GlobalState;
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stockId: data.id,
            units: 1,
        },
    });
    const closeRef = useRef<HTMLButtonElement>(null);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsLoading(true);

        try {
            await insertHoldingAndUpdateState({ ...values });

            onComplete();
            // close dialog and reset loading state
            if (closeRef.current) closeRef.current.click();
            setIsLoading(false);
        } catch (e) {
            // TO DO
            console.error(e);
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add {data.symbol.toUpperCase()} To Your Portfolio
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3.5'>
                        <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="AAPL"
                                    disabled
                                    value={data.symbol.toUpperCase()}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <FormItem>
                            <FormLabel>Exchange</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="NASDAQ"
                                    disabled
                                    value={data.exchange.toUpperCase()}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                        <FormField
                            control={form.control}
                            name="units"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Units</FormLabel>
                                    <FormDescription>
                                        Number of units you hold
                                    </FormDescription>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            placeholder='100'
                                            min={1}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className='flex flex-row justify-between'>
                            <DialogClose asChild>
                                <Button
                                    ref={closeRef}
                                    type='button'
                                    variant='secondary'
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                type='submit'
                                disabled={isLoading}
                            >
                                Add
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}