export const getPartnerEarnCategory = (segment) => {
  return partnerEarnCategories[segment.airline].fareBuckets[segment.fareClass]
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
    'fareBuckets': {
      'n': 'discountEconomy',
      'o': 'discountEconomy',
      'q': 'discountEconomy',

      'g': 'economy',
      'k': 'economy',
      'l': 'economy',
      'm': 'economy',
      's': 'economy',
      'v': 'economy',

      'h': 'flexibleEconomy',
      'y': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business',
      'r': 'business'
    }
  },
  'ba': {
    'fareBuckets': {
      'g': 'discountEconomy',
      'k': 'discountEconomy',
      'l': 'discountEconomy',
      'm': 'discountEconomy',
      'n': 'discountEconomy',
      'o': 'discountEconomy',
      'q': 'discountEconomy',
      's': 'discountEconomy',
      'v': 'discountEconomy',

      'b': 'flexibleEconomy',
      'e': 'flexibleEconomy',
      'h': 'flexibleEconomy',
      't': 'flexibleEconomy',
      'w': 'flexibleEconomy',
      'y': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business',
      'r': 'business'
    }
  },
  'ay': {
    'fareBuckets': {
      'a': 'discountEconomy',
      'z': 'discountEconomy',

      'g': 'economy',
      'l': 'economy',
      'm': 'economy',
      'n': 'economy',
      'o': 'economy',
      'q': 'economy',
      's': 'economy',
      'v': 'economy',

      'b': 'flexibleEconomy',
      'h': 'flexibleEconomy',
      'k': 'flexibleEconomy',
      'y': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business',
      'r': 'business'
    }
  },
  'qatar': {
    'fareBuckets': {
      'k': 'discountEconomy',
      'l': 'discountEconomy',
      'm': 'discountEconomy',
      'v': 'discountEconomy',

      'b': 'economy',
      'h': 'economy',

      'y': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business',
      'p': 'business',
      'r': 'business'
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
    'fareBuckets': {
      'm': 'discountEconomy',
      'l': 'discountEconomy',

      'b': 'economy',
      'h': 'economy',
      'k': 'economy',

      'y': 'flexibleEconomy',
      'e': 'flexibleEconomy',

      'c': 'business',
      'd': 'business',
      'i': 'business',
      'j': 'business',
      'p': 'business'
    }
  }
}
