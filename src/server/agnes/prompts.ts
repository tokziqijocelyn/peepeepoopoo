import type { ChatMessage } from "./client";

export function describeClothingMessages(imageUrl: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a fashion expert AI. Analyze clothing items and return structured JSON.",
    },
    {
      role: "user",
      content: `Analyze this clothing item image: ${imageUrl}

Return ONLY valid JSON with these fields:
{
  "category": "top" | "bottom" | "outerwear" | "shoes" | "accessory",
  "color": "primary color",
  "description": "brief description of the item",
  "tags": ["style_tag_1", "style_tag_2"]
}`,
    },
  ];
}

export function generateOutfitCombosMessages(
  clothingItems: { id: string; description: string; category: string; color: string | null }[],
  styleProfile: { aesthetics: string | null; preferredColors: string | null; occasions: string | null } | null,
  recentLikes: string[],
): ChatMessage[] {
  const itemList = clothingItems
    .map((item) => `- ID: ${item.id}, Category: ${item.category}, Color: ${item.color ?? "unknown"}, Description: ${item.description}`)
    .join("\n");

  const styleInfo = styleProfile
    ? `User style: aesthetics=${styleProfile.aesthetics ?? "any"}, colors=${styleProfile.preferredColors ?? "any"}, occasions=${styleProfile.occasions ?? "any"}`
    : "No style profile available yet.";

  const likesInfo =
    recentLikes.length > 0
      ? `Recently liked outfit vibes: ${recentLikes.join("; ")}`
      : "";

  return [
    {
      role: "system",
      content:
        "You are a fashion stylist AI. Create outfit combinations from the user's wardrobe. Return ONLY valid JSON.",
    },
    {
      role: "user",
      content: `Wardrobe items:
${itemList}

${styleInfo}
${likesInfo}

Suggest 5 outfit combinations. Each outfit MUST use items from the wardrobe list above using their exact IDs. Return ONLY valid JSON array:
[
  {
    "title": "Outfit name",
    "description": "One-line vibe description",
    "itemIds": ["id1", "id2"],
    "visualPrompt": "Detailed prompt to generate an image of someone wearing this outfit"
  }
]`,
    },
  ];
}

export function outfitVisualizationPrompt(
  outfitDescription: string,
  clothingDescriptions: string[],
): string {
  const items = clothingDescriptions.join(", ");
  return `Fashion editorial photograph of a person wearing: ${items}. ${outfitDescription}. Full body shot, studio lighting, clean white background, high fashion editorial style, professional photography, sharp focus.`;
}

export function tryOnVisualizationPrompt(
  outfitDescription: string,
  clothingDescriptions: string[],
  personDescription?: string,
): string {
  const items = clothingDescriptions.join(", ");
  const person = personDescription
    ? `A person matching this description: ${personDescription}, confidently wearing`
    : "A person confidently wearing";
  return `Photorealistic fashion photograph: ${person} ${items}. ${outfitDescription}. Full body portrait, natural pose, studio lighting, magazine-quality, high resolution, clean background.`;
}

export function describePersonMessages(bodyPhotoUrl: string): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a helpful assistant that describes a person's physical appearance for use in AI image generation prompts. Be detailed but respectful.",
    },
    {
      role: "user",
      content: `Describe the person in this photo for use in an AI image generation prompt: ${bodyPhotoUrl}

Focus on: approximate age range, gender presentation, skin tone, hair color/style/length, body build/height impression, and any distinctive features.

Return ONLY a single concise paragraph (2-3 sentences) describing the person's appearance. Do not include clothing descriptions.`,
    },
  ];
}

export function styleQuestionnaireMessages(answers: {
  gender: string;
  aesthetics: string[];
  colors: string[];
  budget: string;
  occasions: string[];
}): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a fashion profile analyst. Analyze questionnaire answers and return a structured style profile as JSON.",
    },
    {
      role: "user",
      content: `Fashion questionnaire answers:
- Gender expression: ${answers.gender}
- Preferred aesthetics: ${answers.aesthetics.join(", ")}
- Preferred colors: ${answers.colors.join(", ")}
- Budget range: ${answers.budget}
- Primary occasions: ${answers.occasions.join(", ")}

Return ONLY valid JSON:
{
  "aesthetics": ["array of refined style tags"],
  "preferredColors": ["array of colors"],
  "budgetRange": "low" | "mid" | "high",
  "occasions": ["array of occasions"],
  "gender": "the gender expression",
  "summary": "A one-paragraph style profile summary"
}`,
    },
  ];
}

export function shopListingsMessages(styleProfile: {
  aesthetics: string | null;
  preferredColors: string | null;
  budgetRange: string | null;
  occasions: string | null;
  gender: string | null;
}): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a fashion retail AI. Generate realistic product listings that match a user's style profile. Return ONLY valid JSON.",
    },
    {
      role: "user",
      content: `User style profile:
- Aesthetics: ${styleProfile.aesthetics ?? "versatile"}
- Preferred colors: ${styleProfile.preferredColors ?? "neutral"}
- Budget: ${styleProfile.budgetRange ?? "mid"}
- Occasions: ${styleProfile.occasions ?? "casual"}
- Gender: ${styleProfile.gender ?? "unisex"}

Generate 12 clothing product listings. Each product should be from one of these stores: SHEIN, Zalora, H&M, UNIQLO, ZARA. Return ONLY valid JSON array:
[
  {
    "name": "Product name",
    "description": "Short product description",
    "price": 29.90,
    "currency": "SGD",
    "store": "Store name",
    "category": "tops" | "bottoms" | "outerwear" | "shoes" | "accessories",
    "imagePrompt": "Detailed prompt to generate a product image for this item"
  }
]`,
    },
  ];
}
