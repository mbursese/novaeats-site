"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DISCORD } from "@/lib/site";

const steps = ["Placed", "Preparing", "On the way", "Delivered"];

const items = [
  { name: "Entree", qty: "×1", price: "$16.49" },
  { name: "Side", qty: "×1", price: "$7.99" },
  { name: "Drink", qty: "×1", price: "$4.50" },
  { name: "Fees & tax", qty: "", price: "$4.99" },
];

export function Hero() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-5 md:px-8 lg:grid-cols-[1.1fr_.9fr] lg:gap-20">
        <div>
          <p className="mb-6 text-[11px] font-medium tracking-[0.24em] text-gold">
            EAT WELL · SPEND LESS
          </p>
          <h1 className="max-w-[12ch] text-[52px] font-semibold leading-[0.9] tracking-[-0.055em] md:text-[80px]">
            Save big on
            <br />
            every delivery.
          </h1>
          <p className="mt-7 max-w-[40ch] text-[16px] leading-[1.6] text-mute md:text-[18px]">
            Get up to 50% off food delivery. Same restaurants, better prices —
            we place the order and send you live tracking.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={DISCORD}
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[14px] font-medium text-bg transition hover:bg-white"
            >
              Start Saving Now
            </a>
            <a
              href="#how"
              className="inline-flex h-12 items-center rounded-full border border-gold/70 px-6 text-[14px] font-medium text-ink transition hover:border-gold hover:bg-gold/8"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {[
              "Restaurants you already love",
              "No membership or hidden fees",
              "Real support in Discord",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[12px] text-mute"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:justify-self-end"
        >
          <div
            className="pointer-events-none absolute -inset-8 rounded-[40px] bg-gold/10 blur-3xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#11111d] shadow-[0_40px_100px_rgba(0,0,0,.55)]">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
                </span>
                <span className="text-[13px] font-medium">{steps[step]}</span>
              </div>
              <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-semibold tracking-wide text-bg">
                50% off
              </span>
            </div>

            <div className="px-6 pt-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Tonight’s order</p>
              <div className="mt-4 space-y-3 text-[14px]">
                {items.map((item) => (
                  <div key={item.name} className="flex items-baseline justify-between gap-4">
                    <span className="text-ink">
                      {item.name}
                      {item.qty ? (
                        <span className="ml-2 text-[12px] text-mute">{item.qty}</span>
                      ) : null}
                    </span>
                    <span className="font-mono text-[13px] text-mute">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="mx-2 mt-5 h-px bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.18)_0_8px,transparent_8px_14px)]"
              aria-hidden
            />

            <div className="px-6 py-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[12px] text-mute">Regular</p>
                  <p className="mt-1 text-[22px] font-medium text-mute/80 line-through decoration-white/30">
                    $33.97
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gold">You pay</p>
                  <p className="mt-1 text-[40px] font-semibold leading-none tracking-tight">
                    $16.99
                  </p>
                </div>
              </div>
              <p className="mt-3 text-right text-[13px] text-gold">Saved $16.98</p>
            </div>

            <div className="border-t border-white/8 px-6 py-4">
              <div className="grid grid-cols-4 gap-2">
                {steps.map((label, i) => (
                  <div key={label}>
                    <div
                      className={`h-0.5 rounded-full transition-colors ${
                        i <= step ? "bg-gold" : "bg-white/10"
                      }`}
                    />
                    <p
                      className={`mt-2 text-[10px] ${
                        i <= step ? "text-ink" : "text-mute/70"
                      }`}
                    >
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
