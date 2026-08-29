"use client";

import { Reveal } from "./Reveal";

const steps = [
  {
    n: "01",
    title: "Build your cart",
    body: "On the apps you already use — don’t checkout yet.",
  },
  {
    n: "02",
    title: "Share the cart",
    body: "Copy your cart link or code into Discord. That’s all we need to price it.",
  },
  {
    n: "03",
    title: "We apply savings & place it",
    body: "You get the same delivery — just a lower total, plus live tracking to the door.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-28 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-gold">HOW IT WORKS</p>
          <h2 className="mt-4 max-w-[12ch] text-[40px] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[64px]">
            Build. Share. Save.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-mute">
            Build your cart like normal, share the link, and we place the order
            with better pricing — often up to 50% off.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] border border-white/8 bg-white/8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.07}>
              <article className="flex h-full min-h-[280px] flex-col bg-bg-2 px-7 py-8 md:px-8">
                <p className="font-mono text-[13px] text-gold">{step.n}</p>
                <h3 className="mt-16 text-[24px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-mute">{step.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
