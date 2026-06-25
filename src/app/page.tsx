import React from "react";
import Link from "next/link";
import { FocusHero } from "@/components/home/focus-hero/FocusHero";
import { LiteYouTube } from "@/components/LiteYouTube";
import {
  ApiError,
  listChapters,
  listClasses,
  type ChapterOut,
  type ClassOut,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const FEATURED_VIDEO_ID = "YH2pTwKYSrY";
const FEATURED_VIDEO_TITLE = "Ray Optics - One Shot Livestream";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@invisiblemechanics";

const dateFmt = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "Asia/Kolkata",
});

async function getNextClass(): Promise<ClassOut | null> {
  try {
    const classes = await listClasses({ upcomingOnly: true });
    const upcoming = classes
      .filter((c) => c.status !== "ended")
      .sort((a, b) => {
        if (a.status === "live" && b.status !== "live") return -1;
        if (b.status === "live" && a.status !== "live") return 1;
        return a.scheduled_start.localeCompare(b.scheduled_start);
      });
    return upcoming[0] ?? null;
  } catch (e) {
    if (e instanceof ApiError) return null;
    throw e;
  }
}

async function getChapters(): Promise<ChapterOut[]> {
  try {
    return await listChapters();
  } catch (e) {
    if (e instanceof ApiError) return [];
    throw e;
  }
}

