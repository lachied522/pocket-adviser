"use client";
import { useState } from "react";

import { ArrowBigUp } from "lucide-react";

import { useAskAI } from "@/hooks/useAskAI";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { ExtraProps } from "react-markdown";

export default function CustomInput(props: JSX.IntrinsicElements["input"] & ExtraProps) {
    // this gets Invalid DOM property `defaultvalue`. Did you mean `defaultValue`?
    // it appears React Markdown does not pass props in camelCase
    // @ts-ignore
    const [value, setValue] = useState<string>(props.defaultvalue);
    const [isLoadingRedirect, setIsLoadingRedirect] = useState<boolean>(false);
    const { onSubmit } = useAskAI();
    return (
        <div className='flex flex-row items-center gap-1'>
            <Input
                {...props}
                className=''
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
            />
            <Button
                onClick={() => {
                    setIsLoadingRedirect(true);
                    onSubmit(value);
                }}
                disabled={isLoadingRedirect}
                className='h-9 aspect-square shrink-0 p-0'
            >
                <ArrowBigUp size={24} strokeWidth={2} color="white"/>
            </Button>
        </div>
    )
}