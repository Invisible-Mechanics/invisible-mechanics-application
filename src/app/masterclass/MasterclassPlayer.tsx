"use client";

import { useEffect, useState } from "react";
import { masterclassThumbnailPath } from "@/lib/masterclass";

const LIVE_AT = new Date("2026-07-06T18:00:00+05:30").getTime();

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Starting now";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export function MasterclassPlayer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageOk, setImageOk] = useState(true);
  const [remaining, setRemaining] = useState(() => LIVE_AT - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(LIVE_AT - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <section className="relative flex min-h-[calc(100dvh-4rem)] w-full items-center justify-center overflow-hidden rounded-xl bg-[#08080d] px-3 py-8 text-white sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,91,255,0.24),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/20 to-transparent" />
        <div className="relative w-full max-w-5xl overflow-hidden rounded-xl border border-white/12 bg-black shadow-2xl">
          <div className="relative aspect-[16/9] w-full">
            {imageOk ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={masterclassThumbnailPath}
                alt="Masterclass"
                onError={() => setImageOk(false)}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,#2b2358,#08080b_65%)] text-sm text-white/55">
                Masterclass
              </div>
            )}
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 text-center">
              <button
                type="button"
                aria-label="Play masterclass"
                onClick={() => setModalOpen(true)}
                className="group inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-black/35 shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black/45 sm:h-28 sm:w-28"
              >
                <span className="ml-1.5 h-0 w-0 border-y-[15px] border-l-[24px] border-y-transparent border-l-white drop-shadow sm:border-y-[21px] sm:border-l-[34px]" />
              </button>
              <div className="rounded-full border border-white/20 bg-black/45 px-4 py-2 text-white shadow-xl backdrop-blur-md sm:px-5 sm:py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Starts in
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums sm:text-base">
                  {formatCountdown(remaining)}
                </p>
                <p className="mt-1 text-[11px] text-white/65">
                  Live on 6 July 2026, 6:00 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-white/15 bg-zinc-950 p-6 text-center text-white shadow-2xl sm:p-8">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setModalOpen(false)}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              x
            </button>
            <div className="mt-2 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/20 text-2xl">
                {"\uD83C\uDFAC"}
              </div>
              <p className="text-xl font-semibold tracking-tight sm:text-2xl">
                {"\uD83C\uDFAC"} Going Live on 6th July 2026 at 6:00 PM
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
