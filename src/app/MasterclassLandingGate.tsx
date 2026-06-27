"use client";

import Image from "next/image";
import { MasterclassAdModal } from "@/app/MasterclassAdModal";

export function MasterclassLandingGate() {
  return (
    <div className="min-h-[calc(100svh-8rem)] bg-[#05050a] px-4 py-8 text-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black ring-1 ring-white/10">
          <Image
            src="/im-logo.png"
            alt="Invisible Mechanics"
            width={32}
            height={32}
            className="rounded-lg"
            priority
          />
        </span>
        <span className="text-lg font-semibold tracking-tight">
          Invisible <span className="text-brand-300">Mechanics</span>
        </span>
      </div>
      <MasterclassAdModal />
    </div>
  );
}
