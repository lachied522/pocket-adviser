"use client";
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { searchStocksAction } from "@/actions/stocks";

import SearchResults from "./search-results";

import type { Stock } from "@prisma/client";

export default function SearchBar() {
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<Stock[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // add event listener for focusing search
        const openSearchOnFocus = () => {
            setIsFocused(document.activeElement === inputRef.current);
        }

        document.addEventListener("click", openSearchOnFocus);

        return () => {
            document.removeEventListener("click", openSearchOnFocus);
        }
    }, []);

    const onSearch = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            const data = await searchStocksAction(query);
            setResults(data);
            setIsFocused(true);
        } catch (e) {
            console.error(e);
            // TO DO: handle error
        }
    }

    const onReset = () => {
        setResults([]);
        setQuery('');
    }

    return (
        <div className='relative'>
            <div className='max-w-[240px] flex flex-row border border-neutral-100 rounded-lg'>
                <Input
                    ref={inputRef}
                    type='text'
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                />

                <Button
                    variant='secondary'
                    onClick={onSearch}
                    className='rounded-l-none'
                >
                    <Search size={24} color='black' />
                </Button>
            </div>

            {isFocused || results.length > 0 && (
            <SearchResults data={results} onClose={onReset} />
            )}
        </div>
    )
}