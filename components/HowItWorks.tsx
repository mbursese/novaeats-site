"use client";

import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Build your order",
    body: "Make the cart on Wonder, DoorDash, or Chipotle — the same way you already order.",
  },
  {
    n: "02",
    title: "Send it to Nova",
    body: "Drop it in Discord. Nova prices the checkout, shows the savings, and waits for your go.",
  },
  {
    n: "03",
    title: "Track & eat",
    body: "We place it under your name. You get live tracking until it hits the door.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 border-t border-white/8 px-5 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-mute">HOW IT WORKS</p>
          <h2 className="mt-4 max-w-[11ch] text-[44px] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[68px]">
            Three steps. That’s it.
          </h2>
          <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-mute">
            No coupon codes. No extra app. Build the order, send it once, and Nova does the rest.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/8 bg-white/8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              <article className="h-full bg-card px-7 py-9 md:min-h-[320px] md:px-8">
                <p className="font-mono text-[13px] text-purple-bright">{step.n}</p>
                <h3 className="mt-16 text-[26px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 max-w-[28ch] text-[15px] leading-relaxed text-mute">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
