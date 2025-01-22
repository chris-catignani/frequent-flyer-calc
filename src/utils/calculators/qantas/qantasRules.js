import { parseEarningRates, IntraCountryRule } from "../rules"
import { QANTAS_FARE_CLASSES } from "./qantasEarnCategories"

const _base_rule_url = 'https://www.qantas.com/es/en/frequent-flyer/earn-points/airline-earning-tables/qantas-and-jetstar-earning-tables.html'

export const getQantasRules = () => {
  return [
    buildIntraAustraliaRule(),
  ]
}

const parseQantasEarningRates = (qantasPointsString, qantasCreditsString) => {
  return parseEarningRates(qantasPointsString, qantasCreditsString, QANTAS_FARE_CLASSES)
}

const buildIntraAustraliaRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 750,
      earnings: parseQantasEarningRates('400^    	400^	600^    	600^	900^	1,000^	-	1,400	1,600	1,800', '10	10	20	20	20	20	-	40	45	60'),
    },
    {
      minDistance: 751,
      maxDistance: 1500,
      earnings: parseQantasEarningRates('700^	700^	1,100^	1,100^	1,400	1,550	-	2,100	2,350	2,800', '15	15	30	30	30	30	-	60	70	90')
    },
    {
      minDistance: 1501,
      maxDistance: 99999999,
      earnings: parseQantasEarningRates('1,450	1,450	2,200	2,200	2,700	2,900	-	3,300	3,600	4,400', '20	20	40	40	40	40	-	80	95	120')
    },
  ]

  const ruleUrl = _base_rule_url + '#domestic-australia-and-new-zealand'
  return new IntraCountryRule('Domestic Australia', ruleUrl, 'Australia', distanceBands)
}
