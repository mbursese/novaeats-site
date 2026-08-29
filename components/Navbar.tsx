"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DISCORD, nav } from "@/lib/site";
import { Logo } from "./Logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-4 md:pt-4">
      <div
        className={`mx-auto flex h-14 max-w-[1080px] items-center justify-between rounded-full px-3 pl-4 transition-all duration-300 md:h-16 md:px-4 ${
          scrolled || open
            ? "glass shadow-[0_20px_50px_rgba(0,0,0,.35)]"
            : "border border-transparent"
        }`}
      >
        <a href="#top" className="relative z-10" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className="hidden items-center gap-7 text-[13px] text-mute md:flex">
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

        <div className="flex items-center gap-2">
          <a href={DISCORD} className="btn-primary hidden h-10 px-4 text-[13px] md:inline-flex">
            Start Saving Now
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
        <div className="glass mx-auto mt-2 max-w-[1080px] rounded-3xl px-5 py-5 md:hidden">
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
              className="btn-primary mt-1 h-11"
              onClick={() => setOpen(false)}
            >
              Start Saving Now
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
