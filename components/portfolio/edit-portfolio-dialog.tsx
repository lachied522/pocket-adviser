"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import { Search, Trash } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { searchStocksAction } from "@/actions/data/stocks";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { Holding, Stock } from "@prisma/client";

interface EditHoldingProps {
    holding: Holding
    onUpdate: (values: Holding) => void
    onRemove: () => void
}

function EditHolding({ holding, onUpdate, onRemove }: EditHoldingProps) {
    const { getStockData } = useGlobalContext() as GlobalState;
    const [stockData, setStockData] = useState<Stock|null>(null);

    useEffect(() => {
        (async function getData() {
            // fetch stock price data etc..
            try {
                const _data = await getStockData(holding.stockId);
                setStockData(_data);
            } catch (e) {
                // TO DO:
            }
        })();
    }, [holding.stockId, getStockData]);

    const onChangeUnits = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate({
            ...holding,
            units: parseFloat(e.target.value),
        })
    }

    return (
        <TableRow>
            <TableCell>
                {stockData?.symbol.toUpperCase()}
            </TableCell>
            <TableCell>
                <Input
                    type='number'
                    min={1}
                    placeholder='100'
                    value={holding.units}
                    onChange={onChangeUnits}
                    className='w-[60px] sm:w-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                />
            </TableCell>
            <TableCell>
                <Input
                    type='text'
                    disabled
                    min={1}
                    placeholder='100'
                    value={((stockData?.previousClose || 0) * (holding.units || 0)).toFixed(2)}
                    className='w-[60px] sm:w-[100px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                />
            </TableCell>
            <TableCell>
                <Button
                    type='button'
                    variant='ghost'
                    onClick={onRemove}
                >
                    <Trash size={18} strokeWidth={2.5} />
                </Button>
            </TableCell>
        </TableRow>
    )
}

type ModifiedHolding = Holding & {
    inserted?: boolean
    updated?: boolean
    deleted?: boolean
}

