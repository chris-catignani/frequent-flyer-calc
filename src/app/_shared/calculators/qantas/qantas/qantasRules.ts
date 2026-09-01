import {
  parseEarningRates,
  IntraCountryRule,
  GeographicalRule,
  DistanceRule,
  FareClassRule,
  Rule,
} from "@/app/_shared/calculators/qantas/rules";
import { QANTAS_FARE_CLASSES } from "@/app/_shared/calculators/qantas/qantas/qantasEarnCategories";
import { Earnings } from "@/app/_shared/models/earnings";

const _base_rule_url =
  "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html";

const _base_fare_category_url =
  "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html";

export const getQantasRules = (): Record<string, Rule[]> => {
  const standardRules = [
    buildAdlBneGoldCoastSydMelRule(),
    buildDarwinPerthRule(),
    buildNewZealandRule(),
    buildDallasRule(),
    buildUsaEastCoastRule(),
    buildDubaiRule(),
    buildEuropeRule(),
    buildTelAvivRule(),
    buildFallbackRule(),
    buildNonEarningRule(),
  ];

  return {
    qf: [buildQantasIntraAustraliaRule(), ...standardRules],
    gk: [buildJetstarIntraAustraliaRule(), ...standardRules],
    jq: [buildJetstarIntraNewZealandRule(), buildJetstarIntraAustraliaRule(), ...standardRules],
  };
};

export const getQantasMinimumPoints = (): Record<string, Record<string, number>> => {
  const minPoints = {
    discountEconomy: 800,
    economy: 800,
    flexibleEconomy: 1200,
    discountPremiumEconomy: 1200,
    premiumEconomy: 1200,
    flexiblePremiumEconomy: 1200,
    discountBusiness: 1400,
    business: 1400,
    flexibleBusiness: 1400,
    first: 1400,
  };

  return {
    qf: minPoints,
    gk: minPoints,
    jq: minPoints,
  };
};

const parseQantasEarningRates = (
  airlinePointsString: string,
  qantasCreditsString: string
): Record<string, Earnings> => {
  return parseEarningRates(airlinePointsString, qantasCreditsString, QANTAS_FARE_CLASSES);
};

const buildJetstarIntraNewZealandRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      country: new Set(["new zealand"]),
    },
    destination: {
      country: {
        "new zealand": parseQantasEarningRates(
          "300^\t450^\t600^\t-\t-\t-\t-\t-\t-\t-",
          "-\t10\t20\t-\t-\t-\t-\t-\t-\t-"
        ),
      },
    },
  };

  // Jetstar Domestic New Zealand has its own (lower) minimum points guarantee
  // than the general Qantas/Jetstar table returned by getQantasMinimumPoints().
  const minPoints = {
    discountEconomy: 400,
    economy: 800,
    flexibleEconomy: 1200,
  };

  const ruleUrl = _base_rule_url + "#domestic-australia-and-new-zealand";
  return new GeographicalRule("Domestic New Zealand", ruleUrl, ruleConfig, minPoints);
};

const buildJetstarIntraAustraliaRule = (): IntraCountryRule => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates(
        "400^    \t400^\t600^    \t600^\t900^\t1,000^\t-\t1,400\t1,600\t1,800",
        "10\t10\t20\t20\t20\t20\t-\t40\t45\t60"
      ),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates(
        "700^\t700^\t1,100^\t1,100^\t1,400\t1,550\t-\t2,100\t2,350\t2,800",
        "15\t15\t30\t30\t30\t30\t-\t60\t70\t90"
      ),
    },
    {
      minDistance: 1501,
      earnings: parseQantasEarningRates(
        "1,450\t1,450\t2,200\t2,200\t2,700\t2,900\t-\t3,300\t3,600\t4,400",
        "20\t20\t40\t40\t40\t40\t-\t80\t95\t120"
      ),
    },
  ];

  const ruleUrl = _base_rule_url + "#domestic-australia-and-new-zealand";
  return new IntraCountryRule("Jetstar Domestic Australia", ruleUrl, "Australia", distanceBands);
};

