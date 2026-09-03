import {
  parseEarningRates,
  DistanceRule,
  GeographicalRule,
  IntraCountryRule,
  Rule,
} from "@/calculators/qantas/rules";
import { PARTNER_FARE_CLASSES } from "@/calculators/qantas/earnCategories/partnerEarnCategories";
import { JAL_AIRLINES, PARTNER_AIRLINES } from "@/calculators/qantas/constants";
import type { Earnings } from "@/models/earnings";

export const getPartnerRules = (): Record<string, Rule[]> => {
  const standardRules = [
    buildSydMelBneGoldCoastRule(),
    buildPerthRule(),
    buildAdelaideRule(),
    buildCairnsRule(),
    buildWesternEuropeRule(),
    buildNorthernEuropeRule(),
    buildSoutheastEuropeRule(),
    buildTelAvivRule(),
    buildDubaiDohaRule(),
    buildUsaShorthaulRule(),
    buildUsaEastCoastUsaWestCoastRule(),
    buildDallasRule(),
    buildNewZealandRule(),
    buildPartnerFallbackRule(),
  ];

  const rules: Record<string, Rule[]> = {};
  for (const airline of PARTNER_AIRLINES) {
    rules[airline] = standardRules;
  }

  for (const jalAirline of JAL_AIRLINES) {
    rules[jalAirline] = [buildJapanAirlinesIntraJapanRule(), ...standardRules];
  }

  return rules;
};

const _base_rule_url =
  "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html";

const parsePartnerEarningRates = (
  airlinePointsString: string,
  qantasCreditsString: string
): Record<string, Earnings> => {
  return parseEarningRates(airlinePointsString, qantasCreditsString, PARTNER_FARE_CLASSES);
};

const buildSydMelBneGoldCoastRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["sydney", "melbourne", "brisbane", "coolangatta"]),
    },
    destination: {
      city: {
        dallas: parsePartnerEarningRates(
          "4,900\t7,350\t9,800\t9,800\t14,700\t19,600",
          "50\t70\t100\t100\t200\t300"
        ),
        santiago: parsePartnerEarningRates(
          "1,750\t3,500\t7,000\t7,700\t8,750\t10,500",
          "30\t30\t60\t60\t120\t180"
        ),
        "hong kong": parsePartnerEarningRates(
          "1,100\t2,250\t4,500\t4,950\t5,600\t6,750",
          "15\t15\t30\t30\t60\t90"
        ),
        doha: parsePartnerEarningRates(
          "1,850\t3,700\t7,400\t7,400\t7,400\t9,250",
          "20\t20\t40\t40\t80\t120"
        ),
        dubai: parsePartnerEarningRates("1,850\t3,700\t7,400\t8,140\t9,250\t11,100", "0 0 0 0 0 0"),
        singapore: parsePartnerEarningRates(
          "1,000\t2,000\t4,000\t4,400\t5,000\t6,000",
          "15\t15\t30\t30\t60\t90"
        ),
      },
      country: {
        malaysia: parsePartnerEarningRates(
          "1,000\t2,000\t4,000\t4,400\t5,000\t6,000",
          "15\t15\t30\t30\t60\t90"
        ),
        thailand: parsePartnerEarningRates(
          "1,100\t2,250\t4,500\t4,950\t5,600\t6,750",
          "15\t15\t30\t30\t60\t90"
        ),
        japan: parsePartnerEarningRates(
          "1,200\t2,400\t4,800\t5,300\t6,000\t7,200",
          "15\t15\t30\t30\t60\t90"
        ),
        china: parsePartnerEarningRates(
          "1,225\t2,450\t4,900\t5,400\t6,125\t7,350",
          "15\t15\t30\t30\t60\t90"
        ),
        "sri lanka": parsePartnerEarningRates(
          "1,100\t2,250\t4,500\t4,950\t5,600\t6,750",
          "15\t15\t30\t30\t60\t90"
        ),
        "new zealand": parsePartnerEarningRates(
          "375\t750\t1,500\t1,650\t1,875\t2,250",
          "10\t10\t20\t20\t40\t60"
        ),
        "papua new guinea": parsePartnerEarningRates(
          "375\t750\t1,500\t1,650\t1,875\t2,250",
          "10\t10\t20\t20\t40\t60"
        ),
        fiji: parsePartnerEarningRates(
          "450\t900\t1,800\t1,980\t2,250\t2,700",
          "10\t10\t20\t20\t40\t60"
        ),
      },
      region: {
        usaEastCoast: parsePartnerEarningRates(
          "6,200\t9,300\t12,400\t12,400\t18,600\t24,800",
          "70\t95\t140\t140\t280\t420"
        ),
        usaWestCoast: parsePartnerEarningRates(
          "4,500\t6,750\t9,000\t9,000\t13,500\t18,000",
          "45\t60\t90\t90\t180\t270"
        ),
        westernEurope: parsePartnerEarningRates(
          "2,625\t5,250\t10,500\t11,500\t13,125\t15,750",
          "35\t35\t70\t70\t140\t210"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-sydney-melbourne-brisbane-gold-coast-and";
  return new GeographicalRule("Sydney, Melbourne, Brisbane, Gold Coast", ruleUrl, ruleConfig);
};

const buildPerthRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["perth"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "950\t1,875\t3,750\t4,125\t4,700\t5,650",
          "30\t30\t60\t60\t120\t180"
        ),
        doha: parsePartnerEarningRates(
          "1,450\t2,900\t5,800\t5,800\t5,800\t7,250",
          "30\t30\t60\t60\t120\t180"
        ),
        dubai: parsePartnerEarningRates("1,400\t2,800\t5,600\t6,160\t7,000\t8,400", "0 0 0 0 0 0"),
        singapore: parsePartnerEarningRates(
          "625\t1,250\t2,500\t2,750\t3,200\t3,750",
          "25\t25\t50\t50\t100\t150"
        ),
      },
      country: {
        malaysia: parsePartnerEarningRates(
          "625\t1,250\t2,500\t2,750\t3,200\t3,750",
          "25\t25\t50\t50\t100\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-perth-and";
  return new GeographicalRule("Perth", ruleUrl, ruleConfig);
};

const buildAdelaideRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["adelaide"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "1,100\t2,150\t4,300\t4,750\t5,400\t6,500",
          "25\t25\t50\t50\t100\t150"
        ),
        doha: parsePartnerEarningRates(
          "1,750\t3,500\t7,000\t7,000\t7,000\t8,750",
          "20\t20\t45\t45\t90\t135"
        ),
        dubai: parsePartnerEarningRates("1,725\t3,450\t6,900\t7,590\t8,625\t10,350", "0 0 0 0 0 0"),
      },
      country: {
        malaysia: parsePartnerEarningRates(
          "850\t1,750\t3,500\t3,800\t4,400\t5,250",
          "25\t25\t50\t50\t100\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-adelaide-and";
  return new GeographicalRule("Adelaide", ruleUrl, ruleConfig);
};

const buildCairnsRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["cairns"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "850\t1,700\t3,400\t3,740\t4,250\t5,100",
          "15\t15\t25\t25\t50\t100"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-cairns-and";
  return new GeographicalRule("Cairns", ruleUrl, ruleConfig);
};

const buildWesternEuropeRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["westernEurope"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "1,475\t2,950\t5,900\t6,500\t7,400\t8,900",
          "30\t30\t60\t60\t120\t180"
        ),
        singapore: parsePartnerEarningRates(
          "1,625\t3,250\t6,500\t7,150\t8,125\t9,750",
          "30\t30\t60\t60\t120\t180"
        ),
        dubai: parsePartnerEarningRates(
          "800\t1,600\t3,200\t3,520\t4,000\t4,800",
          "15\t15\t30\t30\t60\t90"
        ),
        doha: parsePartnerEarningRates(
          "750\t1,500\t3,000\t3,000\t3,000\t3,750",
          "15\t15\t30\t30\t60\t90"
        ),
        muscat: parsePartnerEarningRates(
          "900\t1,800\t3,600\t4,000\t5,000\t6,000",
          "15\t15\t30\t30\t60\t90"
        ),
      },
      country: {
        thailand: parsePartnerEarningRates(
          "1,450\t2,950\t5,900\t6,500\t7,400\t8,900",
          "30\t30\t60\t60\t120\t180"
        ),
        malaysia: parsePartnerEarningRates(
          "1,625\t3,250\t6,500\t7,150\t8,125\t9,750",
          "30\t30\t60\t60\t120\t180"
        ),
        japan: parsePartnerEarningRates(
          "1,475\t2,950\t5,900\t6,500\t7,400\t8,900",
          "30\t30\t60\t60\t120\t180"
        ),
        china: parsePartnerEarningRates(
          "1,375\t2,750\t5,500\t6,050\t6,875\t8,250",
          "30\t30\t60\t90\t120\t180"
        ),
        "sri lanka": parsePartnerEarningRates(
          "1,300\t2,600\t5,200\t5,700\t6,500\t7,800",
          "30\t30\t60\t60\t120\t180"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-western-europe-and";
  return new GeographicalRule("Western Europe", ruleUrl, ruleConfig);
};

const buildNorthernEuropeRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["northernEurope"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "1,225\t2,450\t4,900\t5,400\t6,125\t7,350",
          "30\t30\t60\t60\t120\t180"
        ),
        singapore: parsePartnerEarningRates(
          "1,425\t2,850\t5,700\t6,300\t7,125\t8,550",
          "30\t30\t60\t60\t120\t180"
        ),
        dubai: parsePartnerEarningRates(
          "750\t1,500\t3,000\t3,300\t3,750\t4,500",
          "15\t15\t30\t30\t60\t90"
        ),
        doha: parsePartnerEarningRates(
          "750\t1,500\t3,000\t3,000\t3,000\t3,750",
          "15\t15\t30\t30\t60\t90"
        ),
        muscat: parsePartnerEarningRates(
          "800\t1,600\t3,200\t3,800\t4,500\t5,550",
          "15\t15\t30\t30\t60\t90"
        ),
      },
      country: {
        thailand: parsePartnerEarningRates(
          "1,225\t2,450\t4,900\t5,400\t6,125\t7,350",
          "30\t30\t60\t60\t120\t180"
        ),
        japan: parsePartnerEarningRates(
          "1,225\t2,450\t4,900\t5,400\t6,125\t7,350",
          "30\t30\t60\t60\t120\t180"
        ),
        china: parsePartnerEarningRates(
          "1,050\t2,125\t4,250\t4,675\t5,325\t6,375",
          "30\t30\t60\t60\t120\t180"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-northern-europe-and";
  return new GeographicalRule("Northern Europe", ruleUrl, ruleConfig);
};

const buildSoutheastEuropeRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["southeastEurope"]),
    },
    destination: {
      city: {
        dubai: parsePartnerEarningRates("500\t1,000\t2,000\t2,200\t2,500\t3,000", "0 0 0 0 0 0"),
        doha: parsePartnerEarningRates(
          "450\t900\t1,800\t1,800\t1,800\t2,250",
          "10\t10\t25\t25\t50\t75"
        ),
        muscat: parsePartnerEarningRates(
          "520\t1,030\t2,050\t2,300\t3,000\t3,600",
          "10\t10\t25\t25\t50\t75"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-southeast-europe-and";
  return new GeographicalRule("Southeast Europe", ruleUrl, ruleConfig);
};

const buildTelAvivRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["tel-aviv"]),
    },
    destination: {
      city: {
        "hong kong": parsePartnerEarningRates(
          "1,200\t2,400\t4,800\t5,250\t6,000\t7,200",
          "15\t15\t30\t30\t60\t90"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-tel-aviv-and";
  return new GeographicalRule("Tel Aviv", ruleUrl, ruleConfig);
};

const buildDubaiDohaRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["dubai", "doha", "muscat"]),
    },
    destination: {
      region: {
        southeastAsia: parsePartnerEarningRates(
          "850\t1,700\t3,400\t3,750\t4,250\t5,100",
          "25\t25\t50\t50\t100\t150"
        ),
        northernAfrica: parsePartnerEarningRates(
          "850\t1,700\t3,400\t3,750\t4,250\t5,100",
          "25\t25\t50\t50\t100\t150"
        ),
      },
      country: {
        "new zealand": parsePartnerEarningRates(
          "1,875\t3,750\t7,500\t8,250\t9,400\t11,250",
          "20\t20\t40\t40\t80\t120"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-dubai-doha-muscat-and";
  return new GeographicalRule("Dubai, Doha and Muscat", ruleUrl, ruleConfig);
};

const buildUsaShorthaulRule = (): IntraCountryRule => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 400,
      earnings: parsePartnerEarningRates("100\t125\t250\t300\t400\t500", "10\t10\t20\t20\t40\t60"),
    },
    {
      minDistance: 400,
      maxDistance: 750,
      earnings: parsePartnerEarningRates("150\t300\t600\t660\t750\t900", "10\t10\t20\t20\t40\t60"),
    },
  ];

  const ruleUrl = _base_rule_url + "#intra-usa-short-haul";
  return new IntraCountryRule("Intra-USA Short Haul", ruleUrl, "United States", distanceBands);
};

const buildUsaEastCoastUsaWestCoastRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      region: new Set(["usaEastCoast"]),
    },
    destination: {
      region: {
        usaWestCoast: parsePartnerEarningRates(
          "625\t1,250\t2,500\t2,750\t3,125\t3,750",
          "25\t35\t50\t50\t100\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-east-coast-usa-canada-and";
  return new GeographicalRule("USA East Coast / Canada", ruleUrl, ruleConfig);
};

const buildDallasRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      city: new Set(["dallas"]),
    },
    destination: {
      region: {
        usaNycBos: parsePartnerEarningRates(
          "500\t750\t1,500\t1,650\t1,875\t2,250",
          "20\t25\t40\t40\t80\t120"
        ),
        usaWestCoast: parsePartnerEarningRates(
          "625\t1,250\t2,500\t2,750\t3,125\t3,750",
          "25\t35\t50\t50\t100\t150"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-dallas-and";
  return new GeographicalRule("Dallas", ruleUrl, ruleConfig);
};

const buildNewZealandRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      country: new Set(["new zealand"]),
    },
    destination: {
      city: {
        santiago: parsePartnerEarningRates(
          "1,375\t2,750\t5,500\t6,050\t6,875\t8,250",
          "20\t20\t40\t40\t80\t120"
        ),
        "los angeles": parsePartnerEarningRates(
          "4,000\t6,000\t8,000\t8,250\t12,000\t16,000",
          "40\t55\t80\t80\t160\t240"
        ),
        dallas: parsePartnerEarningRates(
          "4,250\t6,375\t8,500\t8,500\t12,750\t17,000",
          "45\t60\t85\t85\t170\t250"
        ),
      },
      region: {
        usaEastCoast: parsePartnerEarningRates(
          "5,200\t7,925\t10,650\t10,650\t16,100\t21,550",
          "50\t70\t100\t100\t200\t300"
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + "#between-new-zealand-and";
  return new GeographicalRule("New Zealand", ruleUrl, ruleConfig);
};

const buildPartnerFallbackRule = (): DistanceRule => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 100,
      earnings: parsePartnerEarningRates("25\t50\t100\t110\t125\t150", "5\t5\t10\t10\t20\t30"),
    },
    {
      minDistance: 100,
      maxDistance: 250,
      earnings: parsePartnerEarningRates("\t50\t100\t200\t220\t250\t300", "5\t5\t10\t10\t20\t30"),
    },
    {
      minDistance: 250,
      maxDistance: 500,
      earnings: parsePartnerEarningRates("100\t200\t400\t450\t500\t600", "10\t10\t20\t20\t40\t50"),
    },
    {
      minDistance: 500,
      maxDistance: 750,
      earnings: parsePartnerEarningRates("170\t325\t650\t715\t825\t975", "10\t10\t20\t20\t40\t60"),
    },
    {
      minDistance: 750,
      maxDistance: 1500,
      earnings: parsePartnerEarningRates(
        "275\t550\t1,100\t1,210\t1,375\t1,650",
        "15\t15\t30\t30\t60\t90"
      ),
    },
    {
      minDistance: 1500,
      maxDistance: 2500,
      earnings: parsePartnerEarningRates(
        "500\t1,000\t2,000\t2,200\t2,500\t3,000",
        "20\t20\t40\t40\t80\t120"
      ),
    },
    {
      minDistance: 2500,
      maxDistance: 3500,
      earnings: parsePartnerEarningRates(
        "800\t1,600\t3,200\t3,520\t4,000\t4,800",
        "25\t25\t50\t50\t100\t150"
      ),
    },
    {
      minDistance: 3500,
      maxDistance: 5000,
      earnings: parsePartnerEarningRates(
        "1,050\t2,100\t4,200\t4,600\t5,250\t6,300",
        "30\t30\t60\t60\t120\t180"
      ),
    },
    {
      minDistance: 5000,
      maxDistance: 6500,
      earnings: parsePartnerEarningRates(
        "1,425\t2,850\t5,700\t6,300\t7,125\t8,600",
        "35\t35\t70\t70\t140\t210"
      ),
    },
    {
      minDistance: 6500,
      earnings: parsePartnerEarningRates(
        "1,875\t3,750\t7,500\t8,250\t9,400\t11,250",
        "40\t40\t80\t80\t160\t240"
      ),
    },
  ];

  const ruleUrl = _base_rule_url + "#all-other-flights";
  return new DistanceRule("All other flights", ruleUrl, distanceBands);
};

const buildJapanAirlinesIntraJapanRule = (): GeographicalRule => {
  const ruleConfig = {
    origin: {
      country: new Set(["japan"]),
    },
    destination: {
      country: {
        japan: parsePartnerEarningRates("0 0 0 0 0 0", "0 0 0 0 0 0"),
      },
    },
  };

  const ruleUrl =
    "https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html#japan-airlines";
  return new GeographicalRule("Domestic Japan", ruleUrl, ruleConfig);
};
