"use client";

import { useEffect, useRef, useState } from "react";

function inlineBookmark(source: string) {
  const compact = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return "javascript:" + compact;
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
  const [bookmark, setBookmark] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/grab/" + file + "?" + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error("Could not load grabber");
        return res.text();
      })
      .then(function (source) {
        if (cancelled) return;
        const href = inlineBookmark(source);
        setBookmark(href);
        const node = ref.current;
        if (node) node.setAttribute("href", href);
      })
      .catch(function () {
        if (!cancelled) setHint("Could not build the bookmark. Refresh and try again.");
      });
    return function () {
      cancelled = true;
    };
  }, [file]);

  async function copy() {
    if (!bookmark) return;
    try {
      await navigator.clipboard.writeText(bookmark);
      setCopied(true);
      window.setTimeout(function () {
        setCopied(false);
      }, 1600);
    } catch {
      /* clipboard can be blocked in some browsers / iframes */
    }
  }

  function onGoldClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setHint("Don't click it here. Drag it onto your bookmarks bar, then click it on wonder.com.");
  }

  return (
    <article className="rounded-2xl border border-white/8 bg-card px-6 py-7">
      <h2 className="text-[20px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-mute">{body}</p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <a
          ref={ref}
          href="#"
          onClick={onGoldClick}
          className="inline-flex cursor-grab items-center rounded-full border border-gold/50 bg-gold px-5 py-2.5 text-[13px] font-semibold text-[#07070d] shadow-[0_0_24px_rgba(248,192,0,.18)]"
        >
          {title}
        </a>
        <button
          type="button"
          onClick={copy}
          disabled={!bookmark}
          className="rounded-full border border-white/12 px-4 py-2.5 text-[13px] text-mute transition-colors hover:border-gold/40 hover:text-ink disabled:opacity-40"
        >
          {copied ? "Copied" : "Copy bookmark"}
        </button>
      </div>
      {hint ? (
        <p className="mt-4 text-[13px] leading-relaxed text-gold">{hint}</p>
      ) : null}
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
        file="v2.js"
        title="Grabber 2"
        body="Same cart page, other checkout backend. Drag the gold button onto your bookmarks bar."
      />
    </div>
  );
}
