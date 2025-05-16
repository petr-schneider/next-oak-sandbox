// server/trpc/context.ts

import { prisma } from "@/server/prisma"; // If you're using Prisma for DB access
import { NextApiRequest, NextApiResponse } from "next";

import { getServerSession } from "next-auth";

export async function createContext() {
  const session = await getServerSession();
  return { session, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
