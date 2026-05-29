import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bytes = Number(searchParams.get("bytes"));
  const green = searchParams.get("green") === "0" ? 0 : 1;

  if (!Number.isFinite(bytes) || bytes <= 0) {
    return NextResponse.json(
      { ok: false, reason: "Missing or invalid measured bytes." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://api.websitecarbon.com/data?bytes=${Math.round(bytes)}&green=${green}`,
      { next: { revalidate: 3600 } },
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, reason: "Website Carbon API returned an error." },
        { status: 502 },
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      { ok: false, reason: "Website Carbon API request failed." },
      { status: 502 },
    );
  }
}
