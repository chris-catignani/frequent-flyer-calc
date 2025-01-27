import { JETSTAR_FARE_CLASSES, JETSTAR_NEW_ZEALAND_FARE_CLASSES, QANTAS_DOMESTIC_FARE_CLASSES, QANTAS_INTL_FARE_CLASSES, WEBSITE_EARN_CATEGORIES } from "@/models/constants"
import { buildFareBuckets, getEarnCategory } from "../earnCategories"

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
        origin: { country: new Set(["australia"]) },
        destination: { country: new Set(["australia"]) },
        categories: {
          ...buildFareBuckets(domesticQantasString, QANTAS_FARE_CLASSES),
          ...QANTAS_DOMESTIC_FARE_CLASSES,
        },
      },
      // international
      {
        all: true,
        categories: {
          ...buildFareBuckets(internationalQantasString, QANTAS_FARE_CLASSES),
          ...QANTAS_INTL_FARE_CLASSES,
        },
      },
    ],
  };
}

const buildJetstarFareBuckets = (iata) => {
  const rules = []

  if( iata === 'jq' ) {
    rules.push({
      origin: { country: new Set(["new zealand"]) },
      destination: { country: new Set(["new zealand"]) },
      categories: { ...JETSTAR_NEW_ZEALAND_FARE_CLASSES },
    });
  }

  rules.push({
    all: true,
    categories: { ...JETSTAR_FARE_CLASSES },
  });

  return { rules }
}

const earnCategories = {
  'qf': {
    'fareBuckets': buildQantasFareBuckets(...WEBSITE_EARN_CATEGORIES.qf, QANTAS_FARE_CLASSES)
  },
  'jq': {
    'fareBuckets': buildJetstarFareBuckets('jq'),
  },
  '3k': {
    'fareBuckets': buildJetstarFareBuckets('3k'),
  },
  'gk': {
    'fareBuckets': buildJetstarFareBuckets('gk'),
  }
}
