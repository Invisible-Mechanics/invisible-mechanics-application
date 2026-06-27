"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { masterclassPath, masterclassThumbnailPath } from "@/lib/masterclass";
import { trackMasterclassEnrollClick } from "@/lib/masterclass-tracking";

export function MasterclassAdModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [imageOk, setImageOk] = useState(true);
  const loginPath = `/login?next=${encodeURIComponent(masterclassPath)}`;

  useEffect(() => {
    const id = window.setTimeout(() => setOpen(true), 80);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    router.prefetch(loginPath);
  }, [loginPath, router]);

  if (!open) return null;

  function enroll() {
    trackMasterclassEnrollClick("ad_modal");
    setOpen(false);
    router.push(loginPath);
  }

  return (
    <div className="masterclass-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl border border-white/15 bg-zinc-950 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-xl leading-none text-white/80 transition hover:bg-white/15 hover:text-white"
        >
          x
        </button>
        <div className="relative">
          {imageOk ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={masterclassThumbnailPath}
              alt="Masterclass"
              onError={() => setImageOk(false)}
              className="aspect-[16/9] w-full bg-zinc-900 object-cover"
            />
          ) : (
            <div className="flex aspect-[16/9] w-full items-center justify-center bg-zinc-900 text-sm text-white/55">
              Masterclass
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 to-transparent" />
        </div>
        <div className="space-y-5 px-5 pb-6 pt-4 text-center sm:px-8 sm:pb-8">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-200">
              Invisible Mechanics
            </p>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              Live Masterclass
            </h2>
          </div>
          <button
            type="button"
            onClick={enroll}
            className="inline-flex w-full items-center justify-center rounded-md bg-white px-6 py-3 text-base font-semibold text-zinc-950 transition hover:bg-brand-100 sm:w-auto"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
}
