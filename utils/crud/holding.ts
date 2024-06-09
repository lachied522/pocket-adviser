
import { type Holding } from '@prisma/client';
import { getPrismaClient } from './client';

const prisma = getPrismaClient();
 
export async function getHoldings(): Promise<Holding[]> {
  return await prisma.holding.findMany();
}

export async function insertHolding(data: Omit<Holding, 'id'>) {
  return await prisma.holding.create({
    data,
  });
}

export async function updateHolding(data: Holding) {
  return await prisma.holding.update({
    where: {
      id: data.id,
    },
    data: {
      symbol: data.symbol,
      units: data.units,
    },
  });
}

export async function deleteHolding(data: Holding) {
  return await prisma.holding.delete({
    where: {
      id: data.id,
    },
  });
}