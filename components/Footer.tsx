import Link from "next/link";
import { DISCORD } from "@/lib/site";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/8 px-5 py-12 md:px-8">
      <div className="mx-auto flex max-w-[1080px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <Logo />
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-mute">
          <a href={DISCORD} className="hover:text-ink">
            Discord
          </a>
          <a href="#how" className="hover:text-ink">
            How It Works
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
      <p className="mx-auto mt-10 max-w-[1080px] text-[12px] leading-relaxed text-mute">
        © 2026 Nova Eats. All rights reserved. Nova is an independent service.
        Savings vary by restaurant and order.
      </p>
    </footer>
  );
}