export default async function HomePage() {
  const [nextClass, chapters] = await Promise.all([getNextClass(), getChapters()]);

  return (
    <div className="space-y-24">
      <FocusHero />

      {/* Stats bar */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        <Stat
          icon={
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#FF0000" fillOpacity="0.12" />
              <polygon points="13,11 13,21 22,16" fill="#FF0000" />
            </svg>
          }
          value="101K+"
          label="YouTube subscribers"
        />
        <Stat
          icon={
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#ef4444" fillOpacity="0.12" />
              <rect x="9" y="10" width="6" height="13" rx="1.5" fill="#ef4444" />
              <rect x="17" y="8" width="6" height="15" rx="1.5" fill="#ef4444" fillOpacity="0.7" />
            </svg>
          }
          value="JEE & NEET"
          label="Both syllabi, in full"
        />
        <Stat
          icon={
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#22c55e" fillOpacity="0.12" />
              <circle cx="16" cy="16" r="3" fill="#22c55e" />
              <path d="M10.5 21.5A8 8 0 0021.5 10.5" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M13 19A5 5 0 0019 13" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          }
          value="Live"
          label="+ recordings for paid plans"
        />
        <Stat
          icon={
            <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="#6a47f0" fillOpacity="0.12" />
              <path d="M16 8l6 3v6c0 3.5-2.5 6.7-6 7.5C12.5 23.7 10 20.5 10 17v-6l6-3z" fill="#6a47f0" fillOpacity="0.25" stroke="#6a47f0" strokeWidth="1.5" />
              <path d="M13.5 16l1.8 1.8 3.2-3.6" stroke="#6a47f0" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          value="Doubts"
          label="Solved in the room"
        />
      </section>

      {nextClass && <NextClassStrip cls={nextClass} />}

      {/* Inside the live room */}
      <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
            Inside the live room
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            It feels like the front row,<br />not a webinar.
          </h2>
          <p className="text-ink/70">
            Every session is a two-way room. Ask in chat, raise a hand, answer a live poll, react in
            real time - no message-us-later hand-off after class.
          </p>

          {/* Laptop illustration */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <LaptopIllustration />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Feature
            icon={
              <svg viewBox="0 0 36 36" fill="none" className="h-9 w-9" aria-hidden="true">
                <circle cx="18" cy="18" r="18" fill="#f3f0ff" />
                <circle cx="18" cy="15" r="4" fill="#7c5bff" fillOpacity="0.3" stroke="#7c5bff" strokeWidth="1.5" />
                <path d="M11 28c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#7c5bff" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            }
            title="Doubts in the room"
            body="Type a doubt or raise your hand mid-lecture. It gets picked up there and then."
          />
          <Feature
            icon={
              <svg viewBox="0 0 36 36" fill="none" className="h-9 w-9" aria-hidden="true">
                <circle cx="18" cy="18" r="18" fill="#fff7ed" />
                <rect x="10" y="22" width="4" height="7" rx="2" fill="#f97316" />
                <rect x="16" y="17" width="4" height="12" rx="2" fill="#f97316" fillOpacity="0.8" />
                <rect x="22" y="12" width="4" height="17" rx="2" fill="#f97316" fillOpacity="0.6" />
              </svg>
            }
            title="Live polls & checks"
            body="Quick concept checks during the lecture so you know you actually followed it."
          />
          <Feature
            icon={
              <svg viewBox="0 0 36 36" fill="none" className="h-9 w-9" aria-hidden="true">
                <circle cx="18" cy="18" r="18" fill="#f0fdf4" />
                <rect x="10" y="13" width="16" height="3" rx="1.5" fill="#22c55e" />
                <rect x="10" y="18" width="12" height="3" rx="1.5" fill="#22c55e" fillOpacity="0.7" />
                <rect x="10" y="23" width="8" height="3" rx="1.5" fill="#22c55e" fillOpacity="0.4" />
              </svg>
            }
            title="Every chapter, both exams"
            body="Not just mechanics - the full JEE and NEET physics syllabus, taught live across cohorts."
          />
          <Feature
            icon={
              <svg viewBox="0 0 36 36" fill="none" className="h-9 w-9" aria-hidden="true">
                <circle cx="18" cy="18" r="18" fill="#f0fdf4" />
                <rect x="11" y="11" width="14" height="10" rx="2" fill="#16a34a" fillOpacity="0.2" stroke="#16a34a" strokeWidth="1.5" />
                <path d="M14 21v4M22 21v4M11 25h14" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M15 15l1.8 1.8L21 13" stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
            title="Recordings for paid plans"
            body="Miss a session? Re-watch. Subscription and cohort students get the full archive."
          />
        </div>
      </section>

      {chapters.length > 0 && <SyllabusGrid chapters={chapters} />}

      {/* A taste of the teaching */}
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
            A taste of the teaching
          </p>
          <h2 className="text-4xl font-semibold tracking-tight">Geometrical Optics</h2>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
            The only stream you need
          </p>
          <div className="flex items-center gap-2 text-sm text-ink/70">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-brand-600" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="#f3f0ff" />
              <polygon points="8,7 8,13 14,10" fill="#7c5bff" />
            </svg>
            101K+ subscribers
          </div>
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
          >
            Watch the channel on YouTube →
          </a>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <LiteYouTube videoId={FEATURED_VIDEO_ID} title={FEATURED_VIDEO_TITLE} />
        </div>
      </section>

      {/* CTA Banner */}
      <section className="flex flex-col items-center justify-between gap-8 overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50 px-8 py-14 sm:flex-row sm:text-left">
        <div className="text-5xl" aria-hidden="true">🚀</div>
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Ready to learn physics properly?
          </h2>
          <p className="text-ink/60">
            Join a cohort for the full guided journey, or drop into the next live lecture.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 sm:justify-end">
          <Link href="/login" className="btn-primary gap-2">
            Browse cohorts <span aria-hidden="true">→</span>
          </Link>
          <Link href="/login" className="btn-secondary">
            See the schedule
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-surface px-5 py-6 text-center">
      <div>{icon}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-ink/60">{label}</div>
    </div>
  );
}

function NextClassStrip({ cls }: { cls: ClassOut }) {
  const isLive = cls.status === "live";
  const when = dateFmt.format(new Date(cls.scheduled_start));
  return (
    <Link
      href="/schedule"
      className="group flex flex-col items-start justify-between gap-4 rounded-xl border border-line bg-surface p-6 shadow-card transition-[box-shadow,border-color] hover:border-brand-200 hover:shadow-card-hover sm:flex-row sm:items-center"
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-700">
          {isLive ? (
            <>
              <span className="h-2 w-2 animate-pulse-ring rounded-full bg-live" /> Live now
            </>
          ) : (
            "Next live"
          )}
        </span>
        <div>
          <p className="font-medium">{cls.title}</p>
          <p className="text-sm text-ink/60">
            {[cls.subject, cls.topic].filter(Boolean).join(" / ") || "Physics"} / {when} IST
          </p>
        </div>
      </div>
      <span className="text-sm font-medium text-brand-600 transition-transform group-hover:translate-x-0.5">
        {isLive ? "Join now" : "View schedule"} -&gt;
      </span>
    </Link>
  );
}

function SyllabusGrid({ chapters }: { chapters: ChapterOut[] }) {
  const shown = chapters.slice(0, 12);
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
            Full syllabus coverage
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">Every chapter, taught properly.</h2>
        </div>
        <Link
          href="/chapters"
          className="hidden whitespace-nowrap text-sm font-medium text-brand-600 hover:underline sm:block"
        >
          All chapters -&gt;
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((ch) => (
          <Link
            key={ch.id}
            href={`/chapters/${ch.id}`}
            className="group flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50/50"
          >
            <span className="font-medium">{ch.title}</span>
            <span className="text-ink/30 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-500">
              -&gt;
            </span>
          </Link>
        ))}
      </div>
      <Link href="/chapters" className="block text-sm font-medium text-brand-600 hover:underline sm:hidden">
        All chapters -&gt;
      </Link>
    </section>
  );
}

function Feature({ icon, title, body }: { icon?: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-5 space-y-3">
      {icon && <div>{icon}</div>}
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm text-ink/70">{body}</p>
    </div>
  );
}

function LaptopIllustration() {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-xs"
      aria-hidden="true"
    >
      {/* Screen */}
      <rect x="40" y="20" width="240" height="155" rx="10" fill="#f3f0ff" stroke="#d6caff" strokeWidth="2" />
      {/* Screen content */}
      <rect x="56" y="36" width="208" height="123" rx="6" fill="white" />

      {/* Chat bubble */}
      <rect x="70" y="50" width="90" height="30" rx="8" fill="#ede9fe" />
      <text x="82" y="70" fontSize="11" fill="#7c5bff" fontFamily="system-ui">How does refraction work?</text>
      <polygon points="78,80 70,88 90,80" fill="#ede9fe" />

      {/* Heart reaction */}
      <circle cx="200" cy="58" r="16" fill="#fce7f3" />
      <text x="192" y="63" fontSize="14">❤️</text>

      {/* Raised hand */}
      <circle cx="205" cy="120" r="18" fill="#fef3c7" />
      <text x="196" y="127" fontSize="18">✋</text>

      {/* Poll bar */}
      <rect x="70" y="108" width="100" height="8" rx="4" fill="#e9e3ff" />
      <rect x="70" y="108" width="70" height="8" rx="4" fill="#7c5bff" />
      <rect x="70" y="122" width="100" height="8" rx="4" fill="#e9e3ff" />
      <rect x="70" y="122" width="40" height="8" rx="4" fill="#9b7dff" />

      {/* Base / keyboard */}
      <rect x="20" y="175" width="280" height="14" rx="4" fill="#d6caff" />
      <rect x="110" y="189" width="100" height="6" rx="3" fill="#b9a5ff" />
    </svg>
  );
}
