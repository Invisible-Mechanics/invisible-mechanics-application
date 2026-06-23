import Link from "next/link";
import { LiteYouTube } from "@/components/LiteYouTube";

const FEATURED_VIDEO_ID = "YH2pTwKYSrY";
const FEATURED_VIDEO_TITLE = "Ray Optics — One Shot Livestream";
const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@invisiblemechanics";

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="space-y-6 py-6">
        <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
          Live JEE &amp; NEET physics
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight">
          Lectures you don&apos;t just attend. Lectures you actually learn from.
        </h1>
        <p className="max-w-2xl text-lg text-ink/70">
          Built for students who already watch on YouTube and want the next step — live, interactive
          sessions, doubt solving, and full chapter coverage across the JEE and NEET physics
          syllabus.
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/schedule" className="btn-primary">
            See the schedule
          </Link>
          <Link href="/cohorts" className="btn-secondary">
            Browse cohorts
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <LiteYouTube videoId={FEATURED_VIDEO_ID} title={FEATURED_VIDEO_TITLE} />
        <p className="text-sm text-ink/60">
          101K+ subscribers ·{" "}
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

      <section className="grid gap-6 sm:grid-cols-3">
        <Feature
          title="Every chapter, JEE & NEET"
          body="Not just mechanics. The full syllabus, taught live across cohorts."
        />
        <Feature
          title="Doubts in the room"
          body="Ask in chat or raise a hand. No 'message us on Telegram' hand-off."
        />
        <Feature
          title="Recordings for paid plans"
          body="Miss a lecture? Re-watch. Subscription and cohort students get the archive."
        />
      </section>
    </div>
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
