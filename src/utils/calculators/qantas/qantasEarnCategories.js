import { buildFareBuckets, buildSimpleFareBuckets, getEarnCategory } from "../earnCategories"

export const QANTAS_FARE_CLASSES = [
  'discountEconomy', 'economy', 'flexibleEconomy',
  'discountPremiumEconomy', 'premiumEconomy', 'flexiblePremiumEconomy',
  'discountBusiness', 'business', 'flexibleBusiness',
  'first'
]

export const getQantasEarnCategory = (segment) => {
  return getEarnCategory(segment, earnCategories)
}

const buildQantasFareBuckets = (domesticQantasString, internationalQantasString) => {
  return {
    rules: [
      // domestic
      {
        origin: { country: new Set(['australia']) },
        destination: { country: new Set(['australia']) },
        categories: buildFareBuckets(domesticQantasString, QANTAS_FARE_CLASSES),
      },
      // international
      {
        all: true,
        categories: buildFareBuckets(internationalQantasString, QANTAS_FARE_CLASSES)
      }
    ]
  }
}

const earnCategories = {
  'qf': {
    // TODO statusMultipliers
    // 'statusMultipliers': {
    //   'bronze': 0,
    //   'silver': 0.50,
    //   'gold': 0.75,
    //   'platinum': 1.00,
    //   'platinum one': 1.00
    // },
    'fareBuckets': buildQantasFareBuckets('EGLMNOQSV	-	BHKY	T	R	W	-	DI	CJ	-', 'ENOQ	GKLMSV	BHY	T	R	W	I	D	CJ	AF', QANTAS_FARE_CLASSES)
  },
}
