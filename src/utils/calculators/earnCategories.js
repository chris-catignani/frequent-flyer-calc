import { getAirport } from "../airports"

export const getPartnerEarnCategory = (segment) => {
  for(let rule of partnerEarnCategories[segment.airline].fareBuckets.rules) {
    if (!isApplicableRule(segment, rule)) {
      continue
    }

    if (rule.notSupported) {
      throw new Error(rule.notSupported.reason)
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

    return originApplies && destinationApplies
  }

  const originAirport = getAirport(segment.fromAirport)
  const destinationAirport = getAirport(segment.toAirport)
  return check(originAirport, destinationAirport, rule) || check(destinationAirport, originAirport, rule)
}

/**
 * Taking the copy/paste fare buckets from the Qantas website and parse them.
 */
const buildFareBuckets = (qantasString) => {
  // remove all '*', replace whitespace with single space, split on that single space
  const fareBuckets = qantasString.trim().replace(/\*\~\^/gm, '').replace(/\s+/gm, ' ').toLowerCase().split(' ')
  const fareClasses = ['discountEconomy', 'economy', 'flexibleEconomy', 'premiumEconomy', 'business', 'first']
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

const buildSimpleFareBuckets = (qantasString) => {
  return {
    rules: [
      {
        all: true,
        categories: buildFareBuckets(qantasString)
      }
    ]
  }
}

const buildJapanAirlinesFareBuckets = (qantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['japan']) },
        destination: { country: new Set(['japan']) },
        notSupported: {
          reason: 'Intra Japan flights on JAL are not yet supported'
        }
      },
      {
        all: true,
        categoreis: buildFareBuckets(qantasString)
      }
    ]
  }
}

const partnerEarnCategories = {
  'aa': {
    'statusMultipliers': {
      'bronze': 0,
      'silver': 0.50,
      'gold': 0.75,
      'platinum': 1.00,
      'platinum one': 1.00
    },
    'fareBuckets': buildSimpleFareBuckets('NOQ 	GKLMSV	HY	PW 	CDIJR	AF ')
  },
  'as': {
    'fareBuckets': buildSimpleFareBuckets('GOQX	KLMNSV	BHY	-	CDIJ~	AF')
  },
  'ba': {
    'fareBuckets': buildSimpleFareBuckets('GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF')
  },
  'ay': {
    'fareBuckets': buildSimpleFareBuckets('AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-')
  },
  'ib': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-')
  },
  'i2': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-')
  },
  'cx': {
    'fareBuckets': buildSimpleFareBuckets('ML	BHK	YE	RW	CDIJP	AF')
  },
  'qr': {
    'fareBuckets': buildSimpleFareBuckets('KLMV	BH 	Y	-	CDIJP*R	AF')
  },
  'at': {
    'fareBuckets':buildSimpleFareBuckets('NOQRSTW	HKLMV	BY	-	CDIJ	-')
  },
  'rj': {
    'fareBuckets': buildSimpleFareBuckets('VSNQOPW	KML	BYH	IZ*	CDJ	-')
  },
  'jl': {
    'fareBuckets': buildJapanAirlinesFareBuckets('GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF')
  },
  'nu': {
    'fareBuckets': buildJapanAirlinesFareBuckets('GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF')
  },
  'mh': { // TODO additional rules apply for malaysia
    'fareBuckets': {
      'k': 'discountEconomy',
      'l': 'discountEconomy',
      'm': 'discountEconomy',
      'v': 'discountEconomy',

      'b': 'economy',
      'h': 'economy',

      'i': 'flexibleEconomy',
      'y': 'flexibleEconomy',
      'z': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'j': 'business'
    }
  },
  'ul': { // TODO additional rules apply for sri lanka
    'fareBuckets': {
      'g': 'discountEconomy',
      'l': 'discountEconomy',
      'n': 'discountEconomy',
      'o': 'discountEconomy',
      'q': 'discountEconomy',
      'r': 'discountEconomy',
      's': 'discountEconomy',
      'v': 'discountEconomy',

      'e': 'economy',
      'k': 'economy',
      'm': 'economy',
      'w': 'economy',

      'b': 'flexibleEconomy',
      'h': 'flexibleEconomy',
      'p': 'flexibleEconomy',
      'y': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business'
    }
  }
}
