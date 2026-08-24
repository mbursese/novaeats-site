"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DISCORD, nav } from "@/lib/site";
import { Logo } from "./Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/8 bg-bg/70 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <a href="#top" className="relative z-10" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-8 text-[13px] text-mute md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={DISCORD}
            className="hidden rounded-full border border-white/16 px-4 py-2 text-[13px] font-medium text-ink transition hover:border-white/30 hover:bg-white/5 md:inline-flex"
          >
            Join Discord
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/8 bg-bg/95 px-5 py-5 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="py-1 text-mute"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={DISCORD}
              className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-ink text-sm font-medium text-bg"
            >
              Join Discord
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
