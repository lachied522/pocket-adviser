"use server";
import { getNotesByUserID, deleteNote } from "@/utils/crud/notes";

export async function getNotesAction(userId: string) {
    return await getNotesByUserID(userId);
}

export async function deleteNoteAction(id: string) {
    return await deleteNote(id);
}