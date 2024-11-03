import { generateText, type CoreMessage } from "ai";
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

import { getNotesByUserID, insertNote, deleteNote } from "@/utils/crud/notes";

import type { Note } from "@prisma/client";

async function modifyNotes(existingNotes: Note[], messages: CoreMessage[], userId: string) {
    const formattedNotes = existingNotes.map((note) => note.content);
    // only check most recent messages for new context
    const formattedMessages = messages.filter((message) => (message.role === "assistant" || message.role === "user")).slice(-4);

    const response = await generateText({
        model: openai('gpt-4o'),
        system: (
`You are supervising the creation and maintenance of a set of concise, relevant notes on behalf of an investment-focused chatbot. 
Your task is to identify key pieces of information that may be useful in guiding future investment advice. Only retain essential details relevant to the user's preferences, goals, or constraints that could influence investment recommendations. Examples of critical information include:

Investment Preferences (e.g. interested in Apple stock, likes agriculture stocks)
Financial Goals (e.g. saving for a home deposit, preparing for retirement)
Risk Tolerance or Time Horizon (e.g. prefers low-risk investments, investing for the long term)
Income Preferences (e.g. prefers dividend-paying stocks)
Sector or Company Interests (e.g. interested in technology sector, interested in renewable energy)

Each piece of information should be noted as a single, clear statement.

You will receive a transcript of a conversation between the chatbot and the user, and the existing set of notes. You must use the available functions to update the notes according to the conversation.
If the user makes a contradictory statement to something in the notes, that note should be deleted.
If there is no new meaningful information in the conversation, you should call the doNothing function.`
        ),
        prompt: `Existing notes:\n\n"""${JSON.stringify(formattedNotes)}"""\n\nConversation:\n\n"""${JSON.stringify(formattedMessages)}"""\n\n`,
        toolChoice: "required",
        tools: {
            createNote: {
                description: "Create a note for a new piece of information",
                parameters: z.object({
                    content: z.string().describe("Text content of note")
                }),
                execute: async function ({ content }) {
                    await insertNote({ content, userId });
                }
            },
            deleteNote: {
                description: "Delete a note",
                parameters: z.object({
                    content: z.string().describe("Text content of note to be deleted")
                }),
                execute: async function ({ content }) {
                    const note = existingNotes.find((obj) => obj.content === content);
                    if (note) {
                        await deleteNote(note.id);
                    }
                }
            },
            doNothing: {
                description: "For when there is no new information to add",
                parameters: z.object({}),
                execute: async () => {
                    // pass
                }
            }
        }
    });
}

export async function updateNotes(messages: CoreMessage[], userId: string) {
    const existingNotes = await getNotesByUserID(userId);
    await modifyNotes(existingNotes, messages, userId);
}