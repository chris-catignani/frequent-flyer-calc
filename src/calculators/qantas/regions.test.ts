import { isInRegion, countryNameOverrides, cityNameOverrides } from "./regions";
import { getAirportsForCity, getAirportsForCountry } from "@/utils/airports";

describe("regions", () => {
  test("all country definitions resolve to at least one airport", () => {
    const countries = [
      "Brunei",
      "Bhutan",
      "Cambodia",
      "Cocos Island",
      "Indonesia",
      "Laos",
      "Malaysia",
      "Myanmar",
      "Philippines",
      "Singapore",
      "Thailand",
      "Timor Lest",
      "Vietnam",
      "China",
      "Hong Kong",
      "Japan",
      "Macao",
      "Mongolia",
      "North Korea",
      "Republic of Korea",
      "Taiwan",
      "Greece",
      "Turkey",
      "Cyprus",
      "Finland",
      "Norway",
      "Sweden",
      "Austria",
      "Belgium",
      "Czech Republic",
      "Germany",
      "Denmark",
      "Spain",
      "France",
      "United Kingdom",
      "Ireland",
      "Italy",
      "Netherlands",
      "Portugal",
      "Switzerland",
      "Burkino Faso",
      "Algeria",
      "Benin",
      "Cape Verde",
      "Central African Republic",
      "Chad",
      "Congo (Democratic Republic of)",
      "Djibouti",
      "Egypt",
      "Equatorial Guinea",
      "Eritrea",
      "Ethiopia",
      "Gambia",
      "Ghana",
      "Guinea",
      "Guinea Bissau",
      "Ivory Coast",
      "Kenya",
      "Liberia",
      "Libya",
      "Mali",
      "Morocco",
      "Niger",
      "Nigeria",
      "Republic of Cameroon",
      "Sao Tome Principe",
      "Senegal",
      "Seychelles",
      "Sierra Leone",
      "Somalia",
      "South Sudan",
      "Sudan",
      "Togo",
      "Tunisia",
      "Uganda",
    ];

    for (const country of countries) {
      const resolvedCountry = countryNameOverrides[country] ?? country;
      const airports = getAirportsForCountry(resolvedCountry);
      expect(airports.length).toBeGreaterThan(0);
    }
  });

  test("all city definitions resolve to at least one airport", () => {
    const cities = [
      "Boston",
      "Charlotte",
      "Chicago",
      "Miami",
      "New York",
      "Orlando",
      "Toronto",
      "Washington DC",
      "Las Vegas",
      "Los Angeles",
      "Phoenix",
      "San Francisco",
      "Seattle",
      "Vancouver",
    ];

    for (const city of cities) {
      const resolvedCity = cityNameOverrides[city] ?? city;
      const airports = getAirportsForCity(resolvedCity);
      expect(airports.length).toBeGreaterThan(0);
    }
  });

  test("isInRegion correctly identifies known region airports", () => {
    expect(isInRegion("sin", "southeastAsia")).toBe(true);
    expect(isInRegion("hnd", "northeastAsia")).toBe(true);
    expect(isInRegion("lhr", "westernEurope")).toBe(true);
    expect(isInRegion("jfk", "usaEastCoast")).toBe(true);
    expect(isInRegion("lax", "usaWestCoast")).toBe(true);
    expect(isInRegion("syd", "southeastAustralia")).toBe(true);
    expect(isInRegion("cai", "northernAfrica")).toBe(true);
    expect(isInRegion("syd", "westernEurope")).toBe(false);
  });
});
