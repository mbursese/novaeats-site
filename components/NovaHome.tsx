"use client";

import { useState } from "react";
import Image from "next/image";
import { DISCORD } from "@/lib/site";

const novaLogo = "/nova-logo.png";

function DiscordIcon() {
  return (
    <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.631 1.33C17.237 0.692 15.745 0.226 14.189 0c-.208.37-.451.87-.618 1.267-1.65-.247-3.287-.247-4.906 0C8.498.87 8.251.37 8.04 0 6.483.226 4.99.694 3.595 1.333 .518 5.946-.317 10.44.1 14.87c1.872 1.37 3.687 2.204 5.47 2.75.441-.6.833-1.238 1.171-1.909a14.22 14.22 0 0 1-1.844-.876c.155-.113.306-.23.452-.35 3.554 1.635 7.41 1.635 10.922 0 .148.12.299.237.452.35-.588.343-1.208.638-1.846.878.338.67.73 1.31 1.172 1.908 1.784-.546 3.6-1.38 5.473-2.75.49-5.11-.838-9.561-3.491-13.541ZM7.348 12.175c-1.061 0-1.934-.972-1.934-2.164s.852-2.165 1.934-2.165c1.083 0 1.956.974 1.935 2.165.001 1.192-.852 2.164-1.935 2.164Zm7.14 0c-1.062 0-1.934-.972-1.934-2.164s.851-2.165 1.934-2.165c1.082 0 1.955.974 1.934 2.165 0 1.192-.852 2.164-1.934 2.164Z" fill="currentColor"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="rgba(124,58,255,0.2)"/>
      <path d="M5 8l2 2 4-4" stroke="#7c3aff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AnimatedBackground() {
  const particles = [
    { size: 3, x: "15%", y: "20%", color: "#7c3aff", delay: "0s",   dur: "7s",  anim: "particle-float-a" },
    { size: 2, x: "35%", y: "70%", color: "#00d4ff", delay: "1.5s", dur: "9s",  anim: "particle-float-b" },
    { size: 4, x: "55%", y: "40%", color: "#ff8c00", delay: "3s",   dur: "6s",  anim: "particle-float-c" },
    { size: 2, x: "75%", y: "80%", color: "#7c3aff", delay: "0.8s", dur: "8s",  anim: "particle-float-a" },
    { size: 3, x: "88%", y: "25%", color: "#00d4ff", delay: "2s",   dur: "10s", anim: "particle-float-b" },
    { size: 2, x: "8%",  y: "60%", color: "#a78bfa", delay: "4s",   dur: "7s",  anim: "particle-float-c" },
    { size: 3, x: "42%", y: "15%", color: "#ff8c00", delay: "1s",   dur: "11s", anim: "particle-float-a" },
    { size: 2, x: "62%", y: "90%", color: "#7c3aff", delay: "5s",   dur: "8s",  anim: "particle-float-b" },
    { size: 4, x: "28%", y: "50%", color: "#00d4ff", delay: "2.5s", dur: "9s",  anim: "particle-float-c" },
    { size: 2, x: "92%", y: "55%", color: "#a78bfa", delay: "0.3s", dur: "12s", anim: "particle-float-a" },
    { size: 3, x: "50%", y: "30%", color: "#ff8c00", delay: "3.5s", dur: "7s",  anim: "particle-float-b" },
    { size: 2, x: "20%", y: "85%", color: "#00d4ff", delay: "1.8s", dur: "10s", anim: "particle-float-c" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Grid */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />
      <div className="orb orb-5" />

      {/* Floating particles */}
      {particles.map((p, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: p.x,
            top: p.y,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            animation: `${p.anim} ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}

      {/* Stars */}
      <div className="absolute inset-0 star-field opacity-80" />
    </div>
  );
}

const steps = [
  {
    num: "01",
    title: "Build your cart",
    desc: "Fill your cart on any food delivery app like you normally would. No new accounts. No extra steps.",
    icon: "🛒",
    color: "#7c3aff",
  },
  {
    num: "02",
    title: "Share in Discord",
    desc: "Drop your cart code or group order link in our server. Load credits and approve the price upfront.",
    icon: "💬",
    color: "#00d4ff",
  },
  {
    num: "03",
    title: "We place it for you",
    desc: "We place the order at a lower total — often 50%+ off. You get a live tracking link instantly.",
    icon: "🚀",
    color: "#ff8c00",
  },
];

const features = [
  {
    icon: "💸",
    title: "50%+ off every order",
    desc: "Real savings on every single order — not just your first. No tricks, no fine print.",
    glow: "rgba(255,140,0,0.15)",
    border: "rgba(255,140,0,0.2)",
  },
  {
    icon: "🏪",
    title: "Same restaurants",
    desc: "Your favorite spots, unchanged. We don't touch what you order — only what you pay.",
    glow: "rgba(124,58,255,0.15)",
    border: "rgba(124,58,255,0.2)",
  },
  {
    icon: "📍",
    title: "Live tracking link",
    desc: "As soon as your order is placed, you get a real-time tracking link. No guessing.",
    glow: "rgba(0,212,255,0.15)",
    border: "rgba(0,212,255,0.2)",
  },
  {
    icon: "🎟️",
    title: "No membership fees",
    desc: "Pay only for what you order. No monthly subscriptions, no hidden charges, no commitments.",
    glow: "rgba(255,140,0,0.15)",
    border: "rgba(255,140,0,0.2)",
  },
  {
    icon: "💳",
    title: "Load credits upfront",
    desc: "Top up your balance in Discord and spend it whenever. You approve every order before it goes.",
    glow: "rgba(124,58,255,0.15)",
    border: "rgba(124,58,255,0.2)",
  },
  {
    icon: "🤝",
    title: "Real support",
    desc: "Something wrong? We're in Discord with you. Real humans, real help — not a ticket queue.",
    glow: "rgba(0,212,255,0.15)",
    border: "rgba(0,212,255,0.2)",
  },
];

const testimonials = [
  {
    handle: "@jordanmkts",
    avatar: "J",
    color: "#7c3aff",
    text: "Saved $22 on a $40 order. I thought it was a scam but it legit works. Discord support replied in like 2 mins.",
    savings: "$22 saved",
  },
  {
    handle: "@priya_dev",
    avatar: "P",
    color: "#00d4ff",
    text: "Been using Nova Eats for 3 months. I've saved over $180 total. It's just part of my routine now.",
    savings: "$180 saved",
  },
  {
    handle: "@marcusfoods",
    avatar: "M",
    color: "#ff8c00",
    text: "The tracking link drops immediately after they place it. Same delivery window as normal. Wild that this exists.",
    savings: "$35 saved",
  },
];

export default function NovaHome() {
  const [subtotal, setSubtotal] = useState(35);
  const deliveryFee = 6.99;
  const serviceFee = 4.50;
  const tax = parseFloat((subtotal * 0.089).toFixed(2));
  const originalTotal = parseFloat((subtotal + deliveryFee + serviceFee + tax).toFixed(2));
  const discount = parseFloat((originalTotal * 0.60).toFixed(2));
  const novaTotal = parseFloat((originalTotal - discount).toFixed(2));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-full bg-[#04060f] text-[#f0f2ff] overflow-x-hidden">
      <AnimatedBackground />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12"
        style={{ background: "linear-gradient(to bottom, rgba(4,6,15,0.95) 0%, rgba(4,6,15,0) 100%)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <Image src={novaLogo} alt="Nova Eats logo" width={40} height={40} className="w-10 h-10 rounded-xl object-cover" />
          <span className="font-display font-bold text-xl tracking-tight text-white">Nova Eats</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#how" className="text-sm font-medium text-[#a8b0e0] hover:text-white transition-colors">How it works</a>
          <a href="#savings" className="text-sm font-medium text-[#a8b0e0] hover:text-white transition-colors">Savings</a>
          <a href="#features" className="text-sm font-medium text-[#a8b0e0] hover:text-white transition-colors">Features</a>
          <a href={DISCORD}
            className="btn-discord flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#5865F2" }}>
            <DiscordIcon />
            Join Discord
          </a>
        </div>
        <button className="md:hidden text-[#a8b0e0]" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20" style={{ background: "rgba(4,6,15,0.97)", backdropFilter: "blur(12px)" }}>
          <div className="flex flex-col items-center gap-8 pt-12 text-lg font-medium">
            <a href="#how" onClick={() => setMobileMenuOpen(false)} className="text-[#a8b0e0] hover:text-white">How it works</a>
            <a href="#savings" onClick={() => setMobileMenuOpen(false)} className="text-[#a8b0e0] hover:text-white">Savings</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#a8b0e0] hover:text-white">Features</a>
            <a href={DISCORD} onClick={() => setMobileMenuOpen(false)}
              className="btn-discord flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white mt-4"
              style={{ background: "#5865F2" }}>
              <DiscordIcon />
              Join Discord
            </a>
          </div>
        </div>
      )}

      {/* ─── HERO ─── */}
      <section className="relative z-10 min-h-[90vh] flex flex-col items-center justify-center px-5 pt-20 pb-12 text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(124,58,255,0.12)", border: "1px solid rgba(124,58,255,0.3)", color: "#a78bfa" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aff] animate-pulse" />
          Discord-based · No app download needed
        </div>

        <h1 className="font-display font-black text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-5 max-w-4xl">
          <span className="text-white">Save </span>
          <span className="text-glow-orange" style={{ color: "#ff8c00" }}>50%+</span>
          <br />
          <span className="text-white">on every </span>
          <span style={{ background: "linear-gradient(90deg, #a78bfa, #7c3aff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>delivery</span>
        </h1>

        <p className="text-base md:text-xl text-[#a8b0e0] max-w-xl mb-8 leading-relaxed">
          Build your cart, share the link in our Discord — we place it for less. Same food, same delivery, way better price.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <a href={DISCORD}
            className="btn-discord flex items-center gap-3 px-6 py-3 md:px-7 md:py-4 rounded-2xl font-display font-bold text-base md:text-lg text-white"
            style={{ background: "linear-gradient(135deg, #5865F2, #4752C4)", border: "1px solid rgba(88,101,242,0.4)" }}>
            <DiscordIcon />
            Join the Discord
          </a>
          <a href="#how"
            className="btn-primary flex items-center gap-2 px-6 py-3 md:px-7 md:py-4 rounded-2xl font-display font-bold text-base md:text-lg"
            style={{ background: "rgba(124,58,255,0.1)", border: "1px solid rgba(124,58,255,0.3)", color: "#a78bfa" }}>
            See how it works
            <ArrowIcon />
          </a>
        </div>


        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40">
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent to-[#7c3aff]" />
        </div>
      </section>

      {/* ─── STATS STRIP ─── */}
      <div className="relative z-10 py-8 md:py-10 px-5"
        style={{ background: "linear-gradient(90deg, rgba(124,58,255,0.06) 0%, rgba(0,212,255,0.06) 50%, rgba(255,140,0,0.06) 100%)", borderTop: "1px solid rgba(124,58,255,0.12)", borderBottom: "1px solid rgba(124,58,255,0.12)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8 text-center">
          {[
            { val: "50%+",   label: "average savings",        color: "#ff8c00" },
            { val: "2,000+", label: "vouches from members",   color: "#7c3aff" },
            { val: "$10k+",  label: "saved by the community", color: "#00d4ff" },
            { val: "$0",     label: "membership fee",         color: "#a78bfa" },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="font-display font-black text-2xl md:text-4xl" style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}60` }}>
                {stat.val}
              </span>
              <span className="text-sm text-[#6b76b0]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how" className="relative z-10 py-12 md:py-18 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
              style={{ color: "#a78bfa", background: "rgba(124,58,255,0.1)", border: "1px solid rgba(124,58,255,0.2)" }}>
              How it works
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white">
              Three steps to cheaper delivery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 relative">
            {steps.map((step, i) => (
              <div key={step.num} className="relative card-hover rounded-2xl p-4 md:p-8 flex flex-col gap-2 md:gap-4"
                style={{ background: "rgba(12,15,36,0.8)", border: "1px solid rgba(124,58,255,0.15)", backdropFilter: "blur(8px)" }}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 -right-3 w-6 h-[1px] z-10"
                    style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }} />
                )}
                <div className="flex items-center gap-3 md:block">
                  <div className="flex items-center justify-center w-9 h-9 md:w-auto md:h-auto rounded-xl md:rounded-none shrink-0"
                    style={{ background: `${step.color}18` }}>
                    <span className="text-xl md:text-3xl">{step.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-base md:text-xl text-white md:mt-3">{step.title}</h3>
                </div>
                <p className="text-[#a8b0e0] leading-relaxed text-xs md:text-sm">{step.desc}</p>
                <div className="hidden md:block mt-auto pt-4">
                  <div className="h-[2px] rounded-full w-12" style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SAVINGS CALCULATOR ─── */}
      <section id="savings" className="relative z-10 py-12 md:py-18 px-5">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
              style={{ color: "#fb923c", background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.2)" }}>
              Order breakdown
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white">
              See what you actually pay
            </h2>
          </div>

          {/* Slider */}
          <div className="mb-6 px-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[#a8b0e0]">Food subtotal</span>
              <span className="text-sm font-bold text-white">${subtotal}.00</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              step={5}
              value={subtotal}
              onChange={e => setSubtotal(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(90deg, #7c3aff ${(subtotal - 10) / 1.1}%, rgba(124,58,255,0.2) ${(subtotal - 10) / 1.1}%)` }}
            />
          </div>

          {/* Receipt card */}
          <div className="rounded-3xl overflow-hidden"
            style={{ background: "rgba(12,15,36,0.9)", border: "1px solid rgba(124,58,255,0.2)", backdropFilter: "blur(12px)", boxShadow: "0 0 50px rgba(124,58,255,0.1)" }}>

            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid rgba(124,58,255,0.12)", background: "rgba(124,58,255,0.06)" }}>
              <span className="text-sm font-semibold text-[#a78bfa]">🧾 Order Summary</span>
            </div>

            {/* Line items */}
            <div className="px-6 py-5 flex flex-col gap-3">

              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8b0e0]">Subtotal</span>
                <span className="text-sm text-white">${subtotal}.00</span>
              </div>

              {/* Delivery fee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8b0e0]">Delivery fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-[#6b76b0]">${deliveryFee.toFixed(2)}</span>
                  <span className="text-sm font-bold" style={{ color: "#4ade80" }}>$0.00</span>
                </div>
              </div>

              {/* Service fee */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8b0e0]">Service fee</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-[#6b76b0]">${serviceFee.toFixed(2)}</span>
                  <span className="text-sm font-bold" style={{ color: "#4ade80" }}>$0.00</span>
                </div>
              </div>

              {/* Tax */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a8b0e0]">Tax &amp; regulatory fees</span>
                <span className="text-sm text-white">${tax.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div className="my-1" style={{ height: "1px", background: "rgba(124,58,255,0.15)" }} />

              {/* Original total */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6b76b0]">Original total</span>
                <span className="text-sm line-through text-[#6b76b0]">${originalTotal.toFixed(2)}</span>
              </div>

              {/* Nova discount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "#ff8c00" }}>Nova discount</span>
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: "rgba(255,140,0,0.15)", color: "#ff8c00", border: "1px solid rgba(255,140,0,0.3)" }}>
                    60% off
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: "#ff8c00" }}>−${discount.toFixed(2)}</span>
              </div>

              {/* Divider */}
              <div className="my-1" style={{ height: "1px", background: "rgba(124,58,255,0.15)" }} />

              {/* Final total */}
              <div className="flex items-center justify-between pt-1">
                <span className="font-display font-bold text-base text-white">You pay with Nova</span>
                <span className="font-display font-black text-2xl" style={{ color: "#a78bfa", textShadow: "0 0 20px rgba(124,58,255,0.5)" }}>
                  ${novaTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Savings banner */}
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(90deg, rgba(255,140,0,0.1), rgba(124,58,255,0.08))", borderTop: "1px solid rgba(255,140,0,0.2)" }}>
              <span className="text-xs text-[#a8b0e0]">Total saved vs. ordering normally</span>
              <span className="font-display font-black text-lg" style={{ color: "#ff8c00", textShadow: "0 0 12px rgba(255,140,0,0.5)" }}>
                ${(originalTotal - novaTotal).toFixed(2)}
              </span>
            </div>
          </div>

          <p className="text-xs text-center text-[#6b76b0] mt-5">
            Actual savings vary by order. You approve the price before anything is placed.
          </p>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="relative z-10 py-12 md:py-18 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-3"
              style={{ color: "#67e8f9", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)" }}>
              Why Nova Eats
            </span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-white">
              Built different
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
            {features.map(feat => (
              <div key={feat.title} className="card-hover rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-2 md:gap-3"
                style={{ background: "rgba(12,15,36,0.8)", border: `1px solid ${feat.border}`, boxShadow: `inset 0 0 30px ${feat.glow}`, backdropFilter: "blur(8px)" }}>
                <span className="text-2xl md:text-3xl">{feat.icon}</span>
                <h3 className="font-display font-bold text-sm md:text-lg text-white leading-snug">{feat.title}</h3>
                <p className="text-xs md:text-sm text-[#a8b0e0] leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="relative z-10 py-12 md:py-18 px-5"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(124,58,255,0.04) 50%, transparent 100%)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <h2 className="font-display font-black text-3xl md:text-5xl text-white">
              Real people, real savings
            </h2>
          </div>
          {/* Vouch count */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full"
              style={{ background: "rgba(124,58,255,0.1)", border: "1px solid rgba(124,58,255,0.2)" }}>
              <div className="flex -space-x-1.5">
                {["#7c3aff","#00d4ff","#ff8c00","#a78bfa","#00d4ff"].map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-[#04060f] flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: c }}>
                    {["J","P","M","A","K"][i]}
                  </div>
                ))}
              </div>
              <span className="text-sm font-semibold text-[#a78bfa]">2,000+ vouches</span>
              <span className="text-xs text-[#6b76b0]">in our Discord</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
            {testimonials.map(t => (
              <div key={t.handle} className="card-hover rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col gap-3"
                style={{ background: "rgba(12,15,36,0.8)", border: "1px solid rgba(124,58,255,0.12)", backdropFilter: "blur(8px)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-white text-xs"
                      style={{ background: `${t.color}33`, border: `1px solid ${t.color}55` }}>
                      {t.avatar}
                    </div>
                    <span className="text-xs md:text-sm font-medium text-[#a8b0e0]">{t.handle}</span>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ color: "#ff8c00", background: "rgba(255,140,0,0.1)", border: "1px solid rgba(255,140,0,0.2)" }}>
                    {t.savings}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#c4c9e8] leading-relaxed">"{t.text}"</p>
                <div className="flex gap-0.5 mt-auto">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#ff8c00] text-xs">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DISCORD CTA ─── */}
      <section id="discord" className="relative z-10 py-12 md:py-18 px-5">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-2xl md:rounded-3xl p-8 md:p-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(88,101,242,0.15) 0%, rgba(124,58,255,0.1) 100%)", border: "1px solid rgba(88,101,242,0.3)", backdropFilter: "blur(12px)" }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, rgba(88,101,242,0.8) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15"
                style={{ background: "radial-gradient(circle, rgba(124,58,255,0.8) 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
            </div>

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
                style={{ background: "#5865F2", boxShadow: "0 0 30px rgba(88,101,242,0.5)" }}>
                <DiscordIcon />
              </div>

              <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-3">
                Ready to stop overpaying?
              </h2>
              <p className="text-[#a8b0e0] text-base md:text-lg mb-7 max-w-lg mx-auto">
                Join the Discord, load some credits, and start saving 50%+ on your next order. Takes less than 5 minutes.
              </p>

              <a href={DISCORD}
                className="btn-discord inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-display font-bold text-lg text-white"
                style={{ background: "linear-gradient(135deg, #5865F2, #4752C4)", border: "1px solid rgba(88,101,242,0.5)" }}>
                <DiscordIcon />
                Join Discord — it's free
              </a>

              <div className="flex items-center justify-center gap-3 md:gap-6 mt-6 text-xs md:text-sm text-[#6b76b0] flex-wrap">
                {["No membership fee", "Approve every order", "Real support", "2,000+ vouches"].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckIcon />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="relative z-10 py-8 px-5 border-t" style={{ borderColor: "rgba(124,58,255,0.12)" }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image src={novaLogo} alt="Nova Eats" width={32} height={32} className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-bold text-white">Nova Eats</span>
          </div>
          <p className="text-xs text-[#6b76b0] text-center">
            Savings vary by order. You approve every order before it goes.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#6b76b0]">
            <a href="#" className="hover:text-[#a8b0e0] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#a8b0e0] transition-colors">Privacy</a>
            <a href={DISCORD} className="hover:text-[#a8b0e0] transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
