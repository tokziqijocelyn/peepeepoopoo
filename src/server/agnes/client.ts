import { env } from "~/env";

const BASE_URL = env.AGNES_API_BASE;
const API_KEY = env.AGNES_API_KEY;

const headers = () => ({
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  choices: { message: { content: string } }[];
}

interface ImageResponse {
  data: { url: string }[];
}

export async function agnesChat(messages: ChatMessage[]): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agnes chat failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as ChatResponse;
  return data.choices[0]?.message.content ?? "";
}

export async function agnesImage(
  prompt: string,
  size = "768x1024",
): Promise<string> {
  const res = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model: "agnes-image-2.1-flash",
      prompt,
      size,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Agnes image failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as ImageResponse;
  return data.data[0]?.url ?? "";
}
