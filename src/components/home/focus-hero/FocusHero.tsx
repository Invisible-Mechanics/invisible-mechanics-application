import Link from "next/link";
import { CanvasText } from "@/components/ui/canvas-text";
import styles from "./FocusHero.module.css";

const BRAND_PURPLES = ["#9b7dff", "#7c5bff", "#6a47f0", "#5a39d6", "#4a2eb0"];

export function FocusHero() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-8 flex min-h-[calc(100dvh-4rem)] w-screen items-center overflow-hidden bg-surface sm:-mt-10">
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl space-y-6">
          <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
            Trusted by 100K+ JEE &amp; NEET aspirants
          </p>
          <h1
            className={`${styles.focusIn} text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl`}
          >
            Discovering the{" "}
            <CanvasText
              text="Invisible Mechanics"
              backgroundClassName="bg-brand-700"
              colors={BRAND_PURPLES}
              animationDuration={6}
              lineGap={8}
              className="tracking-normal"
            />{" "}
            of Learning
          </h1>
          <div className="max-w-xl space-y-4 text-lg text-ink/70">
            <p className="font-medium text-ink">
              Not built around lectures.
              <br />
              Built around understanding.
            </p>
            <p>
              Invisible Mechanics is a new kind of JEE &amp; NEET learning experience where every
              difficult concept is rebuilt visually, intuitively, and from first principles - so
              students do not just memorise solutions, they see how problems actually work.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/cohorts" className="btn-primary">
              Browse cohorts
            </Link>
            <Link href="/schedule" className="btn-secondary">
              See the schedule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
