"use client";

import { createClient } from "@/lib/supabase/client";

// One bucket holds thumbnails for both classes and cohorts — keeps the dashboard
// setup to one place. The "class-" prefix is a historical name, not a constraint.
const THUMBNAILS_BUCKET = "class-thumbnails";

/** Upload a thumbnail file to Supabase Storage; returns the public URL. */
export async function uploadThumbnail(file: File): Promise<string> {
  const supabase = createClient();

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(THUMBNAILS_BUCKET).upload(path, file, {
    cacheControl: "31536000", // content-addressed via UUID — safe to cache 1 year
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(THUMBNAILS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** @deprecated use uploadThumbnail */
export const uploadClassThumbnail = uploadThumbnail;
