"use client";

import { useRef, useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { api } from "~/trpc/react";
import { createSupabaseBrowserClient } from "~/lib/supabase/client";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export function BodyPhotoUpload({ onComplete, onSkip }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  const uploadMutation = api.style.uploadBodyPhoto.useMutation({
    onSuccess: () => onComplete(),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `body-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from("clothing")
      .upload(path, file);

    if (error || !data) {
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("clothing")
      .getPublicUrl(data.path);

    uploadMutation.mutate({ url: urlData.publicUrl });
  };

  return (
    <div className="flex min-h-dvh flex-col px-6 py-8">
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">One last thing</h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Upload a full-body photo so we can show you how outfits look on you
          </p>
        </div>

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Body reference"
              className="h-80 w-56 rounded-2xl object-cover"
            />
            <button
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              className="absolute -right-2 -top-2 rounded-full bg-[var(--color-bg-elevated)] p-1.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-80 w-56 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] transition-colors hover:border-[var(--color-accent)]"
          >
            <Camera className="h-10 w-10 text-[var(--color-text-secondary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Tap to upload
            </span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        <div className="rounded-xl bg-[var(--color-bg-card)] p-4">
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">
            Tips for best results:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-[var(--color-text-secondary)]">
            <li>- Stand straight with arms at your sides</li>
            <li>- Good, even lighting</li>
            <li>- Wear simple, neutral clothing</li>
            <li>- Full body visible, head to toe</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6">
        {preview && (
          <button
            onClick={() => void handleUpload()}
            disabled={uploading}
            className="flex items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Use this photo"}
          </button>
        )}
        <button
          onClick={onSkip}
          className="text-sm text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
