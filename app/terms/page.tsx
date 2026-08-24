import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Terms() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>
      <h1 className="mt-10 text-4xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-mute">
        Nova Eats is an independent automated ordering service. By using Discord
        to place orders, you agree to follow community rules, pay any stated
        amounts before checkout, and understand that restaurant availability,
        fees, and delivery times are controlled by the underlying platforms.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-mute">
        Savings, rewards, and platform support may change. Food quality,
        refunds, and delivery issues are handled through the restaurant or
        original platform where applicable, with Nova support available in
        Discord.
      </p>
      <Link href="/" className="mt-10 inline-block text-sm text-ink underline">
        Back home
      </Link>
    </main>
  );
}
