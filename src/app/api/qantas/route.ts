import { type NextRequest, NextResponse } from "next/server";

// Qantas API endpoint
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const airline = searchParams.get("airline")?.trim() || "";
  const fromIata = searchParams.get("fromIata")?.trim() || "";
  const toIata = searchParams.get("toIata")?.trim() || "";
  const eliteStatus = searchParams.get("eliteStatus")?.trim() || "";

  const missingParams: string[] = [];
  if (!airline) missingParams.push("airline");
  if (!fromIata) missingParams.push("fromIata");
  if (!toIata) missingParams.push("toIata");
  if (!eliteStatus) missingParams.push("eliteStatus");

  if (missingParams.length > 0) {
    return NextResponse.json(
      { error: `Missing required query parameters: ${missingParams.join(", ")}` },
      { status: 400 }
    );
  }

  const url = buildQantasUrl(airline, fromIata, toIata, eliteStatus);

  try {
    const resp = await fetch(url);

    if (!resp.ok) {
      let errorBody: unknown;
      try {
        errorBody = await resp.json();
      } catch {
        errorBody = { error: resp.statusText || "Upstream service error" };
      }
      console.error(`Qantas API error (${resp.status}) for URL: ${url}`, errorBody);
      return NextResponse.json(errorBody, { status: resp.status });
    }

    const respJson = await resp.json();
    return NextResponse.json(respJson);
  } catch (err) {
    console.error(`Qantas API fetch failed for URL: ${url}`, err);
    return NextResponse.json({ error: "Failed to fetch from Qantas API" }, { status: 502 });
  }
}

// Build the request url, e.g.
// https://api.services.qantasloyalty.com/earnquote/v1/rewards?fares=AA_LHRJFK&tiers=Bronze&date=2025-01-29
function buildQantasUrl(
  airline: string,
  fromIata: string,
  toIata: string,
  eliteStatus: string
): string {
  const date = new Date();
  const qantasUrl = new URL("https://api.services.qantasloyalty.com/earnquote/v1/rewards");

  qantasUrl.searchParams.append(
    "fares",
    airline.toUpperCase() + "_" + fromIata.toUpperCase() + toIata.toUpperCase()
  );
  qantasUrl.searchParams.append("tiers", eliteStatus);
  qantasUrl.searchParams.append("date", formatDate(date));

  return qantasUrl.href;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
