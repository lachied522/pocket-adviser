"use client";
import React, { useState, useCallback } from "react";

import debounce from "lodash.debounce";

import { AlertTriangle, Search } from "lucide-react";

import { searchStocksAction } from "@/actions/crud/stocks";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { Holding, Stock } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { PopulatedHolding } from "@/types/helpers";

interface SearchBarProps {
    setPopulatedHoldings: React.Dispatch<React.SetStateAction<PopulatedHolding[]>>
}

export default function SearchBar({ setPopulatedHoldings }: SearchBarProps) {
    const [searchString, setSearchString] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);

    const debouncedSearch = useCallback(debounce(
        async (_searchString: string) => {
            try {
                if (_searchString.length > 1) {
                    const data = await searchStocksAction(_searchString);
                    setSearchResults(data);
                    setIsSearchLoading(false);    
                } else {
                    setSearchResults([]);
                    setIsSearchLoading(false);
                }
            } catch (e) {
                // pass
            }
        },
        500,
    ), [setSearchResults, setIsSearchLoading]);


    return (
        <div className='relative'>
            <div className='h-12 w-full flex flex-row items-center gap-1'>
                <Input
                    type='text'
                    value={searchString}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setIsSearchLoading(true);
                        setSearchString(e.target.value);
                        debouncedSearch(e.target.value);
                    }}
                    // onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    //     if (e.key === 'Enter') debouncedSearch(searchString);
                    // }}
                    placeholder='e.g. AAPL, BHP'
                    className='h-full py-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                />

                <Button
                    variant='secondary'
                    onClick={() => debouncedSearch(searchString)}
                    className='h-full aspect-square p-0'
                >
                    <Search size={22} color='black' />
                </Button>
            </div>
            
            {searchString.length > 1 && (
            <div className='z-10 h-screen bg-white mt-3 inset-x-0 absolute'>
                {isSearchLoading ? (
                <div className='h-fit w-full flex flex-col gap-3 rounded-md border'>
                    {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={`search-skeleton-${i}`} className='h-12 w-full bg-zinc-100 shrink-0 grow-0' />
                    ))}
                </div>
                ) : (
                <>
                    {searchResults.length > 0? (
                    <ScrollArea className='h-full'>
                        <div className='h-fit rounded-md border'>
                            {searchResults.map((stock) => (
                            <Button
                                key={`search-result-${stock.symbol}`}
                                variant='ghost'
                                onClick={() => {
                                    setPopulatedHoldings((curr) => {
                                        if (curr.find((obj) => obj.stockId === stock.id)) return curr;
                                        return [...curr, { ...stock, stockId: stock.id, units: 1 }];
                                    });
                                    setSearchString('');
                                    setSearchResults([]);
                                }}
                                className='h-12 w-full grid grid-cols-[100px_1fr] place-items-start gap-2 p-3'
                            >
                                <div className='text-lg font-medium'>{stock.symbol.toUpperCase()}</div>
                                <div className='text-lg truncate'>
                                    {stock.name}
                                </div>
                            </Button>
                            ))}
                        </div>
                    </ScrollArea>
                    ) : (
                    <div className='flex flex-col items-center gap-2 p-12 rounded-md border'>
                        <AlertTriangle />
                        <span>Pocket Adviser only covers a limited number of stocks, and it looks like we don&apos;t cover this one!</span>
                    </div>
                    )}
                </>
                )}
            </div>
            )}
        </div>
    )
}