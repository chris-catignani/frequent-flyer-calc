import { airports } from "@nwpr/airport-codes";
import GreatCircle from "great-circle";

export const getAirport = (iata) => {
  return airports.find((airport) => airport.iata === iata.toUpperCase())
}

export const calcDistance = (iata1, iata2) => {
  const airport1 = getAirport(iata1)
  const airport2 = getAirport(iata2)

  return Math.floor(
    GreatCircle.distance(
      airport1.latitude,
      airport1.longitude,
      airport2.latitude,
      airport2.longitude,
      "MI"
    )
  )
}
