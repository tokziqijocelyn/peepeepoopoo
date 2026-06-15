import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { getScrapedProducts } from "~/server/scraper/clothing-images";

export interface ShopListing {
  name: string;
  description: string;
  price: number;
  currency: string;
  store: string;
  category: string;
  imageUrl: string;
}

const STORES = ["SHEIN", "Zalora", "H&M", "UNIQLO", "ZARA"];

function randomStore() {
  return STORES[Math.floor(Math.random() * STORES.length)]!;
}

function randomPrice(budget: string | null) {
  const ranges: Record<string, [number, number]> = {
    Low: [5, 30],
    Mid: [20, 80],
    High: [60, 200],
  };
  const [min, max] = ranges[budget ?? "Mid"] ?? [15, 60];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export const shopRouter = createTRPCRouter({
  getListings: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single();

    if (!profile) return [];

    const profileData = profile as Record<string, unknown>;
    const budget = profileData.budget_range as string | null;

    const scraped = await getScrapedProducts();

    return shuffle(scraped)
      .slice(0, 20)
      .map(
        (product): ShopListing => ({
          name: product.name,
          description: product.description,
          price: randomPrice(budget),
          currency: "SGD",
          store: randomStore(),
          category: product.category,
          imageUrl: product.imageUrl,
        }),
      );
  }),
});
