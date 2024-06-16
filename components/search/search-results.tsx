"use client";
import { useState, useEffect } from "react";

import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

import AddHoldingDialog from "./add-holding-dialog";

import type { Stock } from "@prisma/client";

interface SearchResultsProps {
    data: Stock[]
    onClose: () => void
}

export default function SearchResults({ data, onClose }: SearchResultsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setIsOpen(true);
    }, [data]);

    return (
        <div className='z-10 max-h-[180px] max-w-[240px] flex flex-col gap-2 bg-white rounded-xl shadow-sm overflow-auto absolute'>
            {data.map((result) => (
            <AddHoldingDialog key={`search-result-${result.symbol}`} data={result} onComplete={onClose}>
                <Button
                    variant='ghost'
                    onClick={() => setIsOpen(false)}
                    className='grid grid-cols-[1fr_100px] place-items-start gap-2'
                >
                    <div>{result.symbol.toUpperCase()}</div>
                    <div className='max-w-[90px] truncate'>
                        {result.name}
                    </div>
                </Button>
            </AddHoldingDialog>
            ))}
        </div>
    )
}