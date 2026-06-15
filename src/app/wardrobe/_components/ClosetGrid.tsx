"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";
import { useTasks } from "~/app/_components/TaskContext";

interface ClothingItemData {
  id: string;
  image_url: string;
  category: string;
  color: string | null;
  description: string | null;
  tags: string | null;
}

export function ClosetGrid() {
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();
  const { addTask, removeTask } = useTasks();

  const itemsQuery = api.wardrobe.getItems.useQuery();
  const uploadMutation = api.wardrobe.uploadItem.useMutation({
    onSuccess: () => {
      setUploading(false);
      removeTask("clothing-upload");
      void itemsQuery.refetch();
    },
    onError: () => {
      setUploading(false);
      removeTask("clothing-upload");
    },
  });
  const deleteMutation = api.wardrobe.deleteItem.useMutation({
    onSuccess: () => {
      setSelectedItem(null);
      void itemsQuery.refetch();
    },
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    addTask({ id: "clothing-upload", label: "Uploading clothing item...", type: "upload" });

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { data, error } = await supabase.storage
      .from("clothing")
      .upload(path, file);

    if (error || !data) {
      setUploading(false);
      removeTask("clothing-upload");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("clothing")
      .getPublicUrl(data.path);

    uploadMutation.mutate({ imageUrl: urlData.publicUrl });
  };

  const items = (itemsQuery.data ?? []) as ClothingItemData[];
  const selected = items.find((item) => item.id === selectedItem);

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-1 p-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item.id)}
            className="relative aspect-square overflow-hidden rounded-lg bg-[var(--color-bg-card)]"
          >
            <Image
              src={item.image_url}
              alt={item.description ?? "Clothing"}
              fill
              className="object-cover"
              sizes="(max-width: 430px) 33vw, 140px"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
              <span className="text-[10px] capitalize text-white">
                {item.category}
              </span>
            </div>
          </button>
        ))}
      </div>

      {items.length === 0 && !itemsQuery.isLoading && (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Your closet is empty
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Add clothes to get outfit suggestions
          </p>
        </div>
      )}

      {itemsQuery.isLoading && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {Array.from({ length: 6 }).map((_, i: number) => (
            <div key={i} className="aspect-square animate-shimmer rounded-lg" />
          ))}
        </div>
      )}

      {/* FAB — anchored inside the 430px container, above toast */}
      <div className="pointer-events-none fixed bottom-28 left-1/2 z-[70] w-full max-w-[430px] -translate-x-1/2">
        <button
          onClick={() => fileRef.current?.click()}
          className="pointer-events-auto absolute bottom-0 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent)] shadow-lg transition-transform active:scale-90"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Plus className="h-5 w-5 text-white" />
          )}
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple={false}
        onChange={(e) => void handleFile(e)}
        className="hidden"
      />

      {/* Item detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[430px] rounded-t-3xl bg-[var(--color-bg)] p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold capitalize">
                {selected.category}
              </h3>
              <button onClick={() => setSelectedItem(null)}>
                <X className="h-5 w-5 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            <div className="flex gap-4">
              <div className="relative h-32 w-24 overflow-hidden rounded-xl">
                <Image
                  src={selected.image_url}
                  alt={selected.description ?? ""}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm">{selected.description}</p>
                {selected.color && (
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Color: {selected.color}
                  </p>
                )}
                {selected.tags && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(JSON.parse(selected.tags) as string[]).map((tag: string) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--color-bg-card)] px-2 py-0.5 text-[10px] text-[var(--color-text-secondary)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => deleteMutation.mutate({ id: selected.id })}
              disabled={deleteMutation.isPending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              {deleteMutation.isPending ? "Removing..." : "Remove from closet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
