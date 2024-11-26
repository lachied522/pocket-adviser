"use client";
import { useState, useCallback, useRef, useEffect } from "react";

import { PencilLine, Trash2 } from "lucide-react";

import { updateConversationAction, deleteConversationAction } from "@/actions/crud/conversation";

import { useChatNavigation } from "@/hooks/useChatNavigation";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

import { cn } from "@/components/utils";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

interface ConversationSelectorProps {
    id: string
    name: string
    isActive: boolean
}

export default function ConversationSelector({ id, name, isActive }: ConversationSelectorProps) {
    const { updateConversationName, deleteConversation } = useGlobalContext() as GlobalState;
    const { onNavigateConversation } = useChatNavigation();
    const [isEditting, setIsEditting] = useState<boolean>(false);
    const [input, setInput] = useState<string>(name);
    const { setOpenMobile } = useSidebar();
    const isMobile = useMediaQuery();
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit = useCallback(
        async (value: string) => {
            setIsEditting(false);
            if (value !== name && value.length > 0) {
                try {
                    const res = await updateConversationAction(id, { name: value.slice(0, 100) });
                    updateConversationName(res);
                } catch (e) {
                    console.error(e);
                }
            } else {
                // cannot have empty name
                setInput(name);
            }
        },
        [id, name, updateConversationName, setIsEditting, setInput]
    );

    useEffect(() => {
        if (isEditting && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
            inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
        }
    }, [isEditting]);

    return (
        <div
            onClick={() => {
                onNavigateConversation(id);
                setOpenMobile(false);
            }}
            className={cn(
                'sm:h-10 max-w-[200px] w-full flex flex-row items-center justify-start text-xs p-2 rounded-md cursor-pointer select-none group/selector relative hover:bg-zinc-100',
                isActive && 'bg-zinc-100'
            )}
        >
            {isEditting? (
            <input
                ref={inputRef}
                value={input}
                maxLength={100}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') onSubmit(input);
                }}
                onBlur={() => onSubmit(input)}
                className='w-[calc(100%-10px)] max-w-full bg-zinc-50 border text-xs'
            />
            ) : (
            <>
                <span className="truncate">{name}</span>

                <div className={cn(
                    'hidden flex-row items-center gap-2 pl-4 pr-2 bg-gradient-to-r from-transparent to-10% to-zinc-100 absolute right-0 group-hover/selector:flex',
                    isActive && 'flex'
                )}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditting(true);
                        }}
                        className='bg-transparent hover:bg-transparent'
                    >
                        <PencilLine size={isMobile? 18: 16} className='text-zinc-600 hover:text-black' />
                    </button>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className='bg-transparent hover:bg-transparent'
                            >
                                <Trash2 size={isMobile? 18: 16} className='text-zinc-600 hover:text-red-600' />
                            </button>
                        </DialogTrigger>
                        <DialogContent className='max-w-lg'>
                            <DialogHeader>
                                <DialogTitle className='flex flex-row items-center gap-2'>
                                    Delete Conversation
                                </DialogTitle>
                            </DialogHeader>

                            <p>Are you sure you want to delete this conversation? This cannot be undone.</p>

                            <div className='h-full flex flex-row items-end justify-between'>
                                <DialogClose asChild>
                                    <Button
                                        type='button'
                                        variant='secondary'
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <DialogClose asChild>
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                                await deleteConversationAction(id)
                                                deleteConversation(id);
                                                onNavigateConversation(); // navigate to new chat
                                            } catch (e) {
                                                console.error(e);
                                            }
                                        }}
                                    >
                                        Delete
                                    </Button>
                                </DialogClose>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </>
            )}
        </div>
    )
}