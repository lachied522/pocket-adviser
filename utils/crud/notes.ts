
import { getPrismaClient } from './client';

import type { Note } from '@prisma/client';

const prisma = getPrismaClient();
 
export async function getNotesByUserID(userId: string) {
  return await prisma.note.findMany({
    where: { userId }
  });
}

export async function insertNote(data: Omit<Note, 'id'|'createdAt'>) {
  return await prisma.note.create({
    data,
  });
}

export async function deleteNote(id: string) {
  return await prisma.note.delete({
    where: { id },
  });
}