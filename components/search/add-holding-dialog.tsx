"use client";

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

import { type GlobalState, useGlobalContext } from "@/app/context/GlobalContext";


const formSchema = z.object({
    symbol: z.string().min(1, {
        message: "Required"
    }),
    units: z.coerce.number().min(1, {
      message: "Units required",
    }),
  })

interface AddStockDialogProps {
    children: React.ReactNode
    symbol: string
}

export default function AddHoldingDialog({ children, symbol }: AddStockDialogProps) {
    const { insertHoldingAndUpdateState } = useGlobalContext() as GlobalState;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            symbol: symbol.toUpperCase(),
            units: 1,
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        insertHoldingAndUpdateState({ ...values });
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add {symbol} To Your Portfolio
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-3.5'>
                        <FormField
                            control={form.control}
                            name="symbol"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Symbol</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="AAPL"
                                            disabled
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                <Button type='button' variant='secondary'>
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button type='submit'>
                                Add
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}