export default function EditPortfolioDialog({
    children
}: {
    children: React.ReactNode
}) {
    const { state, insertHoldingAndUpdateState, updateHoldingAndUpdateState, deleteHoldingAndUpdateState } = useGlobalContext() as GlobalState;
    const [modifiedHoldings, setModifiedHoldings] = useState<ModifiedHolding[]>([]); // keep copy of user holdings with current modifications applied
    const [searchString, setSearchString] = useState<string>('');
    const [searchResults, setSearchResults] = useState<Stock[]>([]);
    const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
    const [isSearchEmpty, setIsSearchEmpty] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (state) setModifiedHoldings(state.holdings);
    }, [state]);

    const currentPage = useMemo(() => {
        return modifiedHoldings
        .filter((holding) => !holding.deleted)
        .slice(5 * page, 5 * (page + 1));
    }, [modifiedHoldings, page]);

    const onSubmit = async () => {
        setIsLoading(true);
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
                promises.push(deleteHoldingAndUpdateState(modifiedHolding));
            }
        }

        await Promise.all(promises);
        setIsLoading(false);
        // close dialog
        if (closeRef.current) {
            closeRef.current.click();
        }
    }

    const onSearch = async () => {
        setIsSearchEmpty(false);
        setIsSearchLoading(true);
        const data = await searchStocksAction(searchString);
        if (data.length === 0) {
            setIsSearchEmpty(true);
        }
        setSearchResults(data);
        setIsSearchLoading(false);
    }

    const clearSearch = () => {
        setSearchString('');
        setSearchResults([]);
    }

    const onAddHolding = (stock: Stock) => {
        let newValue = [...modifiedHoldings];
        // check that stock is not already in portfolio
        if (!modifiedHoldings.find((obj) => obj.stockId === stock.id)) {
            // add stock to modified holdings array
            // create temporary id which will be overwritten when added to db
            const existingIds = modifiedHoldings.map((obj) => obj.id);
            let id = 1;
            while (existingIds.includes(id)) {
                id++;
            }
            const newHolding: ModifiedHolding = {
                id,
                units: 0,
                stockId: stock.id,
                userId: '',
                inserted: true,
            }
            newValue.push(newHolding);
        }
        // update state
        setModifiedHoldings(newValue);
        // clear search
        clearSearch();
        // navigate to last page if necessary
        if (page < Math.floor((Math.max(newValue.filter((holding) => !holding.deleted).length, 1) - 1) / 5)) setPage((curr) => curr + 1);
    }

    const onUpdateHolding = (holding: Holding) => {
        setModifiedHoldings((curr) => (
            curr.map((obj) => obj.id === holding.id? { ...holding, updated: true }: obj)
        ));
    }

    const onRemoveHolding = (holding: Holding) => {
        setModifiedHoldings((curr) => (
            curr.map((obj) => obj.id === holding.id? { ...holding, deleted: true }: obj)
        ));
        // navigate to first page
        setPage(0);
    }

    const onCancel = () => {
        // reset modified holdings array
        setModifiedHoldings(state?.holdings || []);
        // clear search
        clearSearch();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='flex flex-col gap-6'>
                <DialogHeader>
                    <DialogTitle>
                        Edit Your Portfolio
                    </DialogTitle>
                </DialogHeader>
                <ScrollArea className='max-h-[80vh]'>
                    <div className='flex flex-col gap-6'>
                        <p className='font-medium'>Tell Pocket Adviser what you have in your portfolio so that it can provide personalised responses.</p>

                        <div className='flex flex-col gap-2'>
                            <span className='text-lg font-medium'>Add a stock</span>
                            <div className='h-full w-full flex flex-row items-center border border-neutral-200 rounded-lg overflow-hidden'>
                                <Input
                                    type='text'
                                    value={searchString}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setSearchString(e.target.value);
                                        setIsSearchEmpty(false);
                                    }}
                                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                        if (e.key === 'Enter') onSearch();
                                    }}
                                    placeholder='e.g. AAPL, BHP'
                                    className='h-full py-0 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0'
                                />
                                <Button
                                    variant='secondary'
                                    onClick={onSearch}
                                    className='h-full aspect-square p-3'
                                >
                                    <Search size={22} color='black' />
                                </Button>
                            </div>
                        </div>

                        <div className='relative'>
                            <div className='text-lg font-medium mb-2'>Edit or remove stocks</div>
                            <div className='h-[380px] grid grid-cols-1 items-start gap-2'>
                                <div className='rounded-md border'>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Symbol</TableHead>
                                                <TableHead>Units</TableHead>
                                                <TableHead>Value ($)</TableHead>
                                                <TableHead>Remove</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <>
                                                {modifiedHoldings.length > 0? (
                                                <>
                                                    {currentPage.map((holding) => (
                                                    <EditHolding
                                                        key={`edit-holding-${holding.id}`}
                                                        holding={holding}
                                                        onUpdate={onUpdateHolding}
                                                        onRemove={() => onRemoveHolding(holding)}
                                                    />
                                                    ))}
                                                </>
                                                ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className='p-6'>
                                                        <div className='w-full flex items-center justify-center text-center'>
                                                            Use the search bar above to add stocks to your portfolio.
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                )}
                                            </>
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
                                        disabled={page >= Math.floor((Math.max(modifiedHoldings.length, 1) - 1) / 5)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>

                            {searchString.length > 0 && (
                            <div className='bg-white inset-0 absolute'>
                                {isSearchLoading ? (
                                <div className='h-[240px] w-full flex flex-col gap-3 py-3'>
                                    <Skeleton className='h-12 w-full bg-slate-100' />
                                    <Skeleton className='h-12 w-full bg-slate-100' />
                                    <Skeleton className='h-12 w-full bg-slate-100' />
                                </div>
                                ) : (
                                <>
                                    {searchResults.length > 0? (
                                    <ScrollArea className='h-[240px] py-3'>
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
                                    <>
                                        {isSearchEmpty && (
                                        <div className='w-full text-center p-12'>
                                            Pocket Adviser only covers a limited number of stocks, and it looks like we don&apos;t cover this one!
                                        </div>
                                        )}
                                    </>
                                    )}
                                </>
                                )}
                            </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <div  className='w-full flex flex-row items-end justify-between'>
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

                        <Button onClick={onSubmit}>
                            Save
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
