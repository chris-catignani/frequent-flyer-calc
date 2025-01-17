import { calcDistance } from '@/utils/airports'

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

  buildCalculationReturn(fareClass, calculationNotes, qantasPoints, statusCredits) {
    return {
      rule: this.name,
      fareClass,
      calculationNotes,
      qantasPoints,
      statusCredits,
    }
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
