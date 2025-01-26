import { WEBSITE_EARN_CATEGORIES } from "@/models/constants"
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
  aa: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.aa,
      PARTNER_FARE_CLASSES
    ),
  },
  as: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.as,
      PARTNER_FARE_CLASSES
    ),
  },
  ba: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.ba,
      PARTNER_FARE_CLASSES
    ),
  },
  ay: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.ay,
      PARTNER_FARE_CLASSES
    ),
  },
  ib: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.ib,
      PARTNER_FARE_CLASSES
    ),
  },
  i2: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.i2,
      PARTNER_FARE_CLASSES
    ),
  },
  cx: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.cx,
      PARTNER_FARE_CLASSES
    ),
  },
  qr: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.qr,
      PARTNER_FARE_CLASSES
    ),
  },
  at: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.at,
      PARTNER_FARE_CLASSES
    ),
  },
  rj: {
    fareBuckets: buildSimpleFareBuckets(
      WEBSITE_EARN_CATEGORIES.rj,
      PARTNER_FARE_CLASSES
    ),
  },
  jl: {
    fareBuckets: buildJapanAirlinesFareBuckets(
      WEBSITE_EARN_CATEGORIES.jl
    ),
  },
  nu: {
    fareBuckets: buildJapanAirlinesFareBuckets(
      WEBSITE_EARN_CATEGORIES.nu
    ),
  },
  mh: {
    fareBuckets: buildMalaysiaAirlinesFareBuckets(
      ...WEBSITE_EARN_CATEGORIES.mh
    ),
  },
  ul: {
    fareBuckets: buildSriLankairlinesFareBuckets(
      ...WEBSITE_EARN_CATEGORIES.ul
    ),
  },
};
