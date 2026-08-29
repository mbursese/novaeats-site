"use client";

import { DISCORD } from "@/lib/site";
import { Reveal } from "./Reveal";

export function DiscordHome() {
  return (
    <section className="px-5 py-16 md:px-8 md:py-24">
      <Reveal className="mx-auto max-w-[1080px]">
        <div className="glass overflow-hidden rounded-[32px] px-8 py-10 md:flex md:items-center md:justify-between md:px-12 md:py-14">
          <div>
            <p className="text-[12px] tracking-[0.18em] text-gold">DISCORD</p>
            <h2 className="mt-4 max-w-[14ch] text-[36px] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[48px]">
              Real people, not a form.
            </h2>
            <p className="mt-4 max-w-[36ch] text-[16px] leading-relaxed text-mute">
              Orders and support both live here. Free to join. Nothing to install.
            </p>
          </div>
          <a href={DISCORD} className="btn-primary mt-8 md:mt-0">
            Join Discord
          </a>
        </div>
      </Reveal>
    </section>
  );
}
