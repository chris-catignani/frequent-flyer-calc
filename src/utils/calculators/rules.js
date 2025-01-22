import { calcDistance, getAirport } from '@/utils/airports'
import { isInRegion } from './regions'
import { QantasEarnings } from '@/models/qantasEarnings'

/**
 * All rules should implement these methods
 */
class Rule {
  constructor(name, ruleUrl) {
    this.name = name
    this.ruleUrl = ruleUrl
  }

  applies(segment, fareEarnCategory) {
    return false
  }

  calculate(segment, fareEarnCategory) {
    return this.buildCalculationReturn('', '', 0, 0)
  }

  buildCalculationReturn(fareEarnCategory, notes, qantasPoints, statusCredits) {
    return {
      rule: this.name,
      ruleUrl: this.ruleUrl,
      fareEarnCategory,
      notes,
      qantasPoints,
      statusCredits,
    }
  }
}

export class IntraCountryRule extends Rule {
  constructor(name, ruleUrl, country, distanceBands) {
    super(name, ruleUrl)
    this.country = country
    this.distanceRule = new DistanceRule(name, ruleUrl, distanceBands)
  }

  applies(segment, fareEarnCategory) {
    const fromAirport = getAirport(segment.fromAirport)
    const toAirport = getAirport(segment.toAirport)

    if (fromAirport.country !== this.country || toAirport.country !== this.country) {
      return false
    }

    return this.distanceRule.applies(segment, fareEarnCategory)
  }

  calculate(segment, fareEarnCategory) {
    return this.distanceRule.calculate(segment, fareEarnCategory)
  }
}

/**
 * Distance based rule
 */
export class DistanceRule extends Rule {
  constructor(name, ruleUrl, distanceBands) {
    super(name, ruleUrl)
    this.distanceBands = distanceBands
  }

  _getDistanceBand(distance) {
    return this.distanceBands.find((distanceBand) => {
      return distanceBand.minDistance < distance && distance <= distanceBand.maxDistance
    })
  }

  applies(segment, fareEarnCategory) {
    const distance = calcDistance(segment.fromAirport, segment.toAirport)
    const distanceBand = this._getDistanceBand(distance)
    if(!distanceBand) {
      return false
    }

    return fareEarnCategory in distanceBand.earnings
  }

  calculate(segment, fareEarnCategory) {
    const distance = calcDistance(segment.fromAirport, segment.toAirport)

    const distanceBand = this._getDistanceBand(distance)
    if (!distanceBand) {
      throw new Error("No applicable distance band to calculate with for rule: " + this.name)
    }

    return this.buildCalculationReturn(
      fareEarnCategory,
      `Distance calculated to ${distance} miles, using band ${distanceBand.minDistance} - ${distanceBand.maxDistance}`,
      distanceBand.earnings[fareEarnCategory].qantasPoints,
      distanceBand.earnings[fareEarnCategory].statusCredits
    )
  }
}

/**
 * Rule for Geographical pairings. Can be setup in a few ways:
 * ...
 */
export class GeographicalRule extends Rule {
  constructor(name, ruleUrl, ruleConfig) {
    super(name, ruleUrl)
    this.ruleConfig = ruleConfig
  }

  _getOrigin(iata) {
    if (this.ruleConfig.origin.city) {
      const airport = getAirport(iata)

      if (this.ruleConfig.origin.city.has(airport.city.toLowerCase())) {
        return {type: 'city', value: airport.city.toLowerCase()}
      }
    }

    if (this.ruleConfig.origin.country) {
      const airport = getAirport(iata)

      if(this.ruleConfig.origin.country.has(airport.country.toLowerCase())) {
        return {type: 'country', value: airport.country.toLowerCase()}
      }
    }

    if (this.ruleConfig.origin.region) {
      for (let region of this.ruleConfig.origin.region.values()) {
        if (isInRegion(iata, region)) {
          return {type: 'region', value: region}
        }
      }
    }

    return null
  }

  _getDestination(iata) {
    if (this.ruleConfig.destination.city) {
      const airport = getAirport(iata)

      if (airport.city.toLowerCase() in this.ruleConfig.destination.city) {
        return {type: 'city', value: airport.city.toLowerCase()}
      }
    }

    if (this.ruleConfig.destination.country) {
      const airport = getAirport(iata)

      if(airport.country.toLowerCase() in this.ruleConfig.destination.country) {
        return {type: 'country', value: airport.country.toLowerCase()}
      }
    }

    if (this.ruleConfig.destination.region) {
      for (let region of Object.keys(this.ruleConfig.destination.region)) {
        if (isInRegion(iata, region)) {
          return {type: 'region', value: region}
        }
      }
    }

    return null
  }

_getOriginAndDestination(segment) {
    let origin = this._getOrigin(segment.fromAirport)
    let destination = this._getDestination(segment.toAirport)

    if (!origin || !destination) {
      origin = this._getOrigin(segment.toAirport)
      destination = this._getDestination(segment.fromAirport)
    }

    return {origin, destination}
  }

  applies(segment, fareEarnCategory) {
    const {origin, destination} = this._getOriginAndDestination(segment)
    if (!origin || !destination) {
      return false
    }

    const earnings = this.ruleConfig.destination[destination.type][destination.value]
    return fareEarnCategory in earnings
  }

  calculate(segment, fareEarnCategory) {
    const {origin, destination} = this._getOriginAndDestination(segment)
    const earnings = this.ruleConfig.destination[destination.type][destination.value]

    return this.buildCalculationReturn(
      fareEarnCategory,
      `${origin.value} ${origin.type} to ${destination.value} ${destination.type}`,
      earnings[fareEarnCategory].qantasPoints,
      earnings[fareEarnCategory].statusCredits
    )
  }
}

export const buildEarningRates = (qantasPointsString, qantasCreditsString, fareClasses) => {
  const pointsPerFareclass = qantasPointsString.trim().replace(/\,/gm, '').replace(/\s+/gm, ' ').split(' ')
  const creditsPerFareclass = qantasCreditsString.trim().replace(/\s+/gm, ' ').split(' ')
  const retval = {}

  fareClasses.forEach((fareClass, index) => {
    retval[fareClass] = new QantasEarnings(
      parseInt(pointsPerFareclass[index]),
      parseInt(creditsPerFareclass[index])
    )
  })

  return retval
}
