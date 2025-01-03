"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

import { Search, Trash2 } from "lucide-react";

import debounce from "lodash.debounce";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { searchStocksAction } from "@/actions/crud/stocks";

import { type PortfolioState, usePortfolioContext } from "../context";

import type { Holding, Stock } from "@prisma/client";

type ModifiedHolding = (
    Omit<Holding, 'userId'> & 
    {
        inserted?: boolean
        updated?: boolean
        deleted?: boolean
    }
)

const MAX_PAGE_SIZE = 20;

function EditHolding({
    holding,
    onUpdate,
    onRemove
} : {
    holding: ModifiedHolding
    onUpdate: (values: ModifiedHolding) => void
    onRemove: () => void
}) {
    const { stockDataMap } = usePortfolioContext() as PortfolioState;

    return (
        <TableRow>
            <TableCell className='md:w-[200px]'>
                <span className='text-xs lg:text-sm'>{stockDataMap[holding.stockId].symbol.toUpperCase()}</span>
            </TableCell>
            <TableCell>
                <Input
                    type='number'
                    min={1}
                    placeholder='100'
                    value={holding.units}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        onUpdate({
                            ...holding,
                            units: parseFloat(e.target.value),
                        });
                    }}
                    className='max-w-[200px] text-sm md:text-base shadow-none'
                />
            </TableCell>
            <TableCell>
                <Input
                    type='text'
                    disabled
                    min={1}
                    placeholder='100'
                    value={((stockDataMap[holding.stockId].previousClose || 0) * (holding.units || 0)).toFixed(2)}
                    className='max-w-[200px] text-sm md:text-base shadow-none'
                />
            </TableCell>
            <TableCell>
                <Button
                    type='button'
                    variant='ghost'
                    onClick={onRemove}
                    className='group hover:bg-transparent'
                >
                    <Trash2 size={18} strokeWidth={2.5} className='group-hover:text-red-400' />
                </Button>
            </TableCell>
        </TableRow>
    )
}

