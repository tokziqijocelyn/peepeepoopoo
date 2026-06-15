import { wardrobeRouter } from "~/server/api/routers/wardrobe";
import { shopRouter } from "~/server/api/routers/shop";
import { styleRouter } from "~/server/api/routers/style";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

export const appRouter = createTRPCRouter({
  wardrobe: wardrobeRouter,
  shop: shopRouter,
  style: styleRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
