"use client";

import { useEffect, useState } from "react";
import { masterclassThumbnailPath } from "@/lib/masterclass";
import { trackMasterclassEnrollmentConfirmed } from "@/lib/masterclass-tracking";

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
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setRemaining(LIVE_AT - Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    trackMasterclassEnrollmentConfirmed().then((ok) => {
      if (ok) setEnrolled(true);
    });
  }, []);

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-4rem)] w-full items-center justify-center overflow-hidden rounded-xl bg-[#08080d] px-3 py-6 text-white sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:py-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,91,255,0.24),transparent_58%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-500/20 to-transparent" />
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/12 bg-black/70 p-0 shadow-2xl sm:hidden">
          <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
          </div>
          <div className="space-y-4 px-5 pb-6 pt-5 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-100">
              Invisible Mechanics
            </p>
            <h1 className="text-3xl font-semibold tracking-tight">Live Masterclass</h1>
            <div className="rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/50">
                Starts in
              </p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{formatCountdown(remaining)}</p>
              <p className="mt-1 text-xs text-white/55">Live on 6 July 2026, 6:00 PM IST</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!enrolled) setModalOpen(true);
              }}
              disabled={enrolled}
              className="inline-flex w-full items-center justify-center rounded-lg bg-white px-5 py-3 text-base font-semibold text-zinc-950 shadow-lg transition hover:bg-brand-100 disabled:cursor-default disabled:bg-emerald-100 disabled:text-emerald-900"
            >
              {enrolled ? "Enrolled" : "Enroll Now"}
            </button>
          </div>
        </div>

        <div className="relative hidden w-full max-w-5xl overflow-hidden rounded-xl border border-white/12 bg-black shadow-2xl sm:block">
          <div className="relative aspect-video w-full">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/20" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center sm:gap-5 sm:px-4">
              <button
                type="button"
                aria-label="Play masterclass"
                onClick={() => setModalOpen(true)}
                className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/35 shadow-2xl backdrop-blur-md transition hover:scale-105 hover:bg-black/45 sm:h-28 sm:w-28"
              >
                <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white drop-shadow sm:ml-1.5 sm:border-y-[21px] sm:border-l-[34px]" />
              </button>
              <div className="max-w-[calc(100%-1rem)] rounded-2xl border border-white/20 bg-black/55 px-3 py-2 text-white shadow-xl backdrop-blur-md sm:rounded-full sm:px-5 sm:py-2.5">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/60 sm:text-[10px] sm:tracking-[0.24em]">
                  Starts in
                </p>
                <p className="mt-0.5 whitespace-nowrap text-[11px] font-semibold tabular-nums sm:text-base">
                  {formatCountdown(remaining)}
                </p>
                <p className="mt-1 text-[9px] leading-snug text-white/65 sm:text-[11px]">
                  Live on 6 July 2026, 6:00 PM IST
                </p>
                {enrolled && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    Enrolled
                  </p>
                )}
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
