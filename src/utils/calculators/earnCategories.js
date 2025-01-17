export const getPartnerEarnCategory = (segment) => {
  return partnerEarnCategories[segment.airline].fareBuckets[segment.fareClass]
}

/**
 * Taking the copy/paste fare buckets from the Qantas website and parse them.
 */
const buildFareBuckets = (qantasString) => {
  // remove all '*', replace whitespace with single space, split on that single space
  const fareBuckets = qantasString.trim().replace(/\*/gm, '').replace(/\s+/gm, ' ').toLowerCase().split(' ')
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

const partnerEarnCategories = {
  'aa': {
    'statusMultipliers': {
      'bronze': 0,
      'silver': 0.50,
      'gold': 0.75,
      'platinum': 1.00,
      'platinum one': 1.00
    },
    'fareBuckets': buildFareBuckets('NOQ 	GKLMSV	HY	PW 	CDIJR	AF '),
  },
  'ba': {
    'fareBuckets': buildFareBuckets('GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF')
  },
  'ay': {
    'fareBuckets': buildFareBuckets('AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-')
  },
  'qr': {
    'fareBuckets': buildFareBuckets('KLMV	BH 	Y	-	CDIJP*R	AF')
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
  'cx': {
    'fareBuckets': buildFareBuckets('ML	BHK	YE	RW	CDIJP	AF')
  }
}
