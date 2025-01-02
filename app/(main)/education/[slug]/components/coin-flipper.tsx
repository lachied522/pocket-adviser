"use client";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function CoinFlipper() {
    const [state, setState] = useState<boolean>(false);
    const [hasFlipped, setHasFlipped] = useState<boolean>(false);
    const [multiplier, setMultiplier] = useState<number>(1);
    const [change, setChange] = useState<number>(0);
    const [balanceA, setBalanceA] = useState<number>(0);
    const [balanceB, setBalanceB] = useState<number>(0);

    return (
        <div className='flex flex-col gap-2 py-12'>
            <h3 className='font-semibold'>Coin Flip Game</h3>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-12'>
                <div className='flex flex-col justify-between gap-2'>
                    <div className='grid grid-cols-[1fr_0.50fr] items-center'>
                        <span>Multipler</span>
                        <Input
                            type="number"
                            min={0}
                            value={multiplier}
                            onChange={(e) => setMultiplier(Number(e.target.value))}
                        />
                    </div>

                    <div className='grid grid-cols-2 gap-2'>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setHasFlipped(false);
                                setBalanceA(0);
                                setBalanceB(0);
                                setMultiplier(1);
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => {
                                setHasFlipped(false);
                                setTimeout(() => {
                                    setHasFlipped(true);
                                    const win = Math.random() < 0.5;
                                    setState(win);
                                    setBalanceA((curr) => curr + 50 * multiplier);
                                    const _change = win? 100 + multiplier * 1000: -multiplier * 1000;
                                    setBalanceB((curr) => curr + _change);
                                    setChange(_change);
                                }, 300);
                            }}
                        >
                            Flip!
                        </Button>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-2'>
                    <div className='col-span-2 font-semibold'>Option A</div>
                    <span className='font-medium'>Balance</span>
                    <div className='w-full flex flex-row justify-end font-medium'>${balanceA.toLocaleString()}</div>

                    <Separator className='col-span-2' />
                    
                    <div className='col-span-2 font-semibold'>Option B</div>
                    <span>Outcome</span>
                    <div className='w-full flex flex-row justify-end'>{hasFlipped? (state? "You win!": "You lost :("): "-"}</div>
                    <span>Change</span>
                    <div className='w-full flex flex-row justify-end'>{hasFlipped? (state? `+$${change.toLocaleString()}`: `-$${Math.abs(change).toLocaleString()}`): "-"}</div>
                    <span className='font-medium'>Balance</span>
                    <div className='w-full flex flex-row justify-end font-medium'>{balanceB < 0 && "-"}${Math.abs(balanceB).toLocaleString()}</div>
                </div>
            </div>
        </div>
    )
}