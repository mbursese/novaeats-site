"use client";

import { DISCORD } from "@/lib/site";
import { Reveal } from "./Reveal";

export function CTA() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <Reveal className="mx-auto max-w-[720px] text-center">
        <p className="text-[12px] tracking-[0.22em] text-gold">READY TO EAT WELL?</p>
        <h2 className="mx-auto mt-5 max-w-[12ch] text-[48px] font-semibold leading-[0.92] tracking-[-0.055em] md:text-[80px]">
          Spend less on delivery.
        </h2>
        <p className="mx-auto mt-6 max-w-[38ch] text-[16px] leading-relaxed text-mute md:text-[17px]">
          Same restaurants. Better prices. Join Nova and save on your next meal.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <a href={DISCORD} className="btn-primary">
            Start Saving Now
          </a>
          <a href="#how" className="btn-ghost">
            See How It Works
          </a>
        </div>
      </Reveal>
    </section>
  );
}
