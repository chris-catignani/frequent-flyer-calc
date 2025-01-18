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

// TODO check others here. Move this into airports js
const countryNameOverrides = {
  'Cocos Island': 'Cocos (Keeling) Islands'
}

const regions = {
  southeastAsia: getIatasForCountries('Brunei, Bhutan, Cambodia, Cocos Island, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Timor Lest, Vietnam'),
  southeastEurope: getIatasForCountries('Greece, Turkey, Cyprus'),
  northernEurope: getIatasForCountries('Finland, Norway, Sweden'),
  westernEurope: getIatasForCountries('Austria, Belgium, Czech Republic, Germany, Denmark, Spain, France, United Kingdom, Ireland, Italy, Netherlands, Portugal, Switzerland'), 
  northernAfrica: getIatasForCountries('Burkino Faso, Algeria, Benin, Cape Verde, Central African Republic, Chad, Congo (Democratic Republic of), Djibouti, Egypt, Equatorial Guinea, Eritrea, Ethiopia, Gambia, Ghana, Guinea, Guinea Bissau. Ivory Coast, Kenya, Liberia, Libya, Mali, Morocco, Niger, Nigeria, Republic of Cameroon, Sao Tome Principe, Senegal, Seychelles, Sierra Leone, Somalia, South Sudan, Sudan, Togo, Tunisia, Uganda'),
  usaEastCoast: new Set(['bos', 'clt', 'ord', 'mia', 'jfk',  'ewr', 'mco', 'yyz', 'dca', 'iad']),
  usaWestCoast: new Set(['las', 'lax', 'phx', 'sfo', 'sea', 'yvr']),
  usaNycBos: new Set(['jfk', 'ewr', 'lga', 'bos'])
}
