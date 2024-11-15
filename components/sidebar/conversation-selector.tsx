"use client";
import { useState, useCallback, useRef, useEffect } from "react";

import { PencilLine, Trash2 } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

interface ConversationSelectorProps {
    id: string
    name: string
}

export default function ConversationSelector({ id, name }: ConversationSelectorProps) {
    const { updateConversationAndUpdateState, deleteConversationAndUpdateState } = useGlobalContext() as GlobalState;
    const { isLoading, conversationId, onSelectConversation, onNewChat } = useChatContext() as ChatState;
    const [isEditting, setIsEditting] = useState<boolean>(false);
    const [input, setInput] = useState<string>(name);
    const isMobile = useMediaQuery();
    const inputRef = useRef<HTMLInputElement>(null);

    const onSubmit = useCallback(
        async (value: string) => {
            setIsEditting(false);
            if (value !== name && value.length > 0) {
                await updateConversationAndUpdateState({
                    id,
                    name: value.slice(0, 100),
                });
            } else {
                // cannot have empty name
                setInput(name);
            }
        },
        [id, name, updateConversationAndUpdateState, setIsEditting, setInput]
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
                if (!isLoading) onSelectConversation(id);
            }}
            className={cn(
                'sm:h-10 max-w-[200px] w-full flex flex-row items-center justify-start text-sm font-medium px-4 py-3 rounded-md cursor-pointer select-none group/selector relative hover:bg-zinc-100',
                conversationId === id && 'bg-zinc-100'
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
                className='w-[calc(100%-10px)] max-w-full bg-zinc-50 border'
            />
            ) : (
            <>
                <span className="truncate">{name}</span>

                <div className={cn(
                    'hidden flex-row items-center gap-2 pl-4 pr-2 bg-gradient-to-r from-transparent to-10% to-zinc-100 absolute right-0 group-hover/selector:flex',
                    conversationId === id && 'flex'
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
                                        onClick={() => {
                                            deleteConversationAndUpdateState(id);
                                            if (conversationId === id) onNewChat(); // switch to new chat
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