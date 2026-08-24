"use client";

import { DISCORD } from "@/lib/site";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="border-t border-white/8 px-5 py-28 md:px-8 md:py-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-[12px] tracking-[0.22em] text-gold">HUNGRY?</p>
        <h2 className="mx-auto mt-5 max-w-[11ch] text-[52px] font-semibold leading-[0.9] tracking-[-0.055em] md:text-[84px]">
          Your next order should cost less.
        </h2>
        <p className="mx-auto mt-7 max-w-[36ch] text-[16px] leading-relaxed text-mute md:text-[18px]">
          Join Nova Eats and start saving on your next meal.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a
            href={DISCORD}
            className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[14px] font-medium text-bg transition hover:bg-white"
          >
            Join Discord
          </a>
          <a
            href="#how"
            className="inline-flex h-12 items-center rounded-full border border-gold/70 px-6 text-[14px] font-medium transition hover:border-gold hover:bg-gold/8"
          >
            See How It Works
          </a>
        </div>
      </Reveal>
    </section>
  );
}
