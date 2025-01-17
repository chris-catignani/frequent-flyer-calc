import { QantasEarnings } from "@/models/qantasEarnings"
import { DistanceRule, GeographicalRule } from "./rules"

export const buildUsaEastCoastUsaWestCoastRule = () => {
  const ruleConfig = {
    origin: {
      region: new Set(['usaEastCoast'])
    },
    destination: {
      region: {
        usaWestCoast: {
          discountEconomy: new QantasEarnings(625, 25),
          economy: new QantasEarnings(1250, 35),
          flexibleEconomy: new QantasEarnings(2500, 50),
          business: new QantasEarnings(3125, 100)
        }
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
        usaNycBos: {
          discountEconomy: new QantasEarnings(500, 20),
          economy: new QantasEarnings(750, 25),
          flexibleEconomy: new QantasEarnings(1500, 40),
          business: new QantasEarnings(1875, 80)
        },
        usaWestCoast: {
          discountEconomy: new QantasEarnings(625, 25),
          economy: new QantasEarnings(1250, 35),
          flexibleEconomy: new QantasEarnings(2500, 50),
          business: new QantasEarnings(3125, 100)
        }
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
      earnings: {
        discountEconomy: new QantasEarnings(25, 5),
        economy: new QantasEarnings(50, 5),
        flexibleEconomy: new QantasEarnings(100, 10),
        business: new QantasEarnings(125, 20)
      }
    },
    {
      minDistance: 100,
      maxDistance: 250,
      earnings: {
        discountEconomy: new QantasEarnings(50, 5),
        economy: new QantasEarnings(100, 5),
        flexibleEconomy: new QantasEarnings(200, 10),
        business: new QantasEarnings(250, 20)
      }
    },
    {
      minDistance: 250,
      maxDistance: 500,
      earnings: {
        discountEconomy: new QantasEarnings(100, 10),
        economy: new QantasEarnings(200, 10),
        flexibleEconomy: new QantasEarnings(400, 20),
        business: new QantasEarnings(500, 40)
      }
    },
    {
      minDistance: 500,
      maxDistance: 750,
      earnings: {
        discountEconomy: new QantasEarnings(170, 10),
        economy: new QantasEarnings(325, 10),
        flexibleEconomy: new QantasEarnings(650, 20),
        business: new QantasEarnings(825, 40)
      }
    },
    {
      minDistance: 750,
      maxDistance: 1500,
      earnings: {
        discountEconomy: new QantasEarnings(275, 15),
        economy: new QantasEarnings(550, 15),
        flexibleEconomy: new QantasEarnings(1100, 30),
        business: new QantasEarnings(1375, 60)
      }
    },
    {
      minDistance: 1500,
      maxDistance: 2500,
      earnings: {
        discountEconomy: new QantasEarnings(500, 20),
        economy: new QantasEarnings(1000, 20),
        flexibleEconomy: new QantasEarnings(2000, 40),
        business: new QantasEarnings(2500, 80)
      }
    },
    {
      minDistance: 2500,
      maxDistance: 3500,
      earnings: {
        discountEconomy: new QantasEarnings(800, 25),
        economy: new QantasEarnings(1600, 25),
        flexibleEconomy: new QantasEarnings(3200, 50),
        business: new QantasEarnings(4000, 100)
      }
    },
    {
      minDistance: 3500,
      maxDistance: 5000,
      earnings: {
        discountEconomy: new QantasEarnings(1050, 30),
        economy: new QantasEarnings(2100, 30),
        flexibleEconomy: new QantasEarnings(4200, 60),
        business: new QantasEarnings(5250, 120)
      }
    },
    {
      minDistance: 5000,
      maxDistance: 6500,
      earnings: {
        discountEconomy: new QantasEarnings(1420, 35),
        economy: new QantasEarnings(2850, 35),
        flexibleEconomy: new QantasEarnings(5700, 70),
        business: new QantasEarnings(7125, 140)
      }
    },
    {
      minDistance: 6500,
      maxDistance: 9999999999,
      earnings: {
        discountEconomy: new QantasEarnings(1875, 40),
        economy: new QantasEarnings(3750, 40),
        flexibleEconomy: new QantasEarnings(7500, 80),
        business: new QantasEarnings(9400, 160)
      }
    }
  ]

  return new DistanceRule('partner fallback', distanceBands)
}
