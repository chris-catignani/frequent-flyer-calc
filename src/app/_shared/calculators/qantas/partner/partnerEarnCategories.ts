import {
  JAL_DOMESTIC_FARE_CLASSES,
  WEBSITE_EARN_CATEGORIES,
} from '@/app/_shared/models/qantasConstants';
import { LATAM_AIRLINES } from '@/app/_shared/models/constants';
import {
  buildFareBuckets,
  buildSimpleFareBuckets,
  getEarnCategory,
  type EarnCategoryConfig,
  type FareBucketRule,
} from '@/app/_shared/calculators/qantas/earnCategories';
import type { Segment } from '@/app/_shared/models/segment';

export const PARTNER_FARE_CLASSES: string[] = [
  'discountEconomy',
  'economy',
  'flexibleEconomy',
  'premiumEconomy',
  'business',
  'first',
];

export interface PartnerEarnCategoryConfig extends EarnCategoryConfig {
  earnsElitePoints: boolean;
}

export type PartnerEarnCategoryMap = Record<string, PartnerEarnCategoryConfig>;

export const getPartnerEarnCategory = (segment: Segment): string => {
  return getEarnCategory(segment, partnerEarnCategories);
};

export const qualifiesForElitePoints = (segment: Segment): boolean => {
  return Boolean(partnerEarnCategories[segment.airline]?.earnsElitePoints);
};

const buildJapanAirlinesFareBuckets = (qantasString: string): { rules: FareBucketRule[] } => {
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

const buildMalaysiaAirlinesFareBuckets = (
  longHaulQantasString: string,
  allOtherQantasString: string,
): { rules: FareBucketRule[] } => {
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

const buildSriLankairlinesFareBuckets = (
  longHaulQantasString: string,
  allOtherQantasString: string,
): { rules: FareBucketRule[] } => {
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
  domesticQantasString: string,
  shortHaulQantasString: string,
  longHaulQantasString: string,
): { rules: FareBucketRule[] } => {
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

const buildChinaEasternFareBuckets = (
  domesticQantasString: string,
  allOtherQantasString: string,
): { rules: FareBucketRule[] } => {
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

const buildFijiAirwaysFareBuckets = (
  domesticQantasString: string,
  allOtherQantasString: string,
): { rules: FareBucketRule[] } => {
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

const fjCategories = WEBSITE_EARN_CATEGORIES.fj as string[];
const mhCategories = WEBSITE_EARN_CATEGORIES.mh as string[];
const ulCategories = WEBSITE_EARN_CATEGORIES.ul as string[];
const afCategories = WEBSITE_EARN_CATEGORIES.af as string[];
const muCategories = WEBSITE_EARN_CATEGORIES.mu as string[];
const klCategories = WEBSITE_EARN_CATEGORIES.kl as string[];

const partnerEarnCategories: PartnerEarnCategoryMap = {
  aa: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.aa as string, PARTNER_FARE_CLASSES),
  },
  as: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.as as string, PARTNER_FARE_CLASSES),
  },
  ba: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ba as string, PARTNER_FARE_CLASSES),
  },
  fj: {
    earnsElitePoints: true,
    fareBuckets: buildFijiAirwaysFareBuckets(fjCategories[0], fjCategories[1]),
  },
  ay: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ay as string, PARTNER_FARE_CLASSES),
  },
  ib: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ib as string, PARTNER_FARE_CLASSES),
  },
  i2: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ib as string, PARTNER_FARE_CLASSES),
  },
  cx: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.cx as string, PARTNER_FARE_CLASSES),
  },
  wy: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.wy as string, PARTNER_FARE_CLASSES),
  },
  qr: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.qr as string, PARTNER_FARE_CLASSES),
  },
  at: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.at as string, PARTNER_FARE_CLASSES),
  },
  rj: {
    earnsElitePoints: true,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.rj as string, PARTNER_FARE_CLASSES),
  },
  jl: {
    earnsElitePoints: true,
    fareBuckets: buildJapanAirlinesFareBuckets(WEBSITE_EARN_CATEGORIES.jl as string),
  },
  nu: {
    earnsElitePoints: true,
    fareBuckets: buildJapanAirlinesFareBuckets(WEBSITE_EARN_CATEGORIES.jl as string),
  },
  mh: {
    earnsElitePoints: true,
    fareBuckets: buildMalaysiaAirlinesFareBuckets(mhCategories[0], mhCategories[1]),
  },
  ul: {
    earnsElitePoints: true,
    fareBuckets: buildSriLankairlinesFareBuckets(ulCategories[0], ulCategories[1]),
  },

  af: {
    earnsElitePoints: false,
    fareBuckets: buildAirFranceKLMFareBuckets(afCategories[0], afCategories[1], afCategories[2]),
  },
  mu: {
    earnsElitePoints: false,
    fareBuckets: buildChinaEasternFareBuckets(muCategories[0], muCategories[1]),
  },
  ly: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ly as string, PARTNER_FARE_CLASSES),
  },
  ek: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ek as string, PARTNER_FARE_CLASSES),
  },
  kl: {
    earnsElitePoints: false,
    fareBuckets: buildAirFranceKLMFareBuckets(klCategories[0], klCategories[1], klCategories[2]),
  },
  ...Object.fromEntries(
    Object.keys(LATAM_AIRLINES).map((code) => [
      code,
      {
        earnsElitePoints: false,
        fareBuckets: buildSimpleFareBuckets(
          WEBSITE_EARN_CATEGORIES.la as string,
          PARTNER_FARE_CLASSES,
        ),
      },
    ]),
  ),
  ws: {
    earnsElitePoints: false,
    fareBuckets: buildSimpleFareBuckets(WEBSITE_EARN_CATEGORIES.ws as string, PARTNER_FARE_CLASSES),
  },
};
