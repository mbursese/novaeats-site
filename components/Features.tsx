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
    title: "Live tracking",
    body: "As soon as it places, you get a tracking link — kitchen to door.",
  },
  {
    title: "Real human support",
    body: "A missing item, a bad address, a question? People in Discord, not a chatbot maze.",
  },
];

export function Features() {
  return (
    <section id="why" className="scroll-mt-28 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-gold">WHY PEOPLE SWITCH</p>
          <h2 className="mt-4 max-w-[12ch] text-[40px] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[64px]">
            Your favorite food. Half the price.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <article className="glass h-full rounded-[28px] p-7 md:p-8">
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
