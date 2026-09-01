import { AirlineMap, LATAM_AIRLINES, ONEWORLD_AIRLINES } from "@/app/_shared/models/constants";

export const JETSTAR_AIRLINES: Set<string> = new Set(["jq", "gk"]);

export const QANTAS_GRP_AIRLINES: AirlineMap = {
  qf: "Qantas",
  jq: "Jetstar Airlines",
  gk: "Jetstar Japan",
};

export const JAL_AIRLINES: Set<string> = new Set(["jl", "nu"]);

export const PARTNER_ONEWORLD_AIRLINES: string[] = Object.keys(ONEWORLD_AIRLINES).filter(
  (iata) => iata !== "qf"
);

export const PARTNER_NON_ONEWORLD_AIRLINES: string[] = [
  "af",
  "mu",
  "ly",
  "ek",
  "kl",
  "ws",
  ...Object.keys(LATAM_AIRLINES),
];

export const PARTNER_AIRLINES: string[] = [
  ...PARTNER_ONEWORLD_AIRLINES,
  ...PARTNER_NON_ONEWORLD_AIRLINES,
];

export const WEBSITE_EARN_CATEGORIES: Record<string, string | string[]> = {
  as: "GOQX\tKLMNSV\tBHY\t-\tCDIJ~\tAF",
  aa: "NOQ \tGKLMSV\tHY\tPW \tCDIJR\tAF ",
  ba: "GKLMNOQSV\t-\tBEHTWY\t-\tCDIRJ\tAF",
  cx: "ML\tBHK\tYE\tRW\tCDIJP\tAF",
  fj: ["-\t-\tHLQY\t-\t-\t-", "GNTV\tKLMOQSW\tBHY\t-\tCDIJZ\t-"],
  ay: "A\tGLNOQSVZ\tBHKYM\tEPTW\tCDIJR\t-",
  ib: "AFGNOQZ\tKLMSV\tBHY\tETW \tCDIJR\t-",
  jl: "GNOQZ^\tHKLMSV\tBY\tEWPR\tCDIJX\tAF",
  mh: ["KLMV\tYBH\tZ~ - AFCDJ -", "KLMV\tYBH\tZ^ - CDJ AF"],
  wy: "NQORTE MLVS YBHK - JCDIP FA*",
  qr: "KLMV\tBH \tY\t-\tCDIJP*R\tAF",
  at: "NOQRSTW\tHKLMV\tBY\t-\tCDIJ\t-",
  rj: "VSNQOPW\tKML\tBYH\tIZ*\tCDJ\t-",
  ul: ["EGKLMNOQRSW\tBHP\tY\t-\tCDIJ\t-", "GLNOQRSV\tEKMW\tBHPY\t-\tCDIJ\t-"],

  qf: ["EGLMNOQSV\t-\tBHKY\tT\tR\tW\t-\tDI\tCJ\t-", "ENOQ\tGKLMSV\tBHY\tT\tR\tW\tI\tD\tCJ\tAF"],

  af: [
    "EGLNRTVX*\tFHKQPU\tABDJMSWY\t-\t-\t-",
    "EGLNRTVX*\tAFHKQPSUW\tBMY\t-\tCDIJO*Z\t-",
    "EGLNRTVX*\tHKQU\tBMY\tASW\tCDIJO*Z\tFP",
  ],
  mu: ["TVZH\tEKLNRS\tBMPW*Y\t-\tCDIJQ\tFU^", "TVZ\tEKLNRS\tHBMPW*Y\t-\tCDIJQ\tFU^"],
  ly: "-\tGHKLMNOSUV\tY\tBPQW\tCDIJZ \tAF ",
  ek: "LQTV\tBKMRUX\tEP^WY\t-\tCH#IJO\tAF",
  kl: [
    "EGLNRTVX*\tFHKQPU\tABDJMSWY\t-\t-\t-",
    "EGLNRTVX*\tAFHKQPSUW\tBMY\t-\tCDIJO*Z\t-",
    "EGLNRTVX*\tHKQU\tBMY\tWSA\tCDIJO*Z\t-",
  ],
  la: "AGNOQ\tLMSVX\tBHKY\tPW\tCDIJZ\t-",
  ws: "KTX\tSNQ\tHMBY\tROW\t-\t-",
};

export const EARN_CATEGORY_URLS: Record<string, string> = {
  as: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#alaska-airlines",
  aa: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#american-airlines",
  ba: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#british-airways",
  cx: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#cathay-pacific",
  fj: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#fiji-airways",
  ay: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#finnair",
  ib: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#iberia",
  i2: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#iberia",
  jl: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#japan-airlines",
  nu: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#japan-airlines",
  mh: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#malaysia-airlines",
  wy: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#oman-air",
  qr: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#qatar-airways",
  at: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#royal-air-maroc",
  rj: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#royal-jordanian",
  ul: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#srilankan-airlines",

  qf: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#qantas",
  jq: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#jetstar",
  gk: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#jetstar",

  af: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#air-france",
  mu: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#china-eastern",
  ly: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#el-al",
  ek: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#emirates",
  kl: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#klm",
  la: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  jj: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  lu: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  lp: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  xl: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  "4c": "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#latam",
  ws: "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#westjet",
};

export const QANTAS_DOMESTIC_FARE_CLASSES: Record<string, string> = {
  RedeDeal: "discountEconomy",
  Flex: "flexibleEconomy",
  DiscountPremiumEconomy: "discountPremiumEconomy",
  PremiumEconomySaver: "premiumEconomy",
  PremiumEconomyFlex: "flexiblePremiumEconomy",
  BusinessSale: "business",
  BusinessSaver: "business",
  Business: "flexibleBusiness",
};