const buildQantasIntraAustraliaRule = (): IntraCountryRule => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates(
        "500\t500\t750\t750\t1,125\t1,250\t-\t1,750\t2,000\t2,250",
        "10\t10\t20\t20\t20\t20\t-\t40\t45\t60"
      ),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates(
        "875\t875\t1,375\t1,375\t1,750\t1,940\t-\t2,625\t2,940\t3,500",
        "15\t15\t30\t30\t30\t30\t-\t60\t70\t90"
      ),
    },
    {
      minDistance: 1501,
      earnings: parseQantasEarningRates(
        "1,815\t1,815\t2,750\t2,750\t3,375\t3,625\t-\t4,125\t4,500\t5,500",
        "20\t20\t40\t40\t40\t40\t-\t80\t95\t120"
      ),
    },
  ];

  const ruleUrl = _base_rule_url + "#domestic-australia-and-new-zealand";
  return new IntraCountryRule("Qantas Domestic Australia", ruleUrl, "Australia", distanceBands);
};

const buildAdlBneGoldCoastSydMelRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["adelaide", "brisbane", "coolangatta", "sydney", "melbourne"]),
    },
    destination: {
      city: {
        delhi: parseQantasEarningRates(
          "3,600\t5,400\t7,200\t7,200\t9,000\t9,800\t10,700\t11,600\t12,500\t14,300",
          "40\t50\t75\t75\t80\t85\t150\t155\t165\t230"
        ),
        bangalore: parseQantasEarningRates(
          "3,600\t5,400\t7,200\t7,200\t9,000\t9,800\t10,700\t11,600\t12,500\t14,300",
          "40\t50\t75\t75\t80\t85\t150\t155\t165\t230"
        ),
        johannesburg: parseQantasEarningRates(
          "3,750\t5,625\t7,500\t7,500\t9,375\t10,300\t11,250\t12,200\t13,125\t15,000",
          "40\t55\t80\t80\t85\t90\t160\t165\t175\t240"
        ),
        santiago: parseQantasEarningRates(
          "3,750\t5,625\t7,500\t7,500\t9,375\t10,300\t11,250\t12,200\t13,125\t15,000",
          "40\t55\t80\t80\t85\t90\t160\t165\t175\t240"
        ),
        dallas: parseQantasEarningRates(
          "4,900\t7,350\t9,800\t9,800\t12,250\t13,400\t14,700\t15,950\t17,200\t19,600",
          "50\t70\t100\t100\t105\t115\t200\t210\t220\t300"
        ),
        dubai: parseQantasEarningRates(
          "4,500\t6,750\t9,000\t9,000\t11,250\t12,400\t13,500\t14,625\t15,750\t18,000",
          "45\t60\t90\t90\t100\t115\t180\t190\t200\t270"
        ),
      },
      country: {
        "new zealand": parseQantasEarningRates(
          "1,000\t1,375\t1,750\t1,750\t2,125\t2,300\t2,500\t2,700\t2,875\t3,250",
          "20\t25\t40\t40\t45\t50\t80\t85\t90\t120"
        ),
        "papua new guinea": parseQantasEarningRates(
          "1,000\t1,375\t1,750\t1,750\t2,125\t2,300\t2,500\t2,700\t2,875\t3,250",
          "20\t25\t40\t40\t45\t50\t80\t85\t90\t120"
        ),
      },
      region: {
        northeastAsia: parseQantasEarningRates(
          "2,600\t3,900\t5,200\t5,200\t6,500\t7,200\t7,800\t8,450\t9,100\t10,400",
          "30\t40\t60\t60\t65\t70\t120\t125\t135\t180"
        ),
        southeastAsia: parseQantasEarningRates(
          "2,600\t3,900\t5,200\t5,200\t6,500\t7,200\t7,800\t8,450\t9,100\t10,400",
          "30\t40\t60\t60\t65\t70\t120\t125\t135\t180"
        ),
        hawaii: parseQantasEarningRates(
          "3,000\t4,500\t6,000\t6,000\t7,500\t8,250\t9,000\t9,750\t10,500\t12,000",
          "35\t45\t70\t70\t75\t80\t140\t150\t160\t210"
        ),
        usaWestCoast: parseQantasEarningRates(
          "4,500\t6,750\t9,000\t9,000\t11,250\t12,400\t13,500\t14,625\t15,750\t18,000",
          "45\t60\t90\t90\t100\t115\t180\t190\t200\t270"
        ),
        usaEastCoast: parseQantasEarningRates(
          "6,200\t9,300\t12,400\t12,400\t15,500\t17,000\t18,600\t20,150\t21,700\t24,800",
          "70\t95\t140\t140\t150\t165\t280\t295\t310\t420"
        ),
        europe: parseQantasEarningRates(
          "6,200\t9,300\t12,400\t12,400\t15,500\t17,000\t18,600\t20,150\t21,700\t24,800",
          "70\t95\t140\t140\t150\t165\t280\t295\t310\t420"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-adl-bne-ool-mel-syd-and-";
  return new GeographicalRule(
    "Adelaide, Brisbane, Gold Coast, Melbourne, Sydney",
    ruleUrl,
    ruleConfig
  );
};

const buildDarwinPerthRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["darwin", "perth"]),
    },
    destination: {
      city: {
        dubai: parseQantasEarningRates(
          "3,000\t4,500\t6,000\t6,000\t7,500\t8,250\t9,000\t9,750\t10,500\t12,000",
          "35\t45\t70\t70\t75\t80\t140\t150\t160\t210"
        ),
        johannesburg: parseQantasEarningRates(
          "3,000\t4,500\t6,000\t6,000\t7,500\t8,250\t9,000\t9,750\t10,500\t12,000",
          "35\t45\t70\t70\t70\t80\t140\t150\t160\t210"
        ),
      },
      region: {
        northeastAsia: parseQantasEarningRates(
          "2,500\t3,750\t5,000\t5,000\t6,250\t6,900\t7,500\t8,125\t8,750\t10,000",
          "30\t40\t60\t60\t65\t70\t120\t125\t135\t180"
        ),
        southeastAsia: parseQantasEarningRates(
          "1.450\t2,025\t2,700\t2,700\t3,375\t3,725\t4,050\t4,400\t4,725\t5,400",
          "25\t25\t50\t50\t50\t50\t100\t100\t100\t150"
        ),
        europe: parseQantasEarningRates(
          "4,700\t7,050\t9,400\t9,400\t11,750\t12,850\t14,100\t15,300\t16,450\t18,800",
          "60\t80\t120\t120\t130\t140\t240\t255\t270\t360"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-darwin-perth-and";
  return new GeographicalRule("Darwin, Perth", ruleUrl, ruleConfig);
};

const buildNewZealandRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      country: new Set(["new zealand"]),
    },
    destination: {
      city: {
        dallas: parseQantasEarningRates(
          "4,250\t6,375\t8,500\t8,500\t10,625\t11,625\t12,750\t13,835\t14,920\t17,000",
          "45\t60\t85\t85\t90\t100\t170\t180\t190\t260"
        ),
        santiago: parseQantasEarningRates(
          "2,900\t4,350\t5,800\t5,800\t7,250\t8,000\t8,700\t9,450\t10,150\t11,600",
          "35\t45\t70\t70\t70\t70\t140\t150\t160\t210"
        ),
      },
      region: {
        usaEastCoast: parseQantasEarningRates(
          "5,200\t7,925\t10,650\t10,650\t13,375\t14,700\t16,100\t17,450\t18,825\t21,550",
          "50\t70\t100\t100\t105\t110\t200\t210\t220\t300"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-new-zealand-and";
  return new GeographicalRule("New Zealand", ruleUrl, ruleConfig);
};

const buildDallasRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["dallas"]),
    },
    destination: {
      region: {
        usaEastCoast: parseQantasEarningRates(
          "1,300\t1,950\t2,600\t2,600\t3,250\t3,600\t3,900\t4,200\t4,500\t5,200",
          "20\t25\t40\t40\t45\t50\t80\t85\t90\t120"
        ),
        usaWestCoast: parseQantasEarningRates(
          "1,700\t2,550\t3,400\t3,400\t4,250\t4,600\t5,100\t5,525\t5,950\t6,800",
          "25\t35\t50\t50\t55\t60\t100\t105\t110\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-dallas-and";
  return new GeographicalRule("Dallas", ruleUrl, ruleConfig);
};

const buildUsaEastCoastRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["usaEastCoast"]),
    },
    destination: {
      region: {
        usaWestCoast: parseQantasEarningRates(
          "1,700\t2,550\t3,400\t3,400\t4,250\t4,600\t5,100\t5,525\t5,950\t6,800",
          "25\t35\t50\t50\t55\t60\t100\t105\t110\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-east-coast-usacanada-and";
  return new GeographicalRule("East Coast USA/Canada", ruleUrl, ruleConfig);
};

const buildDubaiRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["dubai"]),
    },
    destination: {
      region: {
        europe: parseQantasEarningRates(
          "1,700\t2,550\t3,400\t3,400\t4,250\t4,600\t5,100\t5,525\t5,950\t6,800",
          "25\t35\t50\t50\t55\t60\t100\t105\t110\t150"
        ),
        northernAfrica: parseQantasEarningRates(
          "1,700\t2,550\t3,400\t3,400\t4,250\t4,600\t5,100\t5,525\t5,950\t6,800",
          "25\t35\t50\t50\t55\t60\t100\t105\t110\t150"
        ),
        southeastAsia: parseQantasEarningRates(
          "1,700\t2,550\t3,400\t3,400\t4,250\t4,600\t5,100\t5,525\t5,950\t6,800",
          "25\t35\t50\t50\t55\t60\t100\t105\t110\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-dubai-and";
  return new GeographicalRule("Dubai", ruleUrl, ruleConfig);
};

const buildEuropeRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["europe"]),
    },
    destination: {
      region: {
        northeastAsia: parseQantasEarningRates(
          "3,600\t5,400\t7,200\t7,200\t9,000\t9,800\t10,800\t11,700\t12,600\t14,400",
          "40\t55\t80\t80\t85\t90\t160\t165\t175\t240"
        ),
        southeastAsia: parseQantasEarningRates(
          "3,600\t5,400\t7,200\t7,200\t9,000\t9,800\t10,800\t11,700\t12,600\t14,400",
          "40\t55\t80\t80\t85\t90\t160\t165\t175\t240"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-europe-and";
  return new GeographicalRule("Europe", ruleUrl, ruleConfig);
};

const buildTelAvivRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["tel-aviv"]),
    },
    destination: {
      city: {
        "hong kong": parseQantasEarningRates(
          "3,500\t5,500\t7,500\t7,500\t9,000\t10,000\t12,000\t13,000\t14,000\t16,000",
          "30\t40\t60\t60\t70\t80\t120\t130\t140\t180"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-tel-aviv-and";
  return new GeographicalRule("Tel Aviv", ruleUrl, ruleConfig);
};

const buildFallbackRule = (): DistanceRule => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates(
        "300^\t450^\t650^\t650^\t750^\t850^\t900^\t975^\t1,050^\t1,200^",
        "10\t10\t20\t20\t20\t20\t40\t40\t40\t60"
      ),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates(
        "550^\t850\t1,100^\t1,100^\t1,350\t1,500\t1,650\t1,800\t1,950\t2,200",
        "15\t15\t30\t30\t30\t30\t60\t65\t70\t90"
      ),
    },
    {
      minDistance: 1501,
      maxDistance: 2500,
      earnings: parseQantasEarningRates(
        "1,100\t1,650\t2,200\t2,200\t2,750\t3,050\t3,300\t3,575\t3,850\t4,400",
        "20\t25\t40\t40\t40\t40\t80\t85\t95\t120"
      ),
    },
    {
      minDistance: 2501,
      maxDistance: 3500,
      earnings: parseQantasEarningRates(
        "1,600\t2,400\t3,200\t3,200\t4,000\t4,400\t4,800\t5,200\t5,600\t6,400",
        "25\t35\t50\t50\t50\t50\t100\t105\t115\t150"
      ),
    },
    {
      minDistance: 3501,
      maxDistance: 5000,
      earnings: parseQantasEarningRates(
        "2,450\t3,700\t4,900\t4,900\t6,150\t6,750\t7,350\t7,975\t8,600\t9,800",
        "30\t40\t60\t60\t60\t60\t120\t130\t140\t180"
      ),
    },
    {
      minDistance: 5001,
      maxDistance: 6500,
      earnings: parseQantasEarningRates(
        "2,900\t4,350\t5,800\t5,800\t7,250\t8,000\t8,700\t9,425\t10,150\t11,600",
        "35\t45\t70\t70\t70\t70\t140\t150\t160\t210"
      ),
    },
    {
      minDistance: 6501,
      earnings: parseQantasEarningRates(
        "4,000\t6,000\t8,000\t8,000\t10,000\t11,000\t12,000\t13,000\t14,000\t16,000",
        "40\t55\t80\t80\t80\t80\t160\t170\t180\t240"
      ),
    },
  ];

  const ruleUrl = _base_rule_url + "#all-other-flights";
  return new DistanceRule("All other flights", ruleUrl, distanceBands);
};

const buildNonEarningRule = (): FareClassRule => {
  const fareClassEarnings = {
    "n/a": {
      airlinePoints: 0,
      elitePoints: 0,
      calculationNotes: "Fare class not eligable for earnings",
    },
  };

  const ruleUrl = _base_fare_category_url + "#jetstar";
  return new FareClassRule("Non eligable fare class", ruleUrl, fareClassEarnings);
};
