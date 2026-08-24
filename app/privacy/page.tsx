import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Privacy() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-16">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>
      <h1 className="mt-10 text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-6 text-[15px] leading-relaxed text-mute">
        Nova Eats only uses the information you share in Discord to place and
        track orders — typically a name, address, and cart details. We do not
        sell that information. Payment details stay with the checkout flow you
        complete and are not stored on this website.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-mute">
        This marketing site itself does not collect accounts or card numbers.
        Questions about data can be sent through a Discord support ticket.
      </p>
      <Link href="/" className="mt-10 inline-block text-sm text-ink underline">
        Back home
      </Link>
    </main>
  );
}
