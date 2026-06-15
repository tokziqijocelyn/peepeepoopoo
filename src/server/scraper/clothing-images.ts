/**
 * Scrapes real clothing products (name, description, image) from public
 * fashion APIs (DummyJSON + FakeStore) so listings always match their images.
 */

export interface ScrapedProduct {
  name: string;
  description: string;
  imageUrl: string;
  category: string;
}

let cachedProducts: ScrapedProduct[] | null = null;
let scrapePromise: Promise<ScrapedProduct[]> | null = null;

interface DummyProduct {
  title: string;
  description: string;
  images: string[];
  thumbnail: string;
  category: string;
}

interface DummyResponse {
  products: DummyProduct[];
}

interface FakeStoreProduct {
  title: string;
  description: string;
  image: string;
  category: string;
}

const DUMMY_CATEGORY_MAP: Record<string, string> = {
  tops: "tops",
  "womens-dresses": "bottoms",
  "mens-shirts": "tops",
  "mens-shoes": "shoes",
  "womens-shoes": "shoes",
  "womens-bags": "accessories",
  "womens-jewellery": "accessories",
  "mens-watches": "accessories",
  sunglasses: "accessories",
};

async function scrapeDummyJSON(): Promise<ScrapedProduct[]> {
  const categories = Object.keys(DUMMY_CATEGORY_MAP);
  const products: ScrapedProduct[] = [];

  const results = await Promise.allSettled(
    categories.map(async (cat) => {
      const res = await fetch(
        `https://dummyjson.com/products/category/${cat}?limit=50`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) return [];

      const data = (await res.json()) as DummyResponse;
      return (data.products ?? []).map(
        (p): ScrapedProduct => ({
          name: p.title,
          description: p.description,
          imageUrl: p.images[0] ?? p.thumbnail,
          category: DUMMY_CATEGORY_MAP[cat] ?? "tops",
        }),
      );
    }),
  );

  for (const r of results) {
    if (r.status === "fulfilled") products.push(...r.value);
  }

  return products;
}

async function scrapeFakeStore(): Promise<ScrapedProduct[]> {
  try {
    const res = await fetch("https://fakestoreapi.com/products", {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];

    const all = (await res.json()) as FakeStoreProduct[];
    return all
      .filter(
        (p) =>
          p.category === "men's clothing" || p.category === "women's clothing",
      )
      .map(
        (p): ScrapedProduct => ({
          name: p.title,
          description:
            p.description.length > 80
              ? p.description.slice(0, 77) + "..."
              : p.description,
          imageUrl: p.image,
          category: "tops",
        }),
      );
  } catch {
    return [];
  }
}

async function scrapeAll(): Promise<ScrapedProduct[]> {
  const [dummy, fake] = await Promise.all([
    scrapeDummyJSON(),
    scrapeFakeStore(),
  ]);
  return [...dummy, ...fake];
}

export async function getScrapedProducts(): Promise<ScrapedProduct[]> {
  if (cachedProducts) return cachedProducts;

  if (!scrapePromise) {
    scrapePromise = scrapeAll().then((products) => {
      cachedProducts = products;
      scrapePromise = null;
      return products;
    });
  }

  return scrapePromise;
}
