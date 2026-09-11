"use client";

import { useEffect, useRef, useState } from "react";

const WONDERFUL_GRAB_SCRIPT =
  process.env.NEXT_PUBLIC_WONDERFUL_GRAB_SCRIPT ||
  "https://novaeats.co/v1/wonder/grab.js";

const WONDERFUL_GRAB_CLIENT_CONFIG =
  process.env.NEXT_PUBLIC_WONDERFUL_GRAB_CLIENT_CONFIG ||
  "wc1.wWZjLsxh10NFPXfbUo0gxGc6B_9URr10bH9ncXKq3A0AxPe3XmYhPc1pksvI3XgUd8romwE9u_QGbTYbwQgX3UB8bRb3uSHvIHzC_eGoHU4E_N8xSPIg1XZenAGgQlvsHStgvrSDN948rmuPwelWuFSns2e6g7GN8NZp2jgkZsINgZEkS2pOPl1OIE7irZZo62g";

function novaBookmark() {
  return (
    'javascript:(function(){var c="' +
    WONDERFUL_GRAB_CLIENT_CONFIG +
    '";window.__WONDER_CLIENT_CONFIG__=c;var s=document.createElement(\'script\');s.src=\'' +
    WONDERFUL_GRAB_SCRIPT +
    "?v='+Date.now();document.body.appendChild(s);})();"
  );
}

function BookmarkCard({
  bookmark,
  title,
  body,
}: {
  bookmark: string;
  title: string;
  body: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState("");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.setAttribute("href", bookmark);
  }, [bookmark]);

  async function copy() {
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
          className="rounded-full border border-white/12 px-4 py-2.5 text-[13px] text-mute transition-colors hover:border-gold/40 hover:text-ink"
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
  const bookmark = novaBookmark();

  return (
    <div className="mt-10">
      <BookmarkCard
        bookmark={bookmark}
        title="Wonder grabber"
        body="Wonder checkout. Drag the gold button onto your bookmarks bar, or add it on your phone the same way. Backend (Wonderful vs Yonder) is configured on the server — customers always use this same bookmark."
      />
    </div>
  );
}
