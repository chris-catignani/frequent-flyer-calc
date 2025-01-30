import { isInRegion } from "./regions"

/**
 * Taking the copy/paste fare buckets from the Qantas website and parse them.
 */
export const buildFareBuckets = (qantasString, fareClasses) => {
  // remove all '*', replace whitespace with single space, split on that single space
  const fareBuckets = qantasString.trim().replace(/\*\~\^/gm, '').replace(/\s+/gm, ' ').toLowerCase().split(' ')
  const retval = {}

  fareClasses.forEach((fareClass, index) => {
    if (fareBuckets[index] === '-') {
      return
    }

    // iterate over each single fareClass character, putting that character and fare category into the map
    fareBuckets[index].split('').forEach(fareBucket => retval[fareBucket] = fareClass);
  })

  return retval
}

export const buildSimpleFareBuckets = (qantasString, fareClasses) => {
  return {
    rules: [
      {
        all: true,
        categories: buildFareBuckets(qantasString, fareClasses)
      }
    ]
  }
}
export const getEarnCategory = (segment, earnCategories) => {
  if(!earnCategories[segment.airline]) {
    throw new Error(`No airline configured for ${segment.airline}`)
  }

  for(let rule of earnCategories[segment.airline].fareBuckets.rules) {
    if (!isApplicableRule(segment, rule)) {
      continue
    }

    if (rule.notSupported) {
      throw new Error(rule.notSupported.reason)
    }

    if (!rule.categories[segment.fareClass]) {
      throw new Error(`Airline ${segment.airline} is not configured for fare class ${segment.fareClass}`)
    }

    return rule.categories[segment.fareClass]
  }
}

const isApplicableRule = (segment, rule) => {
  const check = (originAirport, destinationAirport, rule) => {
    if (rule.all) {
      return true
    }

    let originApplies = false
    let destinationApplies = false

    if (rule.origin.country) {
      originApplies = rule.origin.country.has(originAirport.country.toLowerCase())
    }

    if (rule.destination.country) {
      destinationApplies = rule.destination.country.has(destinationAirport.country.toLowerCase())
    }

    if (!destinationApplies && rule.destination.region) {
      for (let region of rule.destination.region) {
        if (isInRegion(destinationAirport.iata.toLowerCase(), region)) {
          destinationApplies = true
          break
        }
      }
    }

    // console.log(originAirport.iata, destinationAirport.iata, originApplies, destinationApplies, rule)

    return originApplies && destinationApplies
  }

  return (
    check(segment.fromAirport, segment.toAirport, rule) ||
    check(segment.toAirport, segment.fromAirport, rule)
  );
}
