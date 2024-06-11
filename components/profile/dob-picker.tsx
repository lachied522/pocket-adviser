"use client"
import { useState, useCallback } from "react"

import { format, isValid, parse } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils"

interface DOBPickerProps {
    value: Date | undefined,
    onChange: (value?: Date) => void
}

export default function DOBPicker({
    value,
    onChange
}: DOBPickerProps) {
    const [selected, setSelected] = useState<Date | undefined>(value);
    const [inputValue, setInputValue] = useState<string>('');

    const onInputChange = useCallback((e: React.FormEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget.value);

        const date = parse(e.currentTarget.value, 'dd/MM/y', new Date());
        if (isValid(date)) {
            onChange(date);
            setSelected(date);
        } else {
            onChange(undefined);
        }
    }, [onChange, setInputValue]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="ghost"
                    className={cn(
                        "flex justify-start pl-3 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon size={16} className="text-blue-800 mr-2"/>
                    {value? (
                        format(value, "PPP")
                    ) : (
                        <span>Select your DOB</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                <Input placeholder="DD/MM/YYYY" value={inputValue} onChange={onInputChange} />
                <div className="rounded-md border">
                    <Calendar
                        mode="single"
                        selected={selected}
                        defaultMonth={selected}
                        onSelect={onChange}
                        initialFocus={isValid(value)}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}