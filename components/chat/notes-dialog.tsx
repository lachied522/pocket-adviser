"use client";
import { useState, useEffect, useCallback } from "react";

import { Check, Trash2, X } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getNotesAction, deleteNoteAction } from "@/actions/crud/notes";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import type { Note } from "@prisma/client";

interface NotesDialogProps {
    children: React.ReactNode
}

export default function NotesDialog({ children }: NotesDialogProps) {
    const { state } = useGlobalContext() as GlobalState;
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState<boolean>(false);

    useEffect(() => {
        (async function getNotes() {
            if (state && state.accountType !== "FREE") {
                setIsLoading(true);
                const _notes = await getNotesAction(state.id);
                setNotes(_notes);
            }
            setIsLoading(false);
        })();
    }, [state]);

    const onDelete = useCallback(async (id: string) => {
        await deleteNoteAction(id);
        setNotes((curr) => curr.filter((note) => note.id !== id));
    }, [setNotes]);

    const onDeleteAll = useCallback(
        async () => {
            setIsLoading(true);
            await Promise.all(notes.map((note) => deleteNoteAction(note.id)))
            setNotes([]);
            setIsLoading(false);
            setIsConfirmDeleteVisible(false);
        },[notes, setNotes, setIsLoading, setIsConfirmDeleteVisible]
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-h-full max-w-4xl'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        📝 Notes
                    </DialogTitle>
                    <DialogDescription>
                        Pocket Adviser will make notes as you chat. You can manage your notes here.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className='h-[600px]'>
                    <div className='flex flex-col gap-2'>
                        {isConfirmDeleteVisible? (
                        <div className='w-full flex flex-row items-center justify-end gap-2'>
                            <span>Are you sure?</span>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setIsConfirmDeleteVisible(false)}
                                disabled={isLoading}
                            >
                                <X size={18} color='rgb(220 38 38)' />
                            </Button>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={onDeleteAll}
                                disabled={isLoading}
                            >
                                <Check size={18} color='rgb(22 163 74)' />
                            </Button>
                        </div>
                        ) : (
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setIsConfirmDeleteVisible(true)}
                            disabled={isLoading}
                            className='font-medium py-3 border border-neutral-600 self-end'
                        >
                            Clear notes
                        </Button>
                        )}

                        {isLoading? (
                        <div className='flex flex-col gap-2'>
                            {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={`notes-skeleton${index}`}
                                className='h-10 w-full'
                            />
                            ))}
                        </div>
                        ): (
                        <div className='rounded-md border'>
                            <Table>
                                <TableBody>
                                    {notes.map((note) => (
                                    <TableRow
                                        key={`note-${note.id}`}
                                        className='w-full flex flex-row items-center justify-between'
                                    >
                                        <TableCell className='font-medium pl-3'>
                                            {note.content}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                onClick={() => onDelete(note.id)}
                                                variant='ghost'
                                                className='bg-transparent hover:bg-transparent'
                                            >
                                                <Trash2 size={18} className='text-slate-600 hover:text-red-600' />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                    {notes.length < 1 && (
                                    <TableRow>
                                        <TableCell colSpan={2} className='p-6 text-center'>
                                            No notes yet.
                                        </TableCell>
                                    </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        )}
                    </div>
                </ScrollArea>

                <div className='h-full flex flex-row justify-end'>
                    <DialogClose asChild>
                        <Button
                            type='button'
                            variant='default'
                        >
                            Done
                        </Button>
                    </DialogClose>
                </div>
            </DialogContent>
        </Dialog>
    )
}