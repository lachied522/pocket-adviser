"use client";
import { useState, useCallback } from "react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { PopulatedHolding } from "@/types/helpers";

interface EditHoldingDialogProps {
    children: React.ReactNode
    holding: PopulatedHolding
    onChange: (holding: PopulatedHolding) => void
}

export default function EditHoldingDialog({ children, holding, onChange }: EditHoldingDialogProps) {
    const [units, setUnits] = useState<number>(holding.units);
    const [value, setValue] = useState<number>(holding.units * (holding.previousClose || 0));
    
    const onChangeUnits = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(e.target.value);
        setUnits(input);
        if (!holding.previousClose) return;
        setValue(Math.round(input * holding.previousClose * 100) / 100);
    }, [holding.previousClose, setUnits, setValue]);

    const onChangeValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = parseFloat(e.target.value);
        setValue(input);
        if (!holding.previousClose) return;
        setUnits(Math.round(input / holding.previousClose));
    }, [holding.previousClose, setUnits, setValue]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{holding.name}</DialogTitle>
                </DialogHeader>

                <div className='flex flex-row gap-6 py-6'>
                    <div className='flex flex-col gap-2'>
                        <span>Units</span>
                        <Input
                            type="number"
                            min={1}
                            value={units}
                            onChange={onChangeUnits}
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <span>Value ($)</span>
                        <Input
                            type="number"
                            min={0}
                            step={holding.previousClose || 1}
                            value={value}
                            onChange={onChangeValue}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={() => onChange({ ...holding, units })}>
                            Save
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}