export default function EditPortfolioDialog({
    children
}: {
    children: React.ReactNode
}) {
    const {
        holdings,
        setStockDataMap,
        insertHoldingAndUpdateState,
        updateHoldingAndUpdateState,
        deleteHoldingAndUpdateState,
    } = usePortfolioContext() as PortfolioState;
    const [modifiedHoldings, setModifiedHoldings] = useState<ModifiedHolding[]>([]); // keep copy of user holdings with current modifications applied
    const [searchString, setSearchString] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setModifiedHoldings(holdings);
    }, [holdings]);

    const currentPage = useMemo(() => {
        return modifiedHoldings
        .filter((holding) => !holding.deleted)
        .slice(MAX_PAGE_SIZE * page, MAX_PAGE_SIZE * (page + 1));
    }, [modifiedHoldings, page]);

    const onSubmit = useCallback(
        async () => {
            setIsSubmitLoading(true);
            // initiliase promises array
            const promises: Promise<any>[] = [];
            // delete any stocks that are in state but not modified array
            for (const modifiedHolding of modifiedHoldings) {
                if (modifiedHolding.inserted) {
                    promises.push(insertHoldingAndUpdateState({
                        stockId: modifiedHolding.stockId,
                        units: modifiedHolding.units,
                    }));
                } else if (modifiedHolding.updated) {
                    promises.push(updateHoldingAndUpdateState({
                        id: modifiedHolding.id,
                        stockId: modifiedHolding.stockId,
                        units: modifiedHolding.units,
                    }));
                } else if (modifiedHolding.deleted) {
                    promises.push(deleteHoldingAndUpdateState(modifiedHolding.id));
                }
            }

            await Promise.all(promises);
            // close dialog
            setIsOpen(false);
            setIsSubmitLoading(false);
        },
        [modifiedHoldings, insertHoldingAndUpdateState, updateHoldingAndUpdateState, deleteHoldingAndUpdateState, setIsSubmitLoading, setIsOpen]
    );

    const debouncedSearch = useCallback(debounce(
        async (_searchString: string) => {
            try {
                if (_searchString.length > 0) {
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

    const clearSearch = useCallback(
        () => {
            setSearchString('');
            setSearchResults([]);
        }, [setSearchString, setSearchResults]
    );

    const onAddHolding = useCallback(
        (stock: Stock) => {            
            // update state
            setModifiedHoldings((curr) => {
                // check that stock is not already in portfolio
                if (curr.find((obj) => obj.stockId === stock.id)) return curr;
                // add stock to modified holdings array
                // create temporary id which will be overwritten when added to db
                const existingIds = curr.map((obj) => obj.id);
                let id = 1;
                while (existingIds.includes(id)) {
                    id++;
                }
                return [
                    ...curr,
                    {
                        id,
                        units: 0,
                        stockId: stock.id,
                        inserted: true,
                    }
                ]
            });
            // add stock to data map
            setStockDataMap((curr) => {
                return {
                    ...curr,
                    [stock.id]: stock,
                }
            });
            // clear search
            clearSearch();
        },
        [setModifiedHoldings, setStockDataMap, clearSearch]
    );

    const onUpdateHolding = useCallback(
        (holding: ModifiedHolding) => {
            setModifiedHoldings((curr) => (
                curr.map((obj) => obj.id === holding.id? { ...holding, updated: true }: obj)
            ));
        },
        [setModifiedHoldings]
    )

    const onRemoveHolding = useCallback(
        (holding: ModifiedHolding) => {
            setModifiedHoldings((curr) => (
                curr.map((obj) => obj.id === holding.id? { ...holding, deleted: true }: obj)
            ));
            // navigate to first page
            setPage(0);
        },
        [setModifiedHoldings, setPage]
    );

    return (
        <Dialog open={isOpen} onOpenChange={(value: boolean) => setIsOpen(value)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-h-dvh max-w-6xl overflow-auto'>
                <DialogHeader>
                    <DialogTitle>
                        Edit Your Portfolio
                    </DialogTitle>
                    <DialogDescription>
                        Add, edit, or remove stocks in your portfolio.
                    </DialogDescription>
                </DialogHeader>

                <div className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-2'>
                        <span className='text-lg font-medium'>Add a stock</span>
                        <div className='h-9 sm:h-12 w-full flex flex-row items-center gap-1'>
                            <Input
                                type='text'
                                value={searchString}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setIsSearchLoading(true);
                                    setSearchString(e.target.value);
                                    debouncedSearch(e.target.value);
                                }}
                                placeholder='e.g. AAPL, BHP'
                                className='h-full py-0 text-xs lg:text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                            />

                            <Button
                                variant='secondary'
                                onClick={() => debouncedSearch(searchString)}
                                className='h-full aspect-square p-0'
                            >
                                <Search size={22} color='black' />
                            </Button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 items-start gap-2 relative'>
                        <div className='text-lg font-medium mb-2'>Edit or remove stocks</div>

                        <ScrollArea className='h-[300px] sm:h-[calc(100%)]'>
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='bg-zinc-50'>
                                            <TableHead>Symbol</TableHead>
                                            <TableHead>Units</TableHead>
                                            <TableHead>Value ($)</TableHead>
                                            <TableHead>Remove</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {modifiedHoldings.filter((obj) => !obj.deleted).length > 0? (
                                            currentPage.map((holding) => (
                                            <EditHolding
                                                key={`edit-holding-${holding.id}`}
                                                holding={holding}
                                                onUpdate={onUpdateHolding}
                                                onRemove={() => onRemoveHolding(holding)}
                                            />
                                            ))
                                        ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className='p-6'>
                                                <div className='w-full h-[120px] sm:h-[360px] flex items-center justify-center text-center'>
                                                    Use the search bar above to add stocks to your portfolio.
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex items-center justify-end space-x-2 py-4 place-self-end">
                                <div className='text-xs'>
                                    Showing {currentPage.length} of {modifiedHoldings.filter((holding) => !holding.deleted).length}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((curr) => curr - 1)}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((curr) => curr + 1)}
                                    disabled={page >= Math.floor((Math.max(modifiedHoldings.length, 1) - 1) / MAX_PAGE_SIZE)}
                                >
                                    Next
                                </Button>
                            </div>
                        </ScrollArea>

                        {searchString.length > 0 && (
                        <div className='bg-white inset-0 absolute'>
                            {isSearchLoading ? (
                            <div className='h-[360px] w-full flex flex-col gap-3 py-3'>
                                {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={`search-skeleton-${i}`} className='h-12 w-full bg-zinc-100 shrink-0 grow-0' />
                                ))}
                            </div>
                            ) : (
                            <>
                                {searchResults.length > 0? (
                                <ScrollArea className='h-[360px] py-3'>
                                    {searchResults.map((stock) => (
                                    <Button
                                        key={`search-result-${stock.symbol}`}
                                        variant='ghost'
                                        onClick={() => {
                                            onAddHolding(stock);
                                            setSearchResults([]);
                                        }}
                                        className='h-12 w-full grid grid-cols-[100px_1fr] place-items-start gap-2 p-3 mb-3'
                                    >
                                        <div className='text-lg font-medium'>{stock.symbol.toUpperCase()}</div>
                                        <div className='text-lg truncate'>
                                            {stock.name}
                                        </div>
                                    </Button>
                                    ))}
                                </ScrollArea>
                                ) : (
                                <div className='w-full text-center p-12'>
                                    Pocket Adviser only covers a limited number of stocks, and it looks like we don&apos;t cover this one!
                                </div>
                                )}
                            </>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                <div className='w-full flex flex-row items-end justify-between'>
                    <DialogClose asChild>
                        <Button
                            type='button'
                            variant='secondary'
                            onClick={() => {
                                setModifiedHoldings(holdings);
                                clearSearch();
                            }}
                        >
                            Cancel
                        </Button>
                    </DialogClose>

                    <Button onClick={onSubmit} disabled={isSubmitLoading}>
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
