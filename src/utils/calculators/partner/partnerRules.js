import { parseEarningRates, DistanceRule, GeographicalRule, IntraCountryRule } from "../rules"
import { PARTNER_FARE_CLASSES } from "./partnerEarnCategories"

export const getPartnerRules = () => {
  return [
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
    buildPartnerFallbackRule()
  ]
}

const _base_rule_url = 'https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/partner-airline-earning-tables.html'

const parsePartnerEarningRates = (qantasPointsString, qantasCreditsString) => {
  return parseEarningRates(qantasPointsString, qantasCreditsString, PARTNER_FARE_CLASSES)
}

const buildSydMelBneGoldCoastRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['sydney', 'melbourne', 'brisbane', 'coolangatta'])
    },
    destination: {
      city: {
        dallas: parsePartnerEarningRates('4,900	7,350	9,800	9,800	14,700	19,600', '50	70	100	100	200	300'),
        santiago: parsePartnerEarningRates('1,750	3,500	7,000	7,700	8,750	10,500', '30	30	60	60	120	180'),
        'hong kong': parsePartnerEarningRates('1,100	2,250	4,500	4,950	5,600	6,750', '15	15	30	30	60	90'),
        'doha': parsePartnerEarningRates('1,850	3,700	7,400	7,400	7,400	9,250', '20	20	40	40	80	120'),
        'dubai': parsePartnerEarningRates('1,850	3,700	7,400	8,140	9,250	11,100', '0 0 0 0 0 0'),
        'singapore': parsePartnerEarningRates('1,000	2,000	4,000	4,400	5,000	6,000', '15	15	30	30	60	90')
      },
      country: {
        malaysia: parsePartnerEarningRates('1,000	2,000	4,000	4,400	5,000	6,000', '15	15	30	30	60	90'),
        thailand: parsePartnerEarningRates('1,100	2,250	4,500	4,950	5,600	6,750', '15	15	30	30	60	90'),
        japan: parsePartnerEarningRates('1,200	2,400	4,800	5,300	6,000	7,200', '15	15	30	30	60	90'),
        china: parsePartnerEarningRates('1,225	2,450	4,900	5,400	6,125	7,350', '15	15	30	30	60	90'),
        'sri lanka': parsePartnerEarningRates('1,100	2,250	4,500	4,950	5,600	6,750', '15	15	30	30	60	90'),
        'new zealand': parsePartnerEarningRates('375	750	1,500	1,650	1,875	2,250', '10	10	20	20	40	60'),
        'papua new guinea': parsePartnerEarningRates('375	750	1,500	1,650	1,875	2,250', '10	10	20	20	40	60'),
        fiji: parsePartnerEarningRates('450	900	1,800	1,980	2,250	2,700', '10	10	20	20	40	60')
      },
      region: {
        usaEastCoast: parsePartnerEarningRates('6,200	9,300	12,400	12,400	18,600	24,800', '70	95	140	140	280	420'),
        usaWestCoast: parsePartnerEarningRates('4,500	6,750	9,000	9,000	13,500	18,000', '45	60	90	90	180	270'),
        westernEurope: parsePartnerEarningRates('2,625	5,250	10,500	11,500	13,125	15,750', '35	35	70	70	140	210')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-syd-mel-bne-ool-and-'
  return new GeographicalRule('Sydney, Melbourne, Brisbane, Gold Coast', ruleUrl, ruleConfig)
}

const buildPerthRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['perth'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('950	1,875	3,750	4,125	4,700	5,650', '30	30	60	60	120	180'),
        'doha': parsePartnerEarningRates('1,450	2,900	5,800	5,800	5,800	7,250', '30	30	60	60	120	180'),
        'dubai': parsePartnerEarningRates('1,400	2,800	5,600	6,160	7,000	8,400', '0 0 0 0 0 0'),
        'singapore': parsePartnerEarningRates('625	1,250	2,500	2,750	3,200	3,750', '25	25	50	50	100	150')
      },
      country: {
        malaysia: parsePartnerEarningRates('625	1,250	2,500	2,750	3,200	3,750', '25	25	50	50	100	150')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-perth-and-'
  return new GeographicalRule('Perth', ruleUrl, ruleConfig)
}

const buildAdelaideRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['adelaide'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('1,100	2,150	4,300	4,750	5,400	6,500', '25	25	50	50	100	150'),
        'doha': parsePartnerEarningRates('1,750	3,500	7,000	7,000	7,000	8,750', '20	20	45	45	90	135'),
        'dubai': parsePartnerEarningRates('1,725	3,450	6,900	7,590	8,625	10,350', '0 0 0 0 0 0')
      },
      country: {
        malaysia: parsePartnerEarningRates('850	1,750	3,500	3,800	4,400	5,250', '25	25	50	50	100	150')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-adelaide-and-'
  return new GeographicalRule('Adelaide', ruleUrl, ruleConfig)
}


const buildCairnsRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['cairns'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('850	1,700	3,400	3,740	4,250	5,100', '15	15	25	25	50	100')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-cairns-and-'
  return new GeographicalRule('Cairns', ruleUrl, ruleConfig)
}

const buildWesternEuropeRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['westernEurope'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('1,475	2,950	5,900	6,500	7,400	8,900', '30	30	60	60	120	180'),
        singapore: parsePartnerEarningRates('1,625	3,250	6,500	7,150	8,125	9,750', '30	30	60	60	120	180'),
        dubai: parsePartnerEarningRates('800	1,600	3,200	3,520	4,000	4,800', '15	15	30	30	60	90'),
        doha: parsePartnerEarningRates('750	1,500	3,000	3,000	3,000	3,750', '15	15	30	30	60	90')
      },
      country: {
        thailand: parsePartnerEarningRates('1,450	2,950	5,900	6,500	7,400	8,900', '30	30	60	60	120	180'),
        malaysia: parsePartnerEarningRates('1,625	3,250	6,500	7,150	8,125	9,750', '30	30	60	60	120	180'),
        japan: parsePartnerEarningRates('1,475	2,950	5,900	6,500	7,400	8,900', '30	30	60	60	120	180'),
        china: parsePartnerEarningRates('1,375	2,750	5,500	6,050	6,875	8,250', '30	30	60	90	120	180'),
        'sri lanka': parsePartnerEarningRates('1,300	2,600	5,200	5,700	6,500	7,800', '30	30	60	60	120	180')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-western-europe-and-'
  return new GeographicalRule('Western Europe', ruleUrl, ruleConfig)
}

const buildNorthernEuropeRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['northernEurope'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('1,225	2,450	4,900	5,400	6,125	7,350', '30	30	60	60	120	180'),
        singapore: parsePartnerEarningRates('1,425	2,850	5,700	6,300	7,125	8,550', '30	30	60	60	120	180'),
        dubai: parsePartnerEarningRates('750	1,500	3,000	3,300	3,750	4,500', '15	15	30	30	60	90'),
        doha: parsePartnerEarningRates('750	1,500	3,000	3,000	3,000	3,750', '15	15	30	30	60	90')
      },
      country: {
        thailand: parsePartnerEarningRates('1,225	2,450	4,900	5,400	6,125	7,350', '30	30	60	60	120	180'),
        japan: parsePartnerEarningRates('1,225	2,450	4,900	5,400	6,125	7,350', '30	30	60	60	120	180'),
        china: parsePartnerEarningRates('1,050	2,125	4,250	4,675	5,325	6,375', '30	30	60	60	120	180')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-northern-europe-and-'
  return new GeographicalRule('Northern Europe', ruleUrl, ruleConfig)
}

const buildSoutheastEuropeRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['southeastEurope'])
    },
    destination: {
      city: {
        dubai: parsePartnerEarningRates('500	1,000	2,000	2,200	2,500	3,000', '0 0 0 0 0 0'),
        doha: parsePartnerEarningRates('450	900	1,800	1,800	1,800	2,250', '10	10	25	25	50	75')
      },
    }
  }

  const ruleUrl = _base_rule_url + '#between-southeast-europe-and-'
  return new GeographicalRule('Southeast Europe', ruleUrl, ruleConfig)
}

const buildTelAvivRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['tel-aviv'])
    },
    destination: {
      city: {
        'hong kong': parsePartnerEarningRates('1,200	2,400	4,800	5,250	6,000	7,200', '15	15	30	30	60	90')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-tel-aviv-and'
  return new GeographicalRule('Tel Aviv', ruleUrl, ruleConfig)
}

const buildDubaiDohaRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['dubai', 'doha'])
    },
    destination: {
      region: {
        southeastAsia: parsePartnerEarningRates('850	1,700	3,400	3,750	4,250	5,100', '25	25	50	50	100	150'),
        northernAfrica: parsePartnerEarningRates('850	1,700	3,400	3,750	4,250	5,100', '25	25	50	50	100	150')
      },
      country: {
        'new zealand': parsePartnerEarningRates('1,875	3,750	7,500	8,250	9,400	11,250', '20	20	40	40	80	120')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-dubai-doha-and-'
  return new GeographicalRule('Dubai and Doha', ruleUrl, ruleConfig)
}

const buildUsaShorthaulRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 400,
      earnings: parsePartnerEarningRates('100	125	250	300	400	500', '10	10	20	20	40	60'),
    },
    {
      minDistance: 400,
      maxDistance: 750,
      earnings: parsePartnerEarningRates('150	300	600	660	750	900', '10	10	20	20	40	60')
    },
  ]

  const ruleUrl = _base_rule_url + '#intra-usa-short-haul'
  return new IntraCountryRule('Intra-USA Short Haul', ruleUrl, 'United States', distanceBands)
}

const buildUsaEastCoastUsaWestCoastRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['usaEastCoast'])
    },
    destination: {
      region: {
        usaWestCoast: parsePartnerEarningRates('625	1,250	2,500	2,750	3,125	3,750', '25	35	50	50	100	150')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-east-coast-usa-canada-and-'
  return new GeographicalRule('USA East Coast / Canada', ruleUrl, ruleConfig)
}

const buildDallasRule = () => {
  const ruleConfig = {
    origin: {
      city: new Set(['dallas'])
    },
    destination: {
      region: {
        usaNycBos: parsePartnerEarningRates('500	750	1,500	1,650	1,875	2,250', '20	25	40	40	80	120'),
        usaWestCoast: parsePartnerEarningRates('625	1,250	2,500	2,750	3,125	3,750', '25	35	50	50	100	150')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-dallas-and-'
  return new GeographicalRule('Dallas', ruleUrl, ruleConfig)
}

const buildNewZealandRule = () => {
  const ruleConfig = {
    origin: {
      country: new Set(['new zealand'])
    },
    destination: {
      city: {
        'santiago': parsePartnerEarningRates('1,375	2,750	5,500	6,050	6,875	8,250', '20	20	40	40	80	120'),
        'los angeles': parsePartnerEarningRates('4,000	6,000	8,000	8,250	12,000	16,000', '40	55	80	80	160	240'),
        'dallas': parsePartnerEarningRates('4,250	6,375	8,500	8,500	12,750	17,000', '45	60	85	85	170	250'),
      },
      region: {
        usaEastCoast: parsePartnerEarningRates('5,200	7,925	10,650	10,650	16,100	21,550', '50	70	100	100	200	300')
      }
    }
  }

  const ruleUrl = _base_rule_url + '#between-new-zealand-and-'
  return new GeographicalRule('New Zealand', ruleUrl, ruleConfig)
}

const buildPartnerFallbackRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 100,
      earnings: parsePartnerEarningRates('25	50	100	110	125	150', '5	5	10	10	20	30')
    },
    {
      minDistance: 100,
      maxDistance: 250,
      earnings: parsePartnerEarningRates('	50	100	200	220	250	300', '5	5	10	10	20	30')
    },
    {
      minDistance: 250,
      maxDistance: 500,
      earnings: parsePartnerEarningRates('100	200	400	450	500	600', '10	10	20	20	40	50')
    },
    {
      minDistance: 500,
      maxDistance: 750,
      earnings: parsePartnerEarningRates('170	325	650	715	825	975', '10	10	20	20	40	60')
    },
    {
      minDistance: 750,
      maxDistance: 1500,
      earnings: parsePartnerEarningRates('275	550	1,100	1,210	1,375	1,650', '15	15	30	30	60	90')
    },
    {
      minDistance: 1500,
      maxDistance: 2500,
      earnings: parsePartnerEarningRates('500	1,000	2,000	2,200	2,500	3,000', '20	20	40	40	80	120')
    },
    {
      minDistance: 2500,
      maxDistance: 3500,
      earnings: parsePartnerEarningRates('800	1,600	3,200	3,520	4,000	4,800', '25	25	50	50	100	150')
    },
    {
      minDistance: 3500,
      maxDistance: 5000,
      earnings:parsePartnerEarningRates('1,050	2,100	4,200	4,600	5,250	6,300', '30	30	60	60	120	180')
    },
    {
      minDistance: 5000,
      maxDistance: 6500,
      earnings: parsePartnerEarningRates('1,425	2,850	5,700	6,300	7,125	8,600', '35	35	70	70	140	210')
    },
    {
      minDistance: 6500,
      earnings: parsePartnerEarningRates('1,875	3,750	7,500	8,250	9,400	11,250', '40	40	80	80	160	240')
    }
  ]

  const ruleUrl = _base_rule_url + '#all-other-flights'
  return new DistanceRule('All other flights', ruleUrl, distanceBands)
}
