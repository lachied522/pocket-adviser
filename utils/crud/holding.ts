
import { getPrismaClient } from './client';

import type { Holding } from '@prisma/client';

const prisma = getPrismaClient();
 
export async function getHoldingsByUserId(userId: string) {
  return await prisma.holding.findMany({
    where: { userId }
  });
}

export async function getHoldingsWithStocks(userId: string) {
  return await prisma.holding.findMany({
    where: { userId },
    relationLoadStrategy: "join",
    include: {
      stock: true,
    }
  });
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
      stockId: data.stockId,
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