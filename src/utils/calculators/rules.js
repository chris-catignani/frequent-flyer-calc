import { calcDistance, getAirport } from '@/utils/airports'
import { isInRegion } from './regions'

/**
 * All rules should implement these methods
 */
class Rule {
  constructor(name) {
    this.name = name
  }

  applies(segment, fareClass) {
    return false
  }

  calculate(segment, fareClass) {
    return this.buildCalculationReturn('', '', 0, 0)
  }

  buildCalculationReturn(fareClass, notes, qantasPoints, statusCredits) {
    return {
      rule: this.name,
      fareClass,
      notes,
      qantasPoints,
      statusCredits,
    }
  }
}

export class IntraUsaRule extends Rule {
  constructor(name, distanceBands) {
    super(name)
    this.distanceRule = new DistanceRule(name, distanceBands)
  }

  applies(segment, fareClass) {
    const fromAirport = getAirport(segment.fromAirport)
    const toAirport = getAirport(segment.toAirport)

    if (fromAirport.country !== "United States" || toAirport.country !== "United States") {
      return false
    }

    return this.distanceRule.applies(segment, fareClass)
  }

  calculate(segment, fareClass) {
    return this.distanceRule.calculate(segment, fareClass)
  }
}

/**
 * Distance based rule
 */
export class DistanceRule extends Rule {
  constructor(name, distanceBands) {
    super(name)
    this.distanceBands = distanceBands
  }

  _getDistanceBand(distance) {
    return this.distanceBands.find((distanceBand) => {
      return distanceBand.minDistance < distance && distance <= distanceBand.maxDistance
    })
  }

  applies(segment, fareClass) {
    const distance = calcDistance(segment.fromAirport, segment.toAirport)
    return this._getDistanceBand(distance) != null
  }

  calculate(segment, fareClass) {
    const distance = calcDistance(segment.fromAirport, segment.toAirport)

    const distanceBand = this._getDistanceBand(distance)
    if (!distanceBand) {
      throw new Error("No applicable distance band to calculate with for rule: " + this.name)
    }

    return this.buildCalculationReturn(
      fareClass,
      `Distance band ${distanceBand.minDistance} - ${distanceBand.maxDistance}`,
      distanceBand.earnings[fareClass].qantasPoints,
      distanceBand.earnings[fareClass].statusCredits
    )
  }
}

/**
 * Rule for Geographical pairings. Can be setup in a few ways:
 * ...
 */
export class GeographicalRule extends Rule {
  constructor(name, ruleConfig) {
    super(name)
    this.ruleConfig = ruleConfig
  }

  _getOrigin(segment) {
    if (this.ruleConfig.origin.cities) {
      if (this.ruleConfig.origin.cities.has(segment.fromAirport)) {
        return {type: 'city', value: segment.fromAirport}
      } else if (this.ruleConfig.origin.cities.has(segment.toAirport)) {
        return {type: 'city', value: segment.toAirport}
      }
    }

    if (this.ruleConfig.origin.region) {
      for (let region of this.ruleConfig.origin.region.values()) {
        if (isInRegion(segment.fromAirport, region)) {
          return {type: 'region', value: region}
        } else if (isInRegion(segment.toAirport, region)) {
          return {type: 'region', value: region}
        }
      }
    }

    return null
  }

  _getDestination(segment) {
    if (this.ruleConfig.destination.region) {
      for (let region of Object.keys(this.ruleConfig.destination.region)) {
        if (isInRegion(segment.fromAirport, region)) {
          return {type: 'region', value: region}
        } else if (isInRegion(segment.toAirport, region)) {
          return {type: 'region', value: region}
        }
      }
    }

    return null
  }

  applies(segment, fareClass) {
    const origin = this._getOrigin(segment)
    if (!origin) {
      return false
    }

    const destination = this._getDestination(segment)
    if (!destination) {
      return false
    }

    return true
  }

  calculate(segment, fareClass) {
    const origin = this._getOrigin(segment)
    const destination = this._getDestination(segment)

    const earnings = this.ruleConfig.destination[destination.type][destination.value]

    return this.buildCalculationReturn(
      fareClass,
      `${origin.type} ${origin.value} to ${destination.type} ${destination.value}`,
      earnings[fareClass].qantasPoints,
      earnings[fareClass].statusCredits
    )
  }
}