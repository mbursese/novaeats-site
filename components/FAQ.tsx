"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const items = [
  {
    q: "What is Nova Eats?",
    a: "Nova Eats is an automated ordering service that helps you save on supported food delivery and pickup platforms.",
  },
  {
    q: "How do I order?",
    a: "Join Discord, follow the instructions, submit your cart, and Nova handles checkout.",
  },
  {
    q: "Which platforms are supported?",
    a: "Wonder, DD, Chipotle, and more as they become available.",
  },
  {
    q: "How much can I save?",
    a: "It depends on the platform, restaurant, location, taxes, fees, and order value.",
  },
  {
    q: "Do I get tracking?",
    a: "Yes. Supported orders include tracking after checkout.",
  },
  {
    q: "Is Nova available 24/7?",
    a: "The bot is built to stay up around the clock. Occasional downtime can still happen.",
  },
  {
    q: "How do I get support?",
    a: "Open a support ticket in the Nova Discord.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-white/8 px-5 py-24 md:px-8 md:py-32">
      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-gold">FAQ</p>
          <h2 className="mt-4 text-[44px] font-semibold leading-[0.92] tracking-[-0.05em] md:text-[64px]">
            Questions, answered.
          </h2>
        </Reveal>
        <div className="mt-12 overflow-hidden rounded-3xl border border-white/8 bg-card">
          {items.map((item, i) => {
            const active = open === i;
            return (
              <div key={item.q} className={i ? "border-t border-white/8" : ""}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition hover:bg-white/[0.02] md:px-7"
                  onClick={() => setOpen(active ? -1 : i)}
                  aria-expanded={active}
                >
                  <span className="text-[16px] font-medium tracking-tight md:text-[17px]">
                    {item.q}
                  </span>
                  <span className={`text-[18px] ${active ? "text-gold" : "text-mute"}`}>
                    {active ? "–" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-[15px] leading-relaxed text-mute md:px-7">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
