"use client";

import { useEffect, useRef, useState } from "react";
import BooksAnimation from "@/lib/lottie/Books.json";

type LottieApi = {
  loadAnimation: (options: {
    container: Element;
    renderer: "svg";
    loop: boolean;
    autoplay: boolean;
    animationData: unknown;
  }) => { destroy: () => void };
};

declare global {
  interface Window {
    lottie?: LottieApi;
  }
}

function loadLottieScript(): Promise<LottieApi> {
  if (window.lottie) return Promise.resolve(window.lottie);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-lottie-web]");
    if (existing) {
      existing.addEventListener("load", () => window.lottie ? resolve(window.lottie) : reject());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
    script.async = true;
    script.dataset.lottieWeb = "true";
    script.onload = () => window.lottie ? resolve(window.lottie) : reject();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function LoaderModal({ label = "Loading" }: { label?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [fallback, setFallback] = useState(true);

  useEffect(() => {
    let active = true;
    let animation: { destroy: () => void } | null = null;
    loadLottieScript()
      .then((lottie) => {
        if (!active || !containerRef.current) return;
        animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: BooksAnimation,
        });
        setFallback(false);
      })
      .catch(() => setFallback(true));
    return () => {
      active = false;
      animation?.destroy();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/90 px-6">
      <div
        className="flex w-full max-w-xs flex-col items-center gap-4 rounded-lg border border-line bg-white px-8 py-7 text-center shadow-lg"
        aria-busy="true"
        aria-live="polite"
      >
        <div ref={containerRef} className="h-24 w-24">
          {fallback && (
            <div className="loader-book" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-ink">{label}</p>
      </div>
    </div>
  );
}
