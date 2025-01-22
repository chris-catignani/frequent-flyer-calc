import { buildFareBuckets, buildSimpleFareBuckets, getEarnCategory } from "../earnCategories"

export const PARTNER_FARE_CLASSES = ['discountEconomy', 'economy', 'flexibleEconomy', 'premiumEconomy', 'business', 'first']

export const getPartnerEarnCategory = (segment) => {
  return getEarnCategory(segment, partnerEarnCategories)
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
        categories: buildFareBuckets(qantasString, PARTNER_FARE_CLASSES)
      }
    ]
  }
}

const buildMalaysiaAirlinesFareBuckets = (longHaulQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['australia', 'new zealand']) },
        destination: {
          country: new Set(['malaysia', 'united kingdom']),
          region: new Set(['europe'])
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES)
      },
      {
        origin: { country: new Set(['malaysia']) },
        destination: {
          country: new Set(['united kingdom']),
          region: new Set(['europe', 'middleEast'])
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES)
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES)
      }
    ]
  }
}

const buildSriLankairlinesFareBuckets = (longHaulQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['sri lanka', 'malaysia']) },
        destination: {
          region: new Set(['europe', 'southeastAustralia'])
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES)
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES)
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
    'fareBuckets': buildSimpleFareBuckets('NOQ 	GKLMSV	HY	PW 	CDIJR	AF ', PARTNER_FARE_CLASSES)
  },
  'as': {
    'fareBuckets': buildSimpleFareBuckets('GOQX	KLMNSV	BHY	-	CDIJ~	AF', PARTNER_FARE_CLASSES)
  },
  'ba': {
    'fareBuckets': buildSimpleFareBuckets('GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF', PARTNER_FARE_CLASSES)
  },
  'ay': {
    'fareBuckets': buildSimpleFareBuckets('AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-', PARTNER_FARE_CLASSES)
  },
  'ib': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-', PARTNER_FARE_CLASSES)
  },
  'i2': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-', PARTNER_FARE_CLASSES)
  },
  'cx': {
    'fareBuckets': buildSimpleFareBuckets('ML	BHK	YE	RW	CDIJP	AF', PARTNER_FARE_CLASSES)
  },
  'qr': {
    'fareBuckets': buildSimpleFareBuckets('KLMV	BH 	Y	-	CDIJP*R	AF', PARTNER_FARE_CLASSES)
  },
  'at': {
    'fareBuckets':buildSimpleFareBuckets('NOQRSTW	HKLMV	BY	-	CDIJ	-', PARTNER_FARE_CLASSES)
  },
  'rj': {
    'fareBuckets': buildSimpleFareBuckets('VSNQOPW	KML	BYH	IZ*	CDJ	-', PARTNER_FARE_CLASSES)
  },
  'jl': {
    'fareBuckets': buildJapanAirlinesFareBuckets('GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF')
  },
  'nu': {
    'fareBuckets': buildJapanAirlinesFareBuckets('GNOQZ^	HKLMSV	BY	EWPR	CDIJX	AF')
  },
  'mh': {
    'fareBuckets':buildMalaysiaAirlinesFareBuckets('BHKLMVY	-	ACDFIJZ~	-	-	-', 'KLMV	BH	IYZ	-	CDJ	AF'),
  },
  'ul': {
    'fareBuckets': buildSriLankairlinesFareBuckets('EGKLMNOQRSW	BHP	Y	-	CDIJ	-', 'GLNOQRSV	EKMW	BHPY	-	CDIJ	-')
  }
}
