"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";

const items = [
  {
    q: "What is Nova Eats?",
    a: "Nova Eats is an independent food-ordering service. You build the cart like normal, share it with us, and we place the order with better pricing. Same restaurants, same delivery — you just pay less.",
  },
  {
    q: "How do you save me money?",
    a: "We apply available savings at checkout so your total comes in under the regular price — often up to 50% off. Exact savings depend on the restaurant, fees, and order size.",
  },
  {
    q: "How quickly will my food arrive?",
    a: "We place the order shortly after you confirm and send a tracking link right away. Delivery takes the same amount of time as if you ordered yourself.",
  },
  {
    q: "What if something is wrong with my order?",
    a: "Use the tracking link to reach the restaurant or driver, the same as a normal order. We’re also in Discord if you need help sorting it out.",
  },
  {
    q: "How do I order?",
    a: "Join Discord, build your cart like normal (don’t checkout), paste the link or code, and confirm. Nova handles the rest.",
  },
  {
    q: "Is there a membership?",
    a: "No. No membership and no hidden fees. You pay for the order.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="scroll-mt-28 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-[720px]">
        <Reveal>
          <p className="text-[12px] tracking-[0.18em] text-gold">FREQUENTLY ASKED</p>
          <h2 className="mt-4 text-[40px] font-semibold leading-[0.95] tracking-[-0.05em] md:text-[56px]">
            Got questions?
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-mute">
            Everything you need to know about saving with Nova.
          </p>
        </Reveal>
        <div className="mt-10">
          {items.map((item, i) => {
            const active = open === i;
            return (
              <div key={item.q} className="border-t border-white/8 last:border-b">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  onClick={() => setOpen(active ? -1 : i)}
                  aria-expanded={active}
                >
                  <span className="text-[16px] font-medium tracking-tight md:text-[17px]">
                    {item.q}
                  </span>
                  <span className={`text-[20px] ${active ? "text-ink" : "text-mute"}`}>
                    {active ? "–" : "+"}
                  </span>
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-300 ${
                    active ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 text-[15px] leading-relaxed text-mute">{item.a}</p>
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
