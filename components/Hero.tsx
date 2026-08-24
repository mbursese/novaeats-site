"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DISCORD } from "@/lib/site";

const steps = ["Placed", "Preparing", "On the way", "Delivered"];

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
          <p className="mb-6 text-[11px] font-medium tracking-[0.24em] text-mute">
            AUTOMATED FOOD SAVINGS · 24/7
          </p>
          <h1 className="max-w-[13ch] text-[52px] font-semibold leading-[0.9] tracking-[-0.055em] md:text-[80px]">
            Food delivery.
            <br />
            Without the full price.
          </h1>
          <p className="mt-7 max-w-[38ch] text-[16px] leading-[1.6] text-mute md:text-[18px]">
            Order from Wonder, DoorDash, Chipotle and more. Nova handles checkout
            and cuts the total — then sends you live tracking.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={DISCORD}
              className="inline-flex h-12 items-center rounded-full bg-ink px-6 text-[14px] font-medium text-bg transition hover:bg-white"
            >
              Join Discord
            </a>
            <a
              href="#how"
              className="inline-flex h-12 items-center rounded-full border border-white/14 px-6 text-[14px] font-medium text-ink transition hover:border-white/30 hover:bg-white/5"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-2">
            {["24/7 Automated", "Live Tracking", "Instant Checkout"].map((t) => (
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
          className="relative"
        >
          <div className="absolute -inset-10 rounded-[40px] bg-purple/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#11111d]/92 p-7 shadow-[0_40px_100px_rgba(0,0,0,.55)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[12px] text-mute">Nova checkout</span>
              <span className="rounded-full bg-purple/18 px-2.5 py-1 text-[11px] font-medium text-[#d8c4ff]">
                77% OFF
              </span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Restaurant</p>
            <p className="mt-1 text-[26px] font-semibold tracking-tight">Chipotle</p>
            <div className="mt-6 space-y-3 border-t border-white/8 pt-5 text-[14px]">
              <Row label="Cart total" value="$32.46" />
              <Row label="Nova savings" value="−$25.00" accent />
            </div>
            <div className="mt-5 flex items-end justify-between rounded-2xl bg-white/[0.04] px-4 py-4">
              <span className="text-[13px] text-mute">You pay</span>
              <span className="text-[32px] font-semibold leading-none tracking-tight">$7.46</span>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-2">
              {steps.map((label, i) => (
                <div key={label}>
                  <div className={`h-0.5 rounded-full ${i <= step ? "bg-ink" : "bg-white/10"}`} />
                  <p className={`mt-2 text-[10px] ${i <= step ? "text-ink" : "text-mute/70"}`}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-mute">{label}</span>
      <span className={accent ? "text-[#c4b5fd]" : "text-ink"}>{value}</span>
    </div>
  );
}
