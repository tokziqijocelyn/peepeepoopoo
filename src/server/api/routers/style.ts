import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { agnesChat } from "~/server/agnes/client";
import { styleQuestionnaireMessages } from "~/server/agnes/prompts";

export const styleRouter = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("style_profiles")
      .select("*")
      .eq("user_id", ctx.user.id)
      .single();
    return data;
  }),

  getBodyPhoto: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("profiles")
      .select("body_photo_url")
      .eq("id", ctx.user.id)
      .single();
    return (data as { body_photo_url: string | null } | null)?.body_photo_url ?? null;
  }),

  processQuestionnaire: protectedProcedure
    .input(
      z.object({
        gender: z.string(),
        aesthetics: z.array(z.string()),
        colors: z.array(z.string()),
        budget: z.string(),
        occasions: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const messages = styleQuestionnaireMessages(input);
      const raw = await agnesChat(messages);

      let parsed: {
        aesthetics: string[];
        preferredColors: string[];
        budgetRange: string;
        occasions: string[];
        gender: string;
      };

      try {
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleaned) as typeof parsed;
      } catch {
        parsed = {
          aesthetics: input.aesthetics,
          preferredColors: input.colors,
          budgetRange: input.budget,
          occasions: input.occasions,
          gender: input.gender,
        };
      }

      const row = {
        user_id: ctx.user.id,
        aesthetics: JSON.stringify(parsed.aesthetics),
        preferred_colors: JSON.stringify(parsed.preferredColors),
        budget_range: parsed.budgetRange,
        occasions: JSON.stringify(parsed.occasions),
        gender: parsed.gender,
        raw_answers: JSON.stringify(input),
        updated_at: new Date().toISOString(),
      };

      const { data } = await ctx.supabase
        .from("style_profiles")
        .upsert(row, { onConflict: "user_id" })
        .select()
        .single();

      return data;
    }),

  uploadBodyPhoto: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from("profiles")
        .update({ body_photo_url: input.url })
        .eq("id", ctx.user.id)
        .select()
        .single();
      return data;
    }),

  getRecentLikes: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from("swipe_history")
      .select("outfit_id, outfits(description)")
      .eq("user_id", ctx.user.id)
      .eq("direction", "right")
      .order("created_at", { ascending: false })
      .limit(10);

    return (data ?? []).map((row: Record<string, unknown>) => {
      const outfits = row.outfits as { description: string | null } | null;
      return outfits?.description ?? "";
    });
  }),
});
