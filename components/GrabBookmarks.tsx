"use client";

import { useEffect, useRef, useState } from "react";

function bookmarkFor(file: string) {
  const origin =
    typeof window === "undefined" ? "https://novaeats.co" : window.location.origin;
  return (
    "javascript:void(function(){var s=document.createElement('script');s.src='" +
    origin +
    "/grab/" +
    file +
    "?'+Date.now();document.body.appendChild(s);})();"
  );
}

function BookmarkCard({
  file,
  title,
  body,
}: {
  file: string;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.setAttribute("href", bookmarkFor(file));
  }, [file]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(bookmarkFor(file));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked in some browsers / iframes */
    }
  }

  return (
    <article className="rounded-2xl border border-white/8 bg-card px-6 py-7">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          ref={ref}
          href="#"
          className="inline-flex cursor-grab items-center rounded-full border border-gold/50 bg-gold px-5 py-2.5 text-[13px] font-semibold text-[#07070d] shadow-[0_0_24px_rgba(248,192,0,.18)]"
        >
          {title}
        </a>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-white/12 px-4 py-2.5 text-[13px] text-mute transition-colors hover:border-gold/40 hover:text-ink"
        >
          {copied ? "Copied" : "Copy bookmarklet"}
        </button>
      </div>
    </article>
  );
}

export function GrabBookmarks() {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      <BookmarkCard
        file="wonder.js"
        title="Wonder grabber"
        body="Use this for Wonder orders. Drag the gold button onto your bookmarks bar."
      />
      <BookmarkCard
        file="yonder.js"
        title="Yonder grabber"
        body="Use this for Yonder orders. Same cart page — different code backend."
      />
    </div>
  );
}
