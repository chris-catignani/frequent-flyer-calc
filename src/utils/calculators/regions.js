import { getAirportsForCountry } from "../airports"

export const isInRegion = (iata, region) => {
  return regions[region]?.has(iata)
}

const getIatasForCountries = (countryString) => {
  const countries = countryString.split(", ")
  const airportIatas = new Set([])

  for (let country of countries) {

    // if Qantas country names !== the airport libraries country names
    if (country in countryNameOverrides) {
      country = countryNameOverrides[country]
    }

    const airports = getAirportsForCountry(country)
    if (!airports) {
      console.error('no airports found for: ' + country)
    }
    airports.forEach(airport => airportIatas.add(airport.iata.toLowerCase()))
  }

  return airportIatas
}

const countryNameOverrides = {
  'Cocos Island': 'Cocos (Keeling) Islands'
}

const regions = {
  usaEastCoast: new Set(['bos', 'clt', 'ord', 'mia', 'jfk',  'ewr', 'mco', 'yyz', 'dca', 'iad']),
  usaWestCoast: new Set(['las', 'lax', 'phx', 'sfo', 'sea', 'yvr']),
  usaNycBos: new Set(['jfk', 'ewr', 'lga', 'bos']),
  southeastAsia: getIatasForCountries('Brunei, Bhutan, Cambodia, Cocos Island, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Timor Lest, Vietnam'),
  northernAfrica: getIatasForCountries('Burkino Faso, Algeria, Benin, Cape Verde, Central African Republic, Chad, Congo (Democratic Republic of), Djibouti, Egypt, Equatorial Guinea, Eritrea, Ethiopia, Gambia, Ghana, Guinea, Guinea Bissau. Ivory Coast, Kenya, Liberia, Libya, Mali, Morocco, Niger, Nigeria, Republic of Cameroon, Sao Tome Principe, Senegal, Seychelles, Sierra Leone, Somalia, South Sudan, Sudan, Togo, Tunisia, Uganda')
}

console.log(regions)