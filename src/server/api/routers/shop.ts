import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { agnesChat } from "~/server/agnes/client";

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

export const shopRouter = createTRPCRouter({
  getListings: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile } = await ctx.supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single();

    if (!profile) return [];

    const profileData = profile as Record<string, unknown>;
    const aesthetics = profileData.aesthetics as string | null;
    const colors = profileData.preferred_colors as string | null;
    const budget = profileData.budget_range as string | null;
    const occasions = profileData.occasions as string | null;
    const gender = profileData.gender as string | null;

    const raw = await agnesChat([
      {
        role: "system",
        content: "You are a fashion product catalog AI. Return ONLY valid JSON.",
      },
      {
        role: "user",
        content: `Generate 50 clothing product listings for someone with this style:
- Aesthetics: ${aesthetics ?? "versatile"}
- Colors: ${colors ?? "neutral"}
- Budget: ${budget ?? "mid"}
- Occasions: ${occasions ?? "casual"}
- Gender: ${gender ?? "unisex"}

For each item, provide a real image URL from Unsplash using this format: https://source.unsplash.com/400x500/?{search_terms} where search_terms are relevant comma-separated keywords for the clothing item (e.g. "black,leather,jacket" or "white,linen,shirt").

Return a JSON array of 50 items:
[
  {
    "name": "Product name",
    "description": "One-line description",
    "imageUrl": "https://source.unsplash.com/400x500/?relevant,search,terms"
  }
]`,
      },
    ]);

    let products: { name: string; description: string; imageUrl: string }[];

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      products = JSON.parse(cleaned) as typeof products;
    } catch {
      return [];
    }

    return products.slice(0, 50).map((product): ShopListing => ({
      name: product.name,
      description: product.description,
      price: randomPrice(budget),
      currency: "SGD",
      store: randomStore(),
      category: "clothing",
      imageUrl: product.imageUrl || `https://source.unsplash.com/400x500/?fashion,clothing`,
    }));
  }),
});
