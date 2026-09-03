import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const airportsPath = path.resolve(process.cwd(), "src/data/airports.json");

test("airports.json invariants", () => {
  assert.ok(fs.existsSync(airportsPath), "src/data/airports.json must exist");
  const raw = fs.readFileSync(airportsPath, "utf8");
  const airports = JSON.parse(raw);

  assert.ok(Array.isArray(airports), "airports must be an array");
  assert.ok(airports.length >= 8000, `expected at least 8000 airports, got ${airports.length}`);

  const iataSet = new Set();
  let prevIata = "";
  for (const a of airports) {
    assert.match(a.iata, /^[A-Z]{3}$/, `Invalid IATA code: ${a.iata}`);
    assert.ok(!iataSet.has(a.iata), `Duplicate IATA code: ${a.iata}`);
    iataSet.add(a.iata);

    // Verify sorted alphabetically
    assert.ok(a.iata > prevIata, `airports must be sorted by IATA: ${a.iata} <= ${prevIata}`);
    prevIata = a.iata;

    assert.equal(typeof a.name, "string", `name must be string on ${a.iata}`);
    assert.ok(a.name.length > 0, `name cannot be empty on ${a.iata}`);
    assert.equal(typeof a.city, "string", `city must be string on ${a.iata}`);
    assert.equal(typeof a.country, "string", `country must be string on ${a.iata}`);
    assert.ok(a.country.length > 0, `country cannot be empty on ${a.iata}`);
    assert.ok(Number.isFinite(a.latitude), `latitude must be finite on ${a.iata}`);
    assert.ok(Number.isFinite(a.longitude), `longitude must be finite on ${a.iata}`);
  }

  // Check critical modern airports
  const sai = airports.find((a) => a.iata === "SAI");
  assert.ok(sai, "Must contain SAI (Siem Reap–Angkor)");
  assert.equal(sai.city, "Siem Reap");
  assert.equal(sai.country, "Cambodia");

  const ber = airports.find((a) => a.iata === "BER");
  assert.ok(ber, "Must contain BER (Berlin Brandenburg)");
});
