import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";

const AIRPORTS_CSV_URL =
  "https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/airports.csv";
const COUNTRIES_CSV_URL =
  "https://raw.githubusercontent.com/davidmegginson/ourairports-data/master/countries.csv";

const cityFixes = {
  "Dallas-Fort Worth": "Dallas",
  "Sydney (Mascot)": "Sydney",
  "Muscat/Seeb": "Muscat",
  "Gold Coast": "Coolangatta",
  "Tel Aviv": "Tel-aviv",
};


const typeHierarchy = {
  large_airport: 5,
  medium_airport: 4,
  small_airport: 3,
  seaplane_base: 2,
  heliport: 1,
};

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function main() {
  console.log("Fetching OurAirports dataset...");
  const [airportsCsv, countriesCsv] = await Promise.all([
    fetchText(AIRPORTS_CSV_URL),
    fetchText(COUNTRIES_CSV_URL),
  ]);

  console.log("Parsing countries...");
  const parsedCountries = Papa.parse(countriesCsv, { header: true }).data;
  const countryMap = new Map();
  for (const c of parsedCountries) {
    if (c.code && c.name) {
      countryMap.set(c.code.trim().toUpperCase(), c.name.trim());
    }
  }

  console.log("Parsing airports...");
  const parsedAirports = Papa.parse(airportsCsv, { header: true }).data;

  // Group candidates by IATA for deterministic deduplication
  const candidatesByIata = new Map();

  for (const row of parsedAirports) {
    const iata = row.iata_code?.trim().toUpperCase();
    if (!iata || !/^[A-Z]{3}$/.test(iata) || row.type === "closed") {
      continue;
    }

    const lat = Number.parseFloat(row.latitude_deg);
    const lon = Number.parseFloat(row.longitude_deg);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      continue;
    }

    const isoCountry = row.iso_country?.trim().toUpperCase();
    const country = countryMap.get(isoCountry) || isoCountry || "";
    let city = row.municipality?.trim() || "";
    if (city in cityFixes) {
      city = cityFixes[city];
    }

    const candidate = {
      id: Number.parseInt(row.id, 10) || 0,
      scheduled: row.scheduled_service === "yes" ? 1 : 0,
      typeRank: typeHierarchy[row.type] || 0,
      airport: {
        iata,
        name: row.name?.trim() || "",
        city,
        country,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lon.toFixed(6)),
      },
    };

    if (!candidatesByIata.has(iata)) {
      candidatesByIata.set(iata, candidate);
    } else {
      const existing = candidatesByIata.get(iata);
      let replace = false;
      if (candidate.scheduled !== existing.scheduled) {
        replace = candidate.scheduled > existing.scheduled;
      } else if (candidate.typeRank !== existing.typeRank) {
        replace = candidate.typeRank > existing.typeRank;
      } else {
        replace = candidate.id < existing.id;
      }

      if (replace) {
        console.log(
          `Deduplicating IATA ${iata}: replacing "${existing.airport.name}" with "${candidate.airport.name}"`
        );
        candidatesByIata.set(iata, candidate);
      }
    }
  }

  const airports = Array.from(candidatesByIata.values())
    .map((c) => c.airport)
    .sort((a, b) => a.iata.localeCompare(b.iata));

  console.log(`Parsed ${airports.length} unique active IATA airports.`);
  if (airports.length < 8000) {
    throw new Error(`Sanity check failed: expected >= 8000 airports, got ${airports.length}`);
  }

  const outPath = path.resolve(process.cwd(), "src/data/airports.json");
  const tmpPath = `${outPath}.tmp`;
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(tmpPath, JSON.stringify(airports, null, 2), "utf8");
  fs.renameSync(tmpPath, outPath);
  console.log(`Wrote ${outPath} successfully.`);
}

main().catch((err) => {
  console.error("Generator failed:", err);
  process.exit(1);
});
