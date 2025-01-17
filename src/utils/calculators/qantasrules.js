import { QantasEarnings } from "@/models/qantasEarnings"
import { DistanceRule, GeographicalRule, IntraUsaRule } from "./rules"

const buildEarningRates = (qantasPointsString, qantasCreditsString) => {
  const pointsPerFareclass = qantasPointsString.trim().replace(/\,/gm, '').replace(/\s+/gm, ' ').split(' ')
  const creditsPerFareclass = qantasCreditsString.trim().replace(/\s+/gm, ' ').split(' ')
  const fareClasses = ['discountEconomy', 'economy', 'flexibleEconomy', 'premiumEconomy', 'business', 'first']
  const retval = {}

  fareClasses.forEach((fareClass, index) => {
    retval[fareClass] = new QantasEarnings(
      parseInt(pointsPerFareclass[index]),
      parseInt(creditsPerFareclass[index])
    )
  })

  return retval
}

export const buildUsaShorthaulRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 400,
      earnings: buildEarningRates('100	125	250	300	400	500', '10	10	20	20	40	60'),
    },
    {
      minDistance: 400,
      maxDistance: 750,
      earnings: buildEarningRates('150	300	600	660	750	900', '10	10	20	20	40	60')
    },
  ]

  return new IntraUsaRule('Intra-USA Short Haul', distanceBands)
}

export const buildUsaEastCoastUsaWestCoastRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['usaEastCoast'])
    },
    destination: {
      region: {
        usaWestCoast: buildEarningRates('625	1,250	2,500	2,750	3,125	3,750', '25	35	50	50	100	150')
      }
    }
  }

  return new GeographicalRule('USA East Coast / Canada', ruleConfig)
}

export const buildDallasRule = () => {
  const ruleConfig = {
    origin: {
      cities: new Set(['dfw'])
    },
    destination: {
      region: {
        usaNycBos: buildEarningRates('500	750	1,500	1,650	1,875	2,250', '20	25	40	40	80	120'),
        usaWestCoast: buildEarningRates('625	1,250	2,500	2,750	3,125	3,750', '25	35	50	50	100	150')
      }
    }
  }

  return new GeographicalRule('Dallas', ruleConfig)
}

export const buildPartnerFallbackRule = () => {
  const distanceBands = [
    {
      minDistance: 0,
      maxDistance: 100,
      earnings: buildEarningRates('25	50	100	110	125	150', '5	5	10	10	20	30')
    },
    {
      minDistance: 100,
      maxDistance: 250,
      earnings: buildEarningRates('	50	100	200	220	250	300', '5	5	10	10	20	30')
    },
    {
      minDistance: 250,
      maxDistance: 500,
      earnings: buildEarningRates('100	200	400	450	500	600', '10	10	20	20	40	50')
    },
    {
      minDistance: 500,
      maxDistance: 750,
      earnings: buildEarningRates('170	325	650	715	825	975', '10	10	20	20	40	60')
    },
    {
      minDistance: 750,
      maxDistance: 1500,
      earnings: buildEarningRates('275	550	1,100	1,210	1,375	1,650', '15	15	30	30	60	90')
    },
    {
      minDistance: 1500,
      maxDistance: 2500,
      earnings: buildEarningRates('500	1,000	2,000	2,200	2,500	3,000', '20	20	40	40	80	120')
    },
    {
      minDistance: 2500,
      maxDistance: 3500,
      earnings: buildEarningRates('800	1,600	3,200	3,520	4,000	4,800', '25	25	50	50	100	150')
    },
    {
      minDistance: 3500,
      maxDistance: 5000,
      earnings:buildEarningRates('1,050	2,100	4,200	4,600	5,250	6,300', '30	30	60	60	120	180')
    },
    {
      minDistance: 5000,
      maxDistance: 6500,
      earnings: buildEarningRates('1,425	2,850	5,700	6,300	7,125	8,600', '35	35	70	70	140	210')
    },
    {
      minDistance: 6500,
      maxDistance: 9999999999,
      earnings: buildEarningRates('1,875	3,750	7,500	8,250	9,400	11,250', '40	40	80	80	160	240')
    }
  ]

  return new DistanceRule('All other flights', distanceBands)
}
