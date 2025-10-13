import {
  JAL_DOMESTIC_FARE_CLASSES,
  WEBSITE_EARN_CATEGORIES,
} from '@/app/_shared/models/qantasConstants';
import { buildFareBuckets, buildSimpleFareBuckets, getEarnCategory } from '../earnCategories';

export const PARTNER_FARE_CLASSES = [
  'discountEconomy',
  'economy',
  'flexibleEconomy',
  'premiumEconomy',
  'business',
  'first',
];

export const getPartnerEarnCategory = (segment) => {
  return getEarnCategory(segment, partnerEarnCategories);
};

export const qualifiesForElitePoints = (segment) => {
  return partnerEarnCategories[segment.airline].earnsElitePoints;
};

const buildJapanAirlinesFareBuckets = (qantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['japan']) },
        destination: { country: new Set(['japan']) },
        categories: { ...JAL_DOMESTIC_FARE_CLASSES },
      },
      {
        all: true,
        categories: buildFareBuckets(qantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const buildMalaysiaAirlinesFareBuckets = (longHaulQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['australia', 'new zealand']) },
        destination: {
          country: new Set(['malaysia', 'united kingdom']),
          region: new Set(['europe']),
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES),
      },
      {
        origin: { country: new Set(['malaysia']) },
        destination: {
          country: new Set(['united kingdom']),
          region: new Set(['europe', 'middleEast']),
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES),
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const buildSriLankairlinesFareBuckets = (longHaulQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['sri lanka', 'malaysia']) },
        destination: {
          region: new Set(['europe', 'southeastAustralia']),
        },
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES),
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const buildAirFranceKLMFareBuckets = (
  domesticQantasString,
  shortHaulQantasString,
  longHaulQantasString,
) => {
  return {
    rules: [
      {
        origin: { country: new Set(['france']) },
        destination: { country: new Set(['france']) },
        categories: buildFareBuckets(domesticQantasString, PARTNER_FARE_CLASSES),
      },
      {
        origin: { region: new Set(['europe']) },
        destination: {
          country: new Set([
            'algeria',
            'armenia',
            'bulgaria',
            'croatia',
            'georgia',
            'hungary',
            'morocco',
            'poland',
            'romania',
            'russia',
            'serbia',
            'slovenia',
            'tunisia',
          ]),
          region: new Set(['europe']),
        },
        categories: buildFareBuckets(shortHaulQantasString, PARTNER_FARE_CLASSES),
      },
      {
        all: true,
        categories: buildFareBuckets(longHaulQantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const buildChinaEasternFareBuckets = (domesticQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['china']) },
        destination: { country: new Set(['china']) },
        categories: buildFareBuckets(domesticQantasString, PARTNER_FARE_CLASSES),
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const buildFijiAirwaysFareBuckets = (domesticQantasString, allOtherQantasString) => {
  return {
    rules: [
      {
        origin: { country: new Set(['fiji']) },
        destination: { country: new Set(['fiji']) },
        categories: buildFareBuckets(domesticQantasString, PARTNER_FARE_CLASSES),
      },
      {
        all: true,
        categories: buildFareBuckets(allOtherQantasString, PARTNER_FARE_CLASSES),
      },
    ],
  };
};

const partnerEarnCategories = {
  aa: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.aa, PARTNER_FARE_CLASSES),
  },
  as: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.as, PARTNER_FARE_CLASSES),
  },
  ba: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ba, PARTNER_FARE_CLASSES),
  },
  fj: {
    earnsElitePoints: true,
    fareBuckets: buildFijiAirwaysFareBuckets(
      WEBSITE_EARN_CATEGORIES.fj[0],
      WEBSITE_EARN_CATEGORIES.fj[1],
    ),
  },
  ay: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ay, PARTNER_FARE_CLASSES),
  },
  ib: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ib, PARTNER_FARE_CLASSES),
  },
  i2: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ib, PARTNER_FARE_CLASSES),
  },
  cx: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.cx, PARTNER_FARE_CLASSES),
  },
  wy: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.wy, PARTNER_FARE_CLASSES),
  },
  qr: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.qr, PARTNER_FARE_CLASSES),
  },
  at: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.at, PARTNER_FARE_CLASSES),
  },
  rj: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.rj, PARTNER_FARE_CLASSES),
  },
  jl: {
    earnsElitePoints: true,
    fareBuckets: buildJapanAirlinesFareBuckets(WEBSITE_EARN_CATEGORIES.jl),
  },
  nu: {
    earnsElitePoints: true,
    fareBuckets: buildJapanAirlinesFareBuckets(WEBSITE_EARN_CATEGORIES.jl),
  },
  mh: {
    earnsElitePoints: true,
    fareBuckets: buildMalaysiaAirlinesFareBuckets(
      WEBSITE_EARN_CATEGORIES.mh[0],
      WEBSITE_EARN_CATEGORIES.mh[1],
    ),
  },
  ul: {
    earnsElitePoints: true,
    fareBuckets: buildSriLankairlinesFareBuckets(
      WEBSITE_EARN_CATEGORIES.ul[0],
      WEBSITE_EARN_CATEGORIES.ul[1],
    ),
  },

  af: {
    earnsElitePoints: false,
    fareBuckets: buildAirFranceKLMFareBuckets(
      WEBSITE_EARN_CATEGORIES.af[0],
      WEBSITE_EARN_CATEGORIES.af[1],
      WEBSITE_EARN_CATEGORIES.af[2],
    ),
  },
  mu: {
    earnsElitePoints: false,
    fareBuckets: buildChinaEasternFareBuckets(
      WEBSITE_EARN_CATEGORIES.mu[0],
      WEBSITE_EARN_CATEGORIES.mu[1],
    ),
  },
  ly: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ly, PARTNER_FARE_CLASSES),
  },
  ek: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ek, PARTNER_FARE_CLASSES),
  },
  kl: {
    earnsElitePoints: false,
    fareBuckets: buildAirFranceKLMFareBuckets(
      WEBSITE_EARN_CATEGORIES.kl[0],
      WEBSITE_EARN_CATEGORIES.kl[1],
      WEBSITE_EARN_CATEGORIES.kl[2],
    ),
  },
  la: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  jj: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  lu: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  lp: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  xl: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  '4c': {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.la, PARTNER_FARE_CLASSES),
  },
  ws: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ws, PARTNER_FARE_CLASSES),
  },
};
