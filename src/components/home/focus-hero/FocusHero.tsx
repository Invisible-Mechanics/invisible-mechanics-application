import Link from "next/link";
import { CanvasText } from "@/components/ui/canvas-text";
import styles from "./FocusHero.module.css";

const BRAND_PURPLES = ["#9b7dff", "#7c5bff", "#6a47f0", "#5a39d6", "#4a2eb0"];

function HeroVisual() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Dot grid background */}
      <svg
        className="absolute inset-0 h-full w-full opacity-30"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="#7c5bff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* Floating shapes */}
      <div className="absolute top-6 left-8 h-4 w-4 rotate-45 rounded-sm bg-brand-300/60" />
      <div className="absolute top-14 right-12 h-6 w-6 rounded-full bg-brand-200/70" />
      <div className="absolute bottom-16 left-6 h-5 w-5 rounded-full bg-brand-300/50" />
      <div className="absolute bottom-8 right-8 h-3 w-3 rotate-45 bg-brand-400/50" />
      <div className="absolute top-1/3 right-4 h-4 w-4 rounded-full border-2 border-brand-300/60" />
      <div className="absolute bottom-1/3 left-12 h-3 w-3 rotate-12 rounded-sm bg-brand-200/80" />

      {/* 3-D logo platform */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Ellipse shadow / base */}
        <div className="absolute -bottom-4 h-12 w-48 rounded-full bg-brand-300/30 blur-xl" />
        {/* Platform */}
        <div className="relative mb-0">
          <div
            className="h-6 w-52 rounded-b-3xl"
            style={{
              background: "linear-gradient(180deg, #c4b5fd 0%, #8b5cf6 100%)",
            }}
          />
          <div
            className="absolute inset-x-4 -top-2 h-4 rounded-full"
            style={{ background: "linear-gradient(180deg, #ddd6fe 0%, #a78bfa 100%)" }}
          />
        </div>
        {/* Logo cube */}
        <div
          className="flex h-44 w-44 items-center justify-center rounded-[28px] shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #9b7dff 0%, #6a47f0 55%, #4a2eb0 100%)",
            boxShadow:
              "0 32px 64px rgba(90,57,214,0.45), 0 8px 24px rgba(90,57,214,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {/* IM bars icon */}
          <svg width="72" height="64" viewBox="0 0 72 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Invisible Mechanics logo">
            <rect x="4" y="28" width="10" height="32" rx="5" fill="white" fillOpacity="0.95" />
            <rect x="20" y="12" width="10" height="48" rx="5" fill="white" fillOpacity="0.95" />
            <rect x="36" y="4" width="10" height="56" rx="5" fill="white" fillOpacity="0.95" />
            <rect x="52" y="18" width="10" height="42" rx="5" fill="white" fillOpacity="0.95" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function FocusHero() {
  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] -mt-8 w-screen overflow-hidden bg-gradient-to-br from-white via-brand-50/40 to-brand-100/30 sm:-mt-10">
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left: copy */}
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-widest text-brand-600">
              ✦ Trusted by 100K+ JEE &amp; NEET aspirants
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
            <div className="max-w-xl space-y-3 text-lg text-ink/70">
              <p>
                <span className="font-semibold text-ink">Not built around lectures.</span>
                <br />
                <span className="font-semibold text-brand-600">Built around understanding.</span>
              </p>
              <p className="text-base">
                Invisible Mechanics is a new kind of JEE &amp; NEET learning experience where every
                difficult concept is rebuilt visually, intuitively, and from first principles – so
                students do not just memorise solutions, they see how problems actually work.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/login" className="btn-primary gap-2">
                Browse cohorts <span aria-hidden="true">→</span>
              </Link>
              <Link href="/login" className="btn-secondary">
                See the schedule
              </Link>
            </div>
          </div>

          {/* Right: 3-D visual */}
          <div className="hidden h-80 lg:block lg:h-96">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
