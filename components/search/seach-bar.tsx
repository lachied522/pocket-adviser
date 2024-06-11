"use client";
import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { searchStocks } from "@/app/actions/stocks";

import SearchResults from "./search-results";

import type { Stock } from "@prisma/client";

export default function SearchBar() {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<Stock[]>([]);

    const onsearch = async () => {
        try {
            const data = await searchStocks(query);
            setResults(data);
        } catch (e) {
            console.error(e);
            // TO DO: handle error
        }
    }

    return (
        <div className='relative'>
            <div className='max-w-[240px] flex flex-row border border-neutral-100 rounded-lg'>
                <Input
                    type='text'
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    className='border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                />

                <Button
                    variant='secondary'
                    onClick={onsearch}
                    className='rounded-l-none'
                >
                    <Search size={24} color='black' />
                </Button>
            </div>

            {query.length > 0 && results.length > 0 && (
            <SearchResults data={results} />
            )}
        </div>
    )
}