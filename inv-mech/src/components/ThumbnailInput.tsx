"use client";

import { useState } from "react";
import { uploadThumbnail } from "@/lib/storage";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ThumbnailInput({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // dragDepth handles enter/leave noise from nested children inside the drop zone.
  const [dragDepth, setDragDepth] = useState(0);
  const isDragging = dragDepth > 0;

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("File must be an image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 5 MB.`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadThumbnail(file);
      setUrl(uploaded);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  function onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setDragDepth((d) => d + 1);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragDepth((d) => Math.max(0, d - 1));
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragDepth(0);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <div className="space-y-2">
      {url ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Thumbnail preview"
            className="aspect-video w-full max-w-sm rounded-md border border-black/10 object-cover"
          />
          <div className="flex items-center gap-3">
            <label className="cursor-pointer rounded-md border border-black/15 px-3 py-1.5 text-sm hover:bg-black/5">
              Replace image
              <input
                type="file"
                accept="image/*"
                onChange={onFileInput}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              onClick={() => setUrl("")}
              className="text-xs text-black/60 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          className={`flex aspect-video w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 text-center transition ${
            isDragging
              ? "border-ink bg-black/5"
              : "border-black/20 hover:border-black/40 hover:bg-black/[0.02]"
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={onFileInput}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <>
              <UploadIcon className="h-8 w-8 animate-pulse text-black/50" />
              <p className="text-sm text-black/70">Uploading…</p>
            </>
          ) : (
            <>
              <UploadIcon className="h-8 w-8 text-black/40" />
              <p className="text-sm font-medium">
                {isDragging ? "Drop to upload" : "Drag an image here"}
              </p>
              <p className="text-xs text-black/60">
                or click to browse · JPG, PNG, WebP · max 5 MB
              </p>
            </>
          )}
        </label>
      )}

      <input
        type="url"
        name={name}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…or paste an image URL"
        className="w-full rounded-md border border-black/15 px-3 py-2 text-sm"
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
