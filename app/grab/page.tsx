import type { Metadata } from "next";
import Link from "next/link";
import { GrabBookmarks } from "@/components/GrabBookmarks";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Cart grabber — Nova Eats",
  robots: { index: false, follow: false },
};

export default function GrabPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <Link href="/" className="inline-block">
        <Logo />
      </Link>
      <p className="mt-10 text-[12px] tracking-[0.18em] text-gold">STAFF</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">Cart grabber</h1>
      <p className="mt-5 text-[15px] leading-relaxed text-mute">
        Hosted on Nova so the overlay can match the rest of the brand. Codes
        still save to the same cart servers the bot already uses.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed text-mute">
        <li>Show the bookmarks bar (Chrome: Cmd+Shift+B).</li>
        <li>
          Drag the gold button onto that bar — clicking it on this page does
          nothing. If drag fails, copy the bookmark, add a new bookmark, and
          paste it as the URL.
        </li>
        <li>Open a filled cart on wonder.com, then click the bookmark there.</li>
        <li>Paste the code into Discord.</li>
      </ol>
      <GrabBookmarks />
      <p className="mt-10 text-[13px] leading-relaxed text-mute/80">
        Replace any older bookmark that pointed at /grab/v2.js or /grab/wonder.js.
        Those load a remote file, and wonder.com blocks it.
      </p>
      <Link href="/" className="mt-10 inline-block text-sm text-ink underline">
        Back home
      </Link>
    </main>
  );
}
