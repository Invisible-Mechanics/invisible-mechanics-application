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

      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        <Stat value="101K+" label="YouTube subscribers" />
        <Stat value="JEE & NEET" label="Both syllabi, in full" />
        <Stat value="Live" label="+ recordings for paid plans" />
        <Stat value="Doubts" label="Solved in the room" />
      </section>

      {nextClass && <NextClassStrip cls={nextClass} />}

      <section className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
            Inside the live room
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            It feels like the front row, not a webinar.
          </h2>
          <p className="text-ink/70">
            Every session is a two-way room. Ask in chat, raise a hand, answer a live poll, react in
            real time - no message-us-later hand-off after class.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Feature
            title="Doubts in the room"
            body="Type a doubt or raise your hand mid-lecture. It gets picked up there and then."
          />
          <Feature
            title="Live polls & checks"
            body="Quick concept checks during the lecture so you know you actually followed it."
          />
          <Feature
            title="Every chapter, both exams"
            body="Not just mechanics - the full JEE and NEET physics syllabus, taught live across cohorts."
          />
          <Feature
            title="Recordings for paid plans"
            body="Miss a session? Re-watch. Subscription and cohort students get the full archive."
          />
        </div>
      </section>

      {chapters.length > 0 && <SyllabusGrid chapters={chapters} />}

      <section className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
          A taste of the teaching
        </p>
        <LiteYouTube videoId={FEATURED_VIDEO_ID} title={FEATURED_VIDEO_TITLE} />
        <p className="text-sm text-ink/60">
          101K+ subscribers {" / "}
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-brand-600"
          >
            Watch the channel on YouTube
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-ink px-8 py-14 text-center">
        <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to learn physics properly?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/70">
          Join a cohort for the full guided journey, or drop into the next live lecture.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link href="/cohorts" className="btn-primary">
            Browse cohorts
          </Link>
          <Link
            href="/schedule"
            className="inline-flex items-center justify-center rounded-md border border-white/25 px-5 py-3 font-medium text-white transition-colors hover:bg-white/10"
          >
            See the schedule
          </Link>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface px-5 py-6">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-ink/60">{label}</div>
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

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h3 className="font-medium">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{body}</p>
    </div>
  );
}
