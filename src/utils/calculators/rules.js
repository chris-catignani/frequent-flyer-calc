import { calcDistance, getAirport } from '@/utils/airports'
import { isInRegion } from './regions'

/**
 * All rules should implement these methods
 */
class Rule {
  constructor(name) {
    this.name = name
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
      fareEarnCategory,
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

  applies(segment, fareEarnCategory) {
    const fromAirport = getAirport(segment.fromAirport)
    const toAirport = getAirport(segment.toAirport)

    if (fromAirport.country !== "United States" || toAirport.country !== "United States") {
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
  constructor(name, distanceBands) {
    super(name)
    this.distanceBands = distanceBands
  }

  _getDistanceBand(distance) {
    return this.distanceBands.find((distanceBand) => {
      return distanceBand.minDistance < distance && distance <= distanceBand.maxDistance
    })
  }

  applies(segment, fareEarnCategory) {
    const distance = calcDistance(segment.fromAirport, segment.toAirport)
    return this._getDistanceBand(distance) != null
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
  constructor(name, ruleConfig) {
    super(name)
    this.ruleConfig = ruleConfig
  }

  _getOrigin(segment) {
    if (this.ruleConfig.origin.city) {
      const fromAirport = getAirport(segment.fromAirport)
      const toAirport = getAirport(segment.toAirport)

      if (this.ruleConfig.origin.city.has(fromAirport.city)) {
        return {type: 'city', value: fromAirport.city}
      } else if (this.ruleConfig.origin.city.has(toAirport.city)) {
        return {type: 'city', value: toAirport.city}
      }
    }

    if (this.ruleConfig.origin.country) {
      const fromAirport = getAirport(segment.fromAirport)
      const toAirport = getAirport(segment.toAirport)

      if(this.ruleConfig.origin.country.has(fromAirport.country)) {
        return {type: 'country', value: fromAirport.country}
      } else if(this.ruleConfig.origin.country.has(toAirport.country)) {
        return {type: 'country', value: toAirport.country}
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

    if (this.ruleConfig.destination.country) {
      const fromAirport = getAirport(segment.fromAirport)
      const toAirport = getAirport(segment.toAirport)

      if(fromAirport.country in this.ruleConfig.destination.country) {
        return {type: 'country', value: fromAirport.country}
      } else if(toAirport.country in this.ruleConfig.destination.country) {
        return {type: 'country', value: toAirport.country}
      }
    }

    return null
  }

  applies(segment, fareEarnCategory) {
    console.log(this.name)
    const origin = this._getOrigin(segment)
    console.log({origin})
    if (!origin) {
      return false
    }

    const destination = this._getDestination(segment)
    console.log({destination})
    if (!destination) {
      return false
    }

    console.log('match')
    return true
  }

  calculate(segment, fareEarnCategory) {
    const origin = this._getOrigin(segment)
    const destination = this._getDestination(segment)

    const earnings = this.ruleConfig.destination[destination.type][destination.value]

    return this.buildCalculationReturn(
      fareEarnCategory,
      `${origin.value} ${origin.type} to ${destination.value} ${destination.type}`,
      earnings[fareEarnCategory].qantasPoints,
      earnings[fareEarnCategory].statusCredits
    )
  }
}