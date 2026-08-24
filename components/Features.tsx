"use client";

import { Reveal } from "./Reveal";

const features = [
  {
    title: "Automated checkout",
    body: "Submit the cart and walk away. Nova places it — no waiting on staff.",
  },
  {
    title: "Always on",
    body: "Order at 2pm or 2am. The bot stays up when you’re hungry.",
  },
  {
    title: "Live tracking",
    body: "A clean tracker from kitchen to door. Same food, same driver, lower total.",
  },
  {
    title: "Real savings",
    body: "Most orders come off a lot lighter than the normal checkout screen.",
  },
  {
    title: "Wonder, DoorDash, Chipotle",
    body: "The apps you already use. More platforms as they come online.",
  },
  {
    title: "People on support",
    body: "A missing item or a bad address? Open a ticket in Discord.",
  },
];

export function Features() {
  return (
    <section id="why" className="scroll-mt-24 border-t border-white/8 px-5 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-mute">WHY NOVA</p>
          <h2 className="mt-4 max-w-[12ch] text-[44px] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[68px]">
            Built to make ordering easier.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-white/8 bg-card px-6 py-7 transition duration-300 hover:-translate-y-1 hover:border-purple/25 hover:shadow-[0_0_48px_rgba(139,92,246,.1)]">
                <h3 className="text-[20px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-mute">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
