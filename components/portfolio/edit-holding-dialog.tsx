"use client";
import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Trash } from "lucide-react";

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

import type { PopulatedHolding } from "@/types/helpers";

const formSchema = z.object({
    id: z.number(),
    symbol: z.string(),
    units: z.coerce.number().min(1, {
      message: "Units required",
    }),
    cost: z.coerce.number().optional().default(0),
});

interface AddStockDialogProps {
    children: React.ReactNode
    holding: PopulatedHolding
}

export default function EditHoldingDialog({ children, holding }: AddStockDialogProps) {
    const { updateHoldingAndUpdateState, deleteHoldingAndUpdateState } = useGlobalContext() as GlobalState;
    const [isRemoveButtonVisible, setIsRemoveButtonVisible] = useState<boolean>(false);
    const closeRef = useRef<HTMLButtonElement>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...holding
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await updateHoldingAndUpdateState({ ...values });
        // close dialog
        if (closeRef.current) closeRef.current.click();
    }

    const onCancel = () => {
        // reset form after dialog has closed
        setTimeout(() => form.reset(holding), 1000);
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Edit {holding.symbol} Holding
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-6'>
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

                        <div className='flex flex-row items-center justify-between'>
                            <div>Remove</div>

                            {isRemoveButtonVisible? (
                            <div className='flex flex-row items-center gap-3.5'>
                                <div>Are you sure?</div>

                                <Button
                                    type='button'
                                    variant='destructive'
                                    onClick={() => deleteHoldingAndUpdateState(holding)}
                                >
                                    Yes
                                </Button>

                                <Button
                                    type='button'
                                    variant='secondary'
                                    onClick={() => setIsRemoveButtonVisible(false)}
                                >
                                    No
                                </Button>
                            </div>
                            ) : (
                            <Button
                                type='button'
                                variant='destructive'
                                onClick={() => setIsRemoveButtonVisible(true)}
                            >
                                <Trash size={16} />
                            </Button>
                            )}
                        </div>

                        <div className='flex flex-row justify-between'>
                            <DialogClose asChild>
                                <Button
                                    ref={closeRef}
                                    type='button'
                                    variant='secondary'
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button type='submit'>
                                Save
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
