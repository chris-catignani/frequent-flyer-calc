import { getAirportsForCity, getAirportsForCountry } from "../airports"

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

const getIatasForCities = (citiesString) => {
  const cities = citiesString.split(", ")
  const airportIatas = new Set([])

  for (let city of cities) {

    // if Qantas city names !== the airport libraries city names
    if (city in cityNameOverrides) {
      city = cityNameOverrides[city]
    }

    const airports = getAirportsForCity(city)
    if (!airports) {
      console.error('no airports found for: ' + city)
    }
    airports.forEach(airport => airportIatas.add(airport.iata.toLowerCase()))
  }

  return airportIatas
}

const countryNameOverrides = {
  "Cocos Island": "Cocos (Keeling) Islands",
  "Republic of Korea": "South Korea",
  "Macao": "Macau",
  "Timor Lest": "East Timor",
  "Burkino Faso": "Burkina Faso",
  "Congo (Democratic Republic of)": "Congo (Kinshasa)",
  "Guinea Bissau": "Guinea-Bissau",
  "Ivory Coast": "Cote d'Ivoire",
  "Republic of Cameroon": "Cameroon",
  "Sao Tome Principe": "Sao Tome and Principe",
};

const cityNameOverrides = {
  'Washington DC': 'Washington'
}

const regions = {
  southeastAsia: getIatasForCountries('Brunei, Bhutan, Cambodia, Cocos Island, Indonesia, Laos, Malaysia, Myanmar, Philippines, Singapore, Thailand, Timor Lest, Vietnam'),
  northeastAsia: getIatasForCountries('China, Hong Kong, Japan, Macao, Mongolia, North Korea, Republic of Korea, Taiwan'),
  southeastEurope: getIatasForCountries('Greece, Turkey, Cyprus'),
  northernEurope: getIatasForCountries('Finland, Norway, Sweden'),
  westernEurope: getIatasForCountries('Austria, Belgium, Czech Republic, Germany, Denmark, Spain, France, United Kingdom, Ireland, Italy, Netherlands, Portugal, Switzerland'),
  northernAfrica: getIatasForCountries('Burkino Faso, Algeria, Benin, Cape Verde, Central African Republic, Chad, Congo (Democratic Republic of), Djibouti, Egypt, Equatorial Guinea, Eritrea, Ethiopia, Gambia, Ghana, Guinea, Guinea Bissau. Ivory Coast, Kenya, Liberia, Libya, Mali, Morocco, Niger, Nigeria, Republic of Cameroon, Sao Tome Principe, Senegal, Seychelles, Sierra Leone, Somalia, South Sudan, Sudan, Togo, Tunisia, Uganda'),
  usaEastCoast: new Set([...getIatasForCities('Boston, Charlotte, Chicago, Miami, New York, Orlando, Toronto, Washington DC'), 'ewr']),
  usaWestCoast: getIatasForCities('Las Vegas, Los Angeles, Phoenix, San Francisco, Seattle, Vancouver'),
  usaNycBos: new Set([...getIatasForCities('Boston'), 'jfk', 'lga', 'ewr']),

  // qantas doesn't define these for whatever reason
  middleEast: new Set(['doh', 'dxb', 'auh', 'jed', 'med']),
  southeastAustralia: new Set(['syd', 'mel']),

  // airports library doesn't have a concept of states
  hawaii: new Set(['ito', 'hnl', 'ogg', 'koa', 'mkk', 'lny', 'lih']) // per wikipedia https://en.wikipedia.org/wiki/List_of_airports_in_Hawaii
}

regions['europe'] = new Set([
  ...regions.westernEurope,
  ...regions.northernEurope,
  ...regions.southeastEurope
])
