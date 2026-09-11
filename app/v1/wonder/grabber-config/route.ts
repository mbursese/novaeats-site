import { NextResponse } from "next/server";

const backend = (
  process.env.NEXT_PUBLIC_WONDER_BACKEND || "wonderful"
).toLowerCase();

const wonderfulUpstream =
  process.env.NEXT_PUBLIC_WONDERFUL_GRAB_UPSTREAM ||
  "https://cg.wonderfulbot.org/static/grab.js";

const yonderUpstream =
  process.env.NEXT_PUBLIC_YONDER_GRAB_SCRIPT ||
  "https://wonder-cart-production.up.railway.app/s/090c75c2b18cab03.js";

const clientConfig =
  process.env.NEXT_PUBLIC_WONDERFUL_GRAB_CLIENT_CONFIG ||
  "wc1.wWZjLsxh10NFPXfbUo0gxGc6B_9URr10bH9ncXKq3A0AxPe3XmYhPc1pksvI3XgUd8romwE9u_QGbTYbwQgX3UB8bRb3uSHvIHzC_eGoHU4E_N8xSPIg1XZenAGgQlvsHStgvrSDN948rmuPwelWuFSns2e6g7GN8NZp2jgkZsINgZEkS2pOPl1OIE7irZZo62g";

const corsHeaders = {
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
};

function staticConfig() {
  const yonder =
    backend === "yonder" || backend === "yonderdrop";
  return {
    backend: yonder ? "yonder" : "wonderful",
    slot: yonder ? 2 : 1,
    src: yonder ? yonderUpstream : wonderfulUpstream,
    clientConfig,
  };
}

export async function GET() {
  const tracker =
    (process.env.TRACKER_PUBLIC_URL || "https://tracker.novaeats.co").replace(
      /\/$/,
      "",
    );

  try {
    const res = await fetch(`${tracker}/api/wonder/grabber-config`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, { headers: corsHeaders });
    }
  } catch {
    /* tracker offline — fall back to build-time env */
  }

  return NextResponse.json(staticConfig(), { headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
