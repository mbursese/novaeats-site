"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DISCORD } from "@/lib/site";

const steps = ["Placed", "Preparing", "On the way", "Delivered"];

export function Hero() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % steps.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto grid max-w-[1080px] items-center gap-14 px-5 md:px-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div>
          <p className="mb-5 text-[11px] font-medium tracking-[0.24em] text-gold">
            EAT WELL · SPEND LESS
          </p>
          <h1 className="max-w-[12ch] text-[52px] font-semibold leading-[0.92] tracking-[-0.055em] md:text-[76px]">
            Save big on every delivery.
          </h1>
          <p className="mt-6 max-w-[40ch] text-[16px] leading-[1.65] text-mute md:text-[17px]">
            Get up to 50% off food delivery. Same restaurants, better prices —
            we place the order and send you live tracking.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={DISCORD} className="btn-primary">
              Start Saving Now
            </a>
            <a href="#how" className="btn-ghost">
              See How It Works
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
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
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto w-full max-w-[440px] lg:mx-0 lg:justify-self-end"
        >
          <div
            className="pointer-events-none absolute -inset-10 rounded-[48px] bg-gold/8 blur-3xl"
            aria-hidden
          />
          <div className="glass relative overflow-hidden rounded-[28px] shadow-[0_40px_100px_rgba(0,0,0,.45)]">
            <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
              <span className="text-[13px] text-mute">Regular price</span>
              <span className="font-mono text-[13px] text-mute line-through">$33.97</span>
            </div>
            <div className="px-6 py-6">
              <p className="text-[12px] text-mute">Your price</p>
              <p className="mt-1 text-[40px] font-semibold leading-none tracking-tight">
                $16.99
              </p>
              <p className="mt-4 text-[14px] text-gold">Save $16.98 · 50% off</p>
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
                    <p className={`mt-2 text-[10px] ${i <= step ? "text-ink" : "text-mute/70"}`}>
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
