import {
  parseEarningRates,
  IntraCountryRule,
  GeographicalRule,
  DistanceRule,
  FareClassRule,
} from '../rules';
import { QANTAS_FARE_CLASSES } from './qantasEarnCategories';

const _base_rule_url =
  'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html';

const _base_fare_category_url =
  'https://www.qantas.com/au/en/frequent-flyer/earn-points/airline-earning-tables/earn-category-tables.html';

export const getQantasRules = () => {
  const standardRules = [
    buildIntraAustraliaRule(),
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
    qf: standardRules,
    '3k': standardRules,
    gk: standardRules,
    jq: [buildIntraNewZealandRule(), ...standardRules],
  };
};

export const getQantasMinimumPoints = () => {
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
    '3k': minPoints,
    gk: minPoints,
    jq: minPoints,
  };
};

const parseQantasEarningRates = (qantasPointsString, qantasCreditsString) => {
  return parseEarningRates(qantasPointsString, qantasCreditsString, QANTAS_FARE_CLASSES);
};

const buildIntraNewZealandRule = () => {
  const ruleConfig = {
    origin: {
      country: new Set(['new zealand']),
    },
    destination: {
      country: {
        'new zealand': parseQantasEarningRates('300^	450^	600^	-	-	-	-	-	-	-', '-	10	20	-	-	-	-	-	-	-'),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#domestic-australia-and-new-zealand';
  return new GeographicalRule('Domestic New Zealand', ruleUrl, ruleConfig);
};

const buildIntraAustraliaRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates(
        '400^    	400^	600^    	600^	900^	1,000^	-	1,400	1,600	1,800',
        '10	10	20	20	20	20	-	40	45	60',
      ),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates(
        '700^	700^	1,100^	1,100^	1,400	1,550	-	2,100	2,350	2,800',
        '15	15	30	30	30	30	-	60	70	90',
      ),
    },
    {
      minDistance: 1501,
      earnings: parseQantasEarningRates(
        '1,450	1,450	2,200	2,200	2,700	2,900	-	3,300	3,600	4,400',
        '20	20	40	40	40	40	-	80	95	120',
      ),
    },
  ];

  const ruleUrl = _base_rule_url + '#domestic-australia-and-new-zealand';
  return new IntraCountryRule('Domestic Australia', ruleUrl, 'Australia', distanceBands);
};

const buildAdlBneGoldCoastSydMelRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['adelaide', 'brisbane', 'coolangatta', 'sydney', 'melbourne']),
    },
    destination: {
      city: {
        delhi: parseQantasEarningRates(
          '3,600	5,400	7,200	7,200	9,000	9,800	10,700	11,600	12,500	14,300',
          '40	50	75	75	80	85	150	155	165	230',
        ),
        bangalore: parseQantasEarningRates(
          '3,600	5,400	7,200	7,200	9,000	9,800	10,700	11,600	12,500	14,300',
          '40	50	75	75	80	85	150	155	165	230',
        ),
        johannesburg: parseQantasEarningRates(
          '3,750	5,625	7,500	7,500	9,375	10,300	11,250	12,200	13,125	15,000',
          '40	55	80	80	85	90	160	165	175	240',
        ),
        santiago: parseQantasEarningRates(
          '3,750	5,625	7,500	7,500	9,375	10,300	11,250	12,200	13,125	15,000',
          '40	55	80	80	85	90	160	165	175	240',
        ),
        dallas: parseQantasEarningRates(
          '4,900	7,350	9,800	9,800	12,250	13,400	14,700	15,950	17,200	19,600',
          '50	70	100	100	105	115	200	210	220	300',
        ),
        dubai: parseQantasEarningRates(
          '4,500	6,750	9,000	9,000	11,250	12,400	13,500	14,625	15,750	18,000',
          '45	60	90	90	100	115	180	190	200	270',
        ),
      },
      country: {
        'new zealand': parseQantasEarningRates(
          '1,000	1,375	1,750	1,750	2,125	2,300	2,500	2,700	2,875	3,250',
          '20	25	40	40	45	50	80	85	90	120',
        ),
        'papua new guinea': parseQantasEarningRates(
          '1,000	1,375	1,750	1,750	2,125	2,300	2,500	2,700	2,875	3,250',
          '20	25	40	40	45	50	80	85	90	120',
        ),
      },
      region: {
        northeastAsia: parseQantasEarningRates(
          '2,600	3,900	5,200	5,200	6,500	7,200	7,800	8,450	9,100	10,400',
          '30	40	60	60	65	70	120	125	135	180',
        ),
        southeastAsia: parseQantasEarningRates(
          '2,600	3,900	5,200	5,200	6,500	7,200	7,800	8,450	9,100	10,400',
          '30	40	60	60	65	70	120	125	135	180',
        ),
        hawaii: parseQantasEarningRates(
          '3,000	4,500	6,000	6,000	7,500	8,250	9,000	9,750	10,500	12,000',
          '35	45	70	70	75	80	140	150	160	210',
        ),
        usaWestCoast: parseQantasEarningRates(
          '4,500	6,750	9,000	9,000	11,250	12,400	13,500	14,625	15,750	18,000',
          '45	60	90	90	100	115	180	190	200	270',
        ),
        usaEastCoast: parseQantasEarningRates(
          '6,200	9,300	12,400	12,400	15,500	17,000	18,600	20,150	21,700	24,800',
          '70	95	140	140	150	160	280	295	310	420',
        ),
        europe: parseQantasEarningRates(
          '6,200	9,300	12,400	12,400	15,500	17,000	18,600	20,150	21,700	24,800',
          '70	95	140	140	150	160	280	295	310	420',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-adl-bne-ool-mel-syd-and-';
  return new GeographicalRule(
    'Adelaide, Brisbane, Gold Coast, Melbourne, Sydney',
    ruleUrl,
    ruleConfig,
  );
};

const buildDarwinPerthRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['darwin', 'perth']),
    },
    destination: {
      city: {
        dubai: parseQantasEarningRates(
          '3,000	4,500	6,000	6,000	7,500	8,250	9,000	9,750	10,500	12,000',
          '35	45	70	70	75	80	140	150	160	210',
        ),
      },
      region: {
        northeastAsia: parseQantasEarningRates(
          '2,500	3,750	5,000	5,000	6,250	6,900	7,500	8,125	8,750	10,000',
          '30	40	60	60	65	70	120	125	135	180',
        ),
        southeastAsia: parseQantasEarningRates(
          '1.450	2,025	2,700	2,700	3,375	3,725	4,050	4,400	4,725	5,400',
          '25	25	50	50	50	50	100	100	100	150',
        ),
        europe: parseQantasEarningRates(
          '4,700	7,050	9,400	9,400	11,750	12,850	14,100	15,300	16,450	18,800',
          '60	80	120	120	130	140	240	255	270	360',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-darwin-perth-and';
  return new GeographicalRule('Darwin, Perth', ruleUrl, ruleConfig);
};

const buildNewZealandRule = () => {
  const ruleConfig = {
    origin: {
      country: new Set(['new zealand']),
    },
    destination: {
      city: {
        dallas: parseQantasEarningRates(
          '4,250	6,375	8,500	8,500	10,625	11,625	12,750	13,835	14,920	17,000',
          '45	60	85	85	90	100	170	180	190	260',
        ),
        santiago: parseQantasEarningRates(
          '2,900	4,350	5,800	5,800	7,250	8,000	8,700	9,450	10,150	11,600',
          '35	45	70	70	70	70	140	150	160	210',
        ),
      },
      region: {
        usaEastCoast: parseQantasEarningRates(
          '5,200	7,925	10,650	10,650	13,375	14,700	16,100	17,450	18,825	21,550',
          '50	70	100	100	105	110	200	210	220	300',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-new-zealand-and';
  return new GeographicalRule('New Zealand', ruleUrl, ruleConfig);
};

const buildDallasRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['dallas']),
    },
    destination: {
      region: {
        usaEastCoast: parseQantasEarningRates(
          '1,300	1,950	2,600	2,600	3,250	3,600	3,900	4,200	4,500	5,200',
          '20	25	40	40	45	50	80	85	90	120',
        ),
        usaWestCoast: parseQantasEarningRates(
          '1,700	2,550	3,400	3,400	4,250	4,600	5,100	5,525	5,950	6,800',
          '25	35	50	50	55	60	100	105	110	150',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-dallas-and';
  return new GeographicalRule('Dallas', ruleUrl, ruleConfig);
};

const buildUsaEastCoastRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['usaEastCoast']),
    },
    destination: {
      region: {
        usaWestCoast: parseQantasEarningRates(
          '1,700	2,550	3,400	3,400	4,250	4,600	5,100	5,525	5,950	6,800',
          '25	35	50	50	55	60	100	105	110	150',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-east-coast-usacanada-and';
  return new GeographicalRule('East Coast USA/Canada', ruleUrl, ruleConfig);
};

const buildDubaiRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['dubai']),
    },
    destination: {
      region: {
        europe: parseQantasEarningRates(
          '1,700	2,550	3,400	3,400	4,250	4,600	5,100	5,525	5,950	6,800',
          '25	35	50	50	55	60	100	105	110	150',
        ),
        northernAfrica: parseQantasEarningRates(
          '1,700	2,550	3,400	3,400	4,250	4,600	5,100	5,525	5,950	6,800',
          '25	35	50	50	55	60	100	105	110	150',
        ),
        southeastAsia: parseQantasEarningRates(
          '1,700	2,550	3,400	3,400	4,250	4,600	5,100	5,525	5,950	6,800',
          '25	35	50	50	55	60	100	105	110	150',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-dubai-and';
  return new GeographicalRule('Dubai', ruleUrl, ruleConfig);
};

const buildEuropeRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['europe']),
    },
    destination: {
      region: {
        northeastAsia: parseQantasEarningRates(
          '3,600	5,400	7,200	7,200	9,000	9,800	10,800	11,700	12,600	14,400',
          '40	55	80	80	85	90	160	165	175	240',
        ),
        southeastAsia: parseQantasEarningRates(
          '3,600	5,400	7,200	7,200	9,000	9,800	10,800	11,700	12,600	14,400',
          '40	55	80	80	85	90	160	165	175	240',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-europe-and';
  return new GeographicalRule('Europe', ruleUrl, ruleConfig);
};

const buildTelAvivRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['tel-aviv']),
    },
    destination: {
      city: {
        'hong kong': parseQantasEarningRates(
          '3,500	5,500	7,500	7,500	9,000	10,000	12,000	13,000	14,000	16,000',
          '30	40	60	60	70	80	120	130	140	180',
        ),
      },
    },
  };

  const ruleUrl = _base_rule_url + '#between-tel-aviv-and';
  return new GeographicalRule('Tel Aviv', ruleUrl, ruleConfig);
};

const buildFallbackRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates(
        '300^	450^	650^	650^	750^	850^	900^	975^	1,050^	1,200^',
        '10	10	20	20	20	20	40	40	40	60',
      ),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates(
        '550^	850	1,100^	1,100^	1,350	1,500	1,650	1,800	1,950	2,200',
        '15	15	30	30	30	30	60	65	70	90',
      ),
    },
    {
      minDistance: 1501,
      maxDistance: 2500,
      earnings: parseQantasEarningRates(
        '1,100	1,650	2,200	2,200	2,750	3,050	3,300	3,575	3,850	4,400',
        '20	25	40	40	40	40	80	85	95	120',
      ),
    },
    {
      minDistance: 2501,
      maxDistance: 3500,
      earnings: parseQantasEarningRates(
        '1,600	2,400	3,200	3,200	4,000	4,400	4,800	5,200	5,600	6,400',
        '25	35	50	50	50	50	100	105	115	150',
      ),
    },
    {
      minDistance: 3501,
      maxDistance: 5000,
      earnings: parseQantasEarningRates(
        '2,450	3,700	4,900	4,900	6,150	6,750	7,350	7,975	8,600	9,800',
        '30	40	60	60	60	60	120	130	140	180',
      ),
    },
    {
      minDistance: 5001,
      maxDistance: 6500,
      earnings: parseQantasEarningRates(
        '2,900	4,350	5,800	5,800	7,250	8,000	8,700	9,425	10,150	11,600',
        '35	45	70	70	70	70	140	150	160	210',
      ),
    },
    {
      minDistance: 6501,
      earnings: parseQantasEarningRates(
        '4,000	6,000	8,000	8,000	10,000	11,000	12,000	13,000	14,000	16,000',
        '40	55	80	80	80	80	160	170	180	240',
      ),
    },
  ];

  const ruleUrl = _base_rule_url + '#all-other-flights';
  return new DistanceRule('All other flights', ruleUrl, distanceBands);
};

const buildNonEarningRule = () => {
  const fareClassEarnings = {
    'n/a': {
      qantasPoints: 0,
      statusCredits: 0,
      calculationNotes: 'Fare class not eligable for earnings',
    },
  };

  const ruleUrl = _base_fare_category_url + '#jetstar';
  return new FareClassRule('Non eligable fare class', ruleUrl, fareClassEarnings);
};
