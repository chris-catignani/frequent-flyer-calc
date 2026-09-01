import { type NextRequest, NextResponse } from "next/server";

// Qantas API endpoint
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const airline = searchParams.get("airline") || "";
  const fromIata = searchParams.get("fromIata") || "";
  const toIata = searchParams.get("toIata") || "";
  const eliteStatus = searchParams.get("eliteStatus") || "";

  const url = buildQantasUrl(airline, fromIata, toIata, eliteStatus);

  console.log(`Calling qantas with url: ${url}`);

  const resp = await fetch(url);
  const respJson = await resp.json();
  return NextResponse.json(respJson);
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
