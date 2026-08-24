import Link from "next/link";
import { DISCORD } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-5 py-14 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-mute">
          <a href={DISCORD} className="hover:text-gold">
            Discord
          </a>
          <a href="#how" className="hover:text-ink">
            How It Works
          </a>
          <a href="#why" className="hover:text-ink">
            Savings
          </a>
          <a href="#faq" className="hover:text-ink">
            FAQ
          </a>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-[13px] text-mute">
        Eat well. Spend less. Nova helps you save on meals and food delivery.
      </p>
      <p className="mx-auto mt-4 max-w-6xl text-[12px] leading-relaxed text-mute/75">
        Nova Eats is an independent service. Savings vary by restaurant and order.
      </p>
      <p className="mx-auto mt-3 max-w-6xl text-[12px] text-mute">
        © 2026 Nova Eats. All rights reserved.
      </p>
    </footer>
  );
}
