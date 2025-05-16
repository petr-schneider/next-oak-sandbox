// app/api/trpc/[trpc]/route.ts
import { appRouter } from '@/server/router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { createContext } from '@/server/context';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext, 
  });

export { handler as GET, handler as POST };