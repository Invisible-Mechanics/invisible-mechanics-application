import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET() {
  const dir = path.join(process.cwd(), "src", "lib", "thumbnail");
  const preferred = ["cohort.jpg", "cohort.png", "cohort.webp", "cohort.jpeg"];

  try {
    const files = await readdir(dir);
    const lowerMap = new Map(files.map((file) => [file.toLowerCase(), file]));
    const exact = preferred.map((file) => lowerMap.get(file)).find(Boolean);
    const fallback = files.find((file) => {
      const lower = file.toLowerCase();
      return lower.includes("cohort") && [".jpg", ".jpeg", ".png", ".webp"].some((ext) => lower.endsWith(ext));
    });
    const file = exact ?? fallback;
    if (!file) return new NextResponse(null, { status: 404 });

    const bytes = await readFile(path.join(dir, file));
    const ext = path.extname(file).toLowerCase();
    return new NextResponse(bytes, {
      headers: {
        "Cache-Control": "public, max-age=3600",
        "Content-Type": MIME[ext] ?? "application/octet-stream",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
