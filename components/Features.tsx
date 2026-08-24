"use client";

import { Reveal } from "./Reveal";

const features = [
  {
    title: "Restaurants you already love",
    body: "The places you already order from. Same menus — just a better total at checkout.",
  },
  {
    title: "No membership or hidden fees",
    body: "Pay for the order. That’s it. No subscription to unlock the savings.",
  },
  {
    title: "Same delivery, lower total",
    body: "We place it under your name. Food arrives on the same timeline as ordering yourself.",
  },
  {
    title: "Live tracking",
    body: "As soon as it places, you get a tracking link — kitchen to door.",
  },
  {
    title: "Real human support",
    body: "A missing item, a bad address, a question? People in Discord, not a chatbot maze.",
  },
  {
    title: "Order when you’re hungry",
    body: "Late lunch or late night. Nova stays up so you don’t have to wait on staff.",
  },
];

export function Features() {
  return (
    <section id="why" className="scroll-mt-24 border-t border-white/8 px-5 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-gold">WHY PEOPLE SWITCH</p>
          <h2 className="mt-4 max-w-[16ch] text-[44px] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[68px]">
            Same food. Better prices.
          </h2>
        </Reveal>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <article className="h-full rounded-2xl border border-white/8 bg-card px-6 py-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_0_40px_rgba(248,192,0,.08)]">
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