export const QANTAS_INTL_FARE_CLASSES: Record<string, string> = {
  EconomySale: "discountEconomy",
  EconomySaver: "economy",
  EconomyFlex: "flexibleEconomy",
  PremiumEconomySale: "discountPremiumEconomy",
  PremiumEconomySaver: "premiumEconomy",
  PremiumEconomyFlex: "flexiblePremiumEconomy",
  BusinessSale: "discountBusiness",
  BusinessSaver: "business",
  BusinessFlex: "flexibleBusiness",
  FirstSale: "first",
  FirstSaver: "first",
  FirstFlex: "first",
};

export const QANTAS_FARE_CLASS_DISPLAY: Record<string, string> = {
  RedeDeal: "Red e-Deal",
  Flex: "Flex",
  DiscountPremiumEconomy: "Discount Premium Economy",
  PremiumEconomySaver: "Premium Economy Saver",
  PremiumEconomyFlex: "Premium Economy Flex",
  BusinessSale: "Business Sale",
  BusinessSaver: "Business Saver",
  Business: "Business",
  EconomySale: "Economy Sale",
  EconomySaver: "Economy Saver",
  EconomyFlex: "Economy Flex",
  PremiumEconomySale: "Discount Premium Economy",
  BusinessFlex: "Business Flex",
  FirstSale: "First Sale",
  FirstSaver: "First Saver",
  FirstFlex: "First Flex",
};

export const JETSTAR_NEW_ZEALAND_FARE_CLASSES: Record<string, string> = {
  Starter: "discountEconomy",
  StarterFlexBiz: "discountEconomy",
  Flex: "economy",
  FlexPlus: "economy",
  StarterPlus: "economy",
  StarterMax: "flexibleEconomy",
};

export const JETSTAR_DOMESTIC_FARE_CLASSES: Record<string, string> = {
  Starter: "n/a",
  StarterPlus: "n/a",
  Buisness: "n/a",
  More: "n/a",
  Flex: "economy",
  FlexPlus: "economy",
  StarterMax: "flexibleEconomy",
  BusinessMax: "business",
};

export const JETSTAR_INTL_FARE_CLASSES: Record<string, string> = {
  ...JETSTAR_DOMESTIC_FARE_CLASSES,
  More: "economy",
};

export const JETSTAR_FARE_CLASS_DISPLAY: Record<string, string> = {
  Starter: "Starter",
  StarterFlexBiz: "Starter FlexBiz Fare",
  More: "More",
  Flex: "Flex",
  FlexPlus: "Flex Plus",
  StarterPlus: "Starter Plus",
  StarterMax: "Starter Max",
  Business: "Business",
  BusinessMax: "Business Max",
};

// https://www.jetstar.com/_/media/files/agenthub/gds-guide.pdf
export const JETSTAR_LETTER_FARE_CLASSES: Record<string, string> = {
  c: "Starter",

  h: "Starter", // +bag

  k: "StarterPlus",
  l: "StarterPlus",
  m: "StarterPlus",
  n: "StarterPlus",
  o: "StarterPlus",

  q: "StarterMax",
  r: "StarterMax",
  s: "StarterMax",
  t: "StarterMax",
  v: "StarterMax",
  y: "StarterMax",

  j: "BusinessMax",
};

export const JAL_DOMESTIC_FARE_CLASSES: Record<string, string> = {
  DiscountEconomy: "economy",
  DiscountEconomyplusPremiumSurcharge: "economy",
  Economy: "flexibleEconomy",
  DiscountEconomyplusFirstSurcharge: "flexibleEconomy",
  EconomyplusPremiumSurcharge: "premiumEconomy",
  EconomyplusFirstSurcharge: "first",
};

export const JAL_DOMESTIC_FARE_CLASS_DISPLAY: Record<string, string> = {
  DiscountEconomy: "Discount Economy",
  DiscountEconomyplusPremiumSurcharge: "Discount Economy plus Premium Surcharge",
  Economy: "Economy",
  DiscountEconomyplusFirstSurcharge: "Discount Economy plus First Surcharge",
  EconomyplusPremiumSurcharge: "Economy plus Premium Surcharge",
  EconomyplusFirstSurcharge: "Economy plus First Surcharge",
};

export const EARN_CATEGORY_DISPLAY: Record<string, string> = {
  discountEconomy: "Discount Economy",
  economy: "Economy",
  flexibleEconomy: "Flexible Economy",
  discountPremiumEconomy: "Discount Premium Economy",
  premiumEconomy: "Premium Economy",
  flexiblePremiumEconomy: "Flexible Premium Economy",
  discountBusiness: "Discount Business",
  business: "Business",
  flexibleBusiness: "Flexible Business",
  first: "First",

  "n/a": "n/a",
};

export const REGION_DISPLAY: Record<string, string> = {
  southeastAsia: "Southeast Asia",
  northeastAsia: "Northeast Asia",
  southeastEurope: "Southeast Europe",
  northernEurope: "Northern Europe",
  westernEurope: "Western Europe",
  northernAfrica: "Northern Africa",
  usaEastCoast: "East Coast USA/Canada",
  usaWestCoast: "West Coast USA/Canada",
  usaNycBos: "New York and Boston USA",
  middleEast: "Middle East",
  southeastAustralia: "Southeast Australia",
  hawaii: "Hawaii USA",
  europe: "Europe",
};
