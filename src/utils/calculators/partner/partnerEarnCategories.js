import { buildFareBuckets, buildSimpleFareBuckets, getEarnCategory } from "../earnCategories"

const _partnerfareClasses = ['discountEconomy', 'economy', 'flexibleEconomy', 'premiumEconomy', 'business', 'first']

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
        categories: buildFareBuckets(qantasString, _partnerfareClasses)
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
        categories: buildFareBuckets(longHaulQantasString, _partnerfareClasses)
      },
      {
        origin: { country: new Set(['malaysia']) },
        destination: {
          country: new Set(['united kingdom']),
          region: new Set(['europe', 'middleEast'])
        },
        categories: buildFareBuckets(longHaulQantasString, _partnerfareClasses)
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, _partnerfareClasses)
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
        categories: buildFareBuckets(longHaulQantasString, _partnerfareClasses)
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, _partnerfareClasses)
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
    'fareBuckets': buildSimpleFareBuckets('NOQ 	GKLMSV	HY	PW 	CDIJR	AF ', _partnerfareClasses)
  },
  'as': {
    'fareBuckets': buildSimpleFareBuckets('GOQX	KLMNSV	BHY	-	CDIJ~	AF', _partnerfareClasses)
  },
  'ba': {
    'fareBuckets': buildSimpleFareBuckets('GKLMNOQSV	-	BEHTWY	-	CDIRJ	AF', _partnerfareClasses)
  },
  'ay': {
    'fareBuckets': buildSimpleFareBuckets('AZ	GLMNOQSV	BHKY	EPTW	CDIJR	-', _partnerfareClasses)
  },
  'ib': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-', _partnerfareClasses)
  },
  'i2': {
    'fareBuckets': buildSimpleFareBuckets('AFGNOQZ	KLMSV	BHY	ETW 	CDIJR	-', _partnerfareClasses)
  },
  'cx': {
    'fareBuckets': buildSimpleFareBuckets('ML	BHK	YE	RW	CDIJP	AF', _partnerfareClasses)
  },
  'qr': {
    'fareBuckets': buildSimpleFareBuckets('KLMV	BH 	Y	-	CDIJP*R	AF', _partnerfareClasses)
  },
  'at': {
    'fareBuckets':buildSimpleFareBuckets('NOQRSTW	HKLMV	BY	-	CDIJ	-', _partnerfareClasses)
  },
  'rj': {
    'fareBuckets': buildSimpleFareBuckets('VSNQOPW	KML	BYH	IZ*	CDJ	-', _partnerfareClasses)
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
