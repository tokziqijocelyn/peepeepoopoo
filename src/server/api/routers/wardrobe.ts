import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { agnesChat, agnesImage } from "~/server/agnes/client";
import {
  describeClothingMessages,
  generateOutfitCombosMessages,
  outfitVisualizationPrompt,
  tryOnVisualizationPrompt,
  describePersonMessages,
} from "~/server/agnes/prompts";

interface ClothingRow {
  id: string;
  image_url: string;
  category: string;
  color: string | null;
  description: string | null;
  tags: string | null;
  created_at: string;
}

interface OutfitRow {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

interface OutfitItemRow {
  id: string;
  clothing_item_id: string;
  clothing_items: ClothingRow;
}

export const wardrobeRouter = createTRPCRouter({
  uploadItem: protectedProcedure
    .input(z.object({ imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const messages = describeClothingMessages(input.imageUrl);
      const raw = await agnesChat(messages);

      let parsed: {
        category: string;
        color: string;
        description: string;
        tags: string[];
      };

      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleaned) as typeof parsed;
      } catch {
        parsed = {
          category: "top",
          color: "unknown",
          description: "Clothing item",
          tags: [],
        };
      }

      const { data } = await ctx.supabase
        .from("clothing_items")
        .insert({
          user_id: ctx.user.id,
          image_url: input.imageUrl,
          category: parsed.category,
          color: parsed.color,
          description: parsed.description,
          tags: JSON.stringify(parsed.tags),
        })
        .select()
        .single();

      return data;
    }),

  getItems: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });
    return (data ?? []) as ClothingRow[];
  }),

  deleteItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase
        .from("clothing_items")
        .delete()
        .eq("id", input.id)
        .eq("user_id", ctx.user.id);
    }),

  generateOutfits: protectedProcedure.mutation(async ({ ctx }) => {
    const { data: items } = await ctx.supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", ctx.user.id);

    const clothingItems = (items ?? []) as ClothingRow[];
    if (clothingItems.length < 2) return [];

    const { data: styleProfile } = await ctx.supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single();

    const { data: recentLikesData } = await ctx.supabase
      .from("swipe_history")
      .select("outfit_id, outfits(description)")
      .eq("user_id", ctx.user.id)
      .eq("direction", "right")
      .order("created_at", { ascending: false })
      .limit(10);

    const recentLikes = (recentLikesData ?? []).map((row: Record<string, unknown>) => {
      const outfits = row.outfits as { description: string | null } | null;
      return outfits?.description ?? "";
    });

    const messages = generateOutfitCombosMessages(
      clothingItems.map((item) => ({
        id: item.id,
        description: item.description ?? "Clothing item",
        category: item.category,
        color: item.color,
      })),
      styleProfile
        ? {
            aesthetics: (styleProfile as Record<string, unknown>).aesthetics as string | null,
            preferredColors: (styleProfile as Record<string, unknown>).preferred_colors as string | null,
            occasions: (styleProfile as Record<string, unknown>).occasions as string | null,
          }
        : null,
      recentLikes,
    );

    const raw = await agnesChat(messages);

    let combos: {
      title: string;
      description: string;
      itemIds: string[];
      visualPrompt: string;
    }[];

    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      combos = JSON.parse(cleaned) as typeof combos;
    } catch {
      return [];
    }

    const validItemIds = new Set(clothingItems.map((item) => item.id));

    const validCombos = combos.slice(0, 5).map((combo) => {
      const validIds = combo.itemIds.filter((id) => validItemIds.has(id));
      const comboItems = clothingItems.filter((item) => validIds.includes(item.id));
      const descriptions = comboItems.map((item) => item.description ?? item.category);
      return { ...combo, validIds, comboItems, imgPrompt: outfitVisualizationPrompt(combo.description, descriptions) };
    }).filter((c) => c.validIds.length > 0);

    const imageResults = await Promise.allSettled(
      validCombos.map((c) => agnesImage(c.imgPrompt)),
    );

    const outfits = [];
    for (let i = 0; i < validCombos.length; i++) {
      const combo = validCombos[i]!;
      const imgResult = imageResults[i];
      const imageUrl = imgResult?.status === "fulfilled" ? imgResult.value : null;

      const { data: outfit } = await ctx.supabase
        .from("outfits")
        .insert({
          user_id: ctx.user.id,
          title: combo.title,
          description: combo.description,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (!outfit) continue;
      const outfitRow = outfit as OutfitRow;

      await ctx.supabase.from("outfit_items").insert(
        combo.validIds.map((itemId) => ({
          outfit_id: outfitRow.id,
          clothing_item_id: itemId,
        })),
      );

      outfits.push({
        ...outfitRow,
        items: combo.comboItems.map((item) => ({
          clothing_item_id: item.id,
          clothing_items: item,
        })),
      });
    }

    return outfits;
  }),

  getOutfitQueue: protectedProcedure.query(async ({ ctx }) => {
    const { data: swipedData } = await ctx.supabase
      .from("swipe_history")
      .select("outfit_id")
      .eq("user_id", ctx.user.id);
    const swipedSet = new Set((swipedData ?? []).map((s: { outfit_id: string }) => s.outfit_id));

    const { data: outfitsData } = await ctx.supabase
      .from("outfits")
      .select("*, outfit_items(*, clothing_items(*))")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false });

    const outfits = (outfitsData ?? []) as (OutfitRow & { outfit_items: OutfitItemRow[] })[];
    return outfits
      .filter((o) => !swipedSet.has(o.id))
      .map((o) => ({
        id: o.id,
        title: o.title,
        description: o.description,
        imageUrl: o.image_url,
        items: o.outfit_items.map((oi) => ({
          clothingItem: {
            id: oi.clothing_items.id,
            imageUrl: oi.clothing_items.image_url,
            category: oi.clothing_items.category,
            description: oi.clothing_items.description,
          },
        })),
      }));
  }),

  swipe: protectedProcedure
    .input(z.object({
      outfitId: z.string(),
      direction: z.enum(["left", "right"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.supabase.from("swipe_history").insert({
        user_id: ctx.user.id,
        outfit_id: input.outfitId,
        direction: input.direction,
      });
    }),

  getOutfitDetail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("outfits")
        .select("*, outfit_items(*, clothing_items(*))")
        .eq("id", input.id)
        .eq("user_id", ctx.user.id)
        .single();

      if (!data) return null;
      const outfit = data as OutfitRow & { outfit_items: OutfitItemRow[] };

      return {
        id: outfit.id,
        title: outfit.title,
        description: outfit.description,
        imageUrl: outfit.image_url,
        items: outfit.outfit_items.map((oi) => ({
          id: oi.id,
          clothingItem: {
            id: oi.clothing_items.id,
            imageUrl: oi.clothing_items.image_url,
            category: oi.clothing_items.category,
            description: oi.clothing_items.description,
          },
        })),
      };
    }),

  generateTryOn: protectedProcedure
    .input(z.object({ outfitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [{ data }, { data: profile }] = await Promise.all([
        ctx.supabase
          .from("outfits")
          .select("*, outfit_items(*, clothing_items(*))")
          .eq("id", input.outfitId)
          .single(),
        ctx.supabase
          .from("profiles")
          .select("body_photo_url")
          .eq("id", ctx.user.id)
          .single(),
      ]);

      if (!data) throw new Error("Outfit not found");
      const outfit = data as OutfitRow & { outfit_items: OutfitItemRow[] };
      const bodyPhotoUrl = (profile as { body_photo_url: string | null } | null)?.body_photo_url;

      let personDescription: string | undefined;
      if (bodyPhotoUrl) {
        try {
          personDescription = await agnesChat(describePersonMessages(bodyPhotoUrl));
        } catch {
          // Fall back to generic if description fails
        }
      }

      const descriptions = outfit.outfit_items.map(
        (oi) => oi.clothing_items.description ?? oi.clothing_items.category,
      );
      const prompt = tryOnVisualizationPrompt(
        outfit.description ?? "stylish outfit",
        descriptions,
        personDescription,
      );

      const imageUrl = await agnesImage(prompt);

      await ctx.supabase
        .from("outfits")
        .update({ image_url: imageUrl })
        .eq("id", input.outfitId);

      return imageUrl;
    }),
});
