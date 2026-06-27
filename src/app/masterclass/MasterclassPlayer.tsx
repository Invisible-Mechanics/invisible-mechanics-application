"use client";

import { useState } from "react";
import { masterclassThumbnailPath } from "@/lib/masterclass";

export function MasterclassPlayer() {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageOk, setImageOk] = useState(true);

  return (
    <>
      <section className="relative left-1/2 flex min-h-[calc(100dvh-4rem)] w-screen -translate-x-1/2 items-center justify-center overflow-hidden bg-[#08080d] px-4 py-8 text-white sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,91,255,0.24),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/20 to-transparent" />
        <div className="relative w-full max-w-6xl overflow-hidden rounded-xl border border-white/12 bg-black shadow-2xl">
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
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <button
                type="button"
                aria-label="Play masterclass"
                onClick={() => setModalOpen(true)}
                className="group inline-flex h-20 w-20 items-center justify-center rounded-full border border-white/35 bg-black/35 shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black/45 sm:h-28 sm:w-28"
              >
                <span className="ml-1.5 h-0 w-0 border-y-[15px] border-l-[24px] border-y-transparent border-l-white drop-shadow sm:border-y-[21px] sm:border-l-[34px]" />
              </button>
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
