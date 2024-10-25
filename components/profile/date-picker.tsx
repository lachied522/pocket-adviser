"use client"
import { useState, useEffect } from "react"

import { format, isValid, parse } from "date-fns";

import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import { cn } from "@/components/utils"

const TODAY = new Date();

const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
] as const;

interface DatePickerProps {
    value: Date | undefined,
    onChange: (value?: Date) => void
}

export default function DatePicker({
    value,
    onChange
}: DatePickerProps) {
    const [date, setDate] = useState<number>((value? new Date(value): TODAY).getDate());
    const [month, setMonth] = useState<number>((value? new Date(value): TODAY).getMonth() + 1);
    const [year, setYear] = useState<number>((value? new Date(value): TODAY).getFullYear());

    useEffect(() => {
        const newDate = parse(`${date}/${month}/${year}`, 'dd/M/y', new Date());
        if (isValid(newDate)) {
            onChange(newDate);
        } else {
            onChange(undefined);
        }
    }, [date, month, year]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline"
                    className={cn(
                        "w-[180px] flex justify-start pl-3 text-left font-normal",
                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon size={16} className="text-blue-800 mr-2"/>
                    {value? (
                        <div className='line-clamp-1 truncate'>{format(value, "MMM do, Y")}</div>
                    ) : (
                        <span>Select date</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex w-auto flex-col items-start gap-2 px-3 py-2">
                <span className='text-sm'>Pick a date:</span>
                <div className="flex flex-row items-center gap-2">
                    <Select
                        onValueChange={(value: string) => setDate(Number(value))}
                        defaultValue={value? new Date(value).getDate().toString(): TODAY.getDate().toString()}
                    >
                        <SelectTrigger className="">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 31 }).map((_, i) => (
                            <SelectItem
                                key={`date-${i+1}`}
                                value={String(i+1)}
                            >
                                {i+1}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span>/</span>

                    <Select
                        onValueChange={(value: string) => setMonth(Number(value))}
                        defaultValue={value? (new Date(value).getMonth() + 1).toString(): TODAY.getMonth().toString()}
                    >
                        <SelectTrigger className="">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MONTHS.map((mon, i) => (
                            <SelectItem
                                key={`month-${mon}`}
                                value={String(i+1)}
                            >
                                {mon}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span>/</span>

                    <Select
                        onValueChange={(value: string) => setYear(Number(value))}
                        defaultValue={value? new Date(value).getFullYear().toString(): TODAY.getFullYear().toString()}
                    >
                        <SelectTrigger className="">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 80 }).map((_, i) => (
                            <SelectItem
                                key={`year-${i}`}
                                value={String(TODAY.getFullYear() + i)}
                            >
                                {TODAY.getFullYear() + i}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </PopoverContent>
        </Popover>
    )
}