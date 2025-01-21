import { QantasEarnings } from "@/models/qantasEarnings"
import { IntraCountryRule, DistanceRule, GeographicalRule } from "./rules"
import { Segment } from "@/models/segment"

describe('rules', () => {

  describe('IntraCountryRule', () => {
    const distanceBands = [
      {
        minDistance: 0,
        maxDistance: 100,
        earnings: { business: new QantasEarnings(100, 10) }
      },
      {
        minDistance: 100,
        maxDistance: 200,
        earnings: { business: new QantasEarnings(200, 20) }
      },
    ]
    const intraCountryRule = new IntraCountryRule('intra country rule', 'United States', distanceBands)
    //TODO mock airports to specify distances?
  })

  describe('DistanceRule', () => {
    const distanceBands = [
      {
        minDistance: 0,
        maxDistance: 100,
        earnings: { business: new QantasEarnings(100, 10) }
      },
      {
        minDistance: 100,
        maxDistance: 200,
        earnings: { business: new QantasEarnings(200, 20) }
      },
    ]
    const distanceRule = new DistanceRule('intra country rule', distanceBands)
    //TODO mock airports to specify distances?
  })

  describe('GeographicalRule', () => {
    describe('City to City', () => {

      const geographicalRule = new GeographicalRule('geographical rule', {
        origin: { city: new Set(['dallas', 'houston']) },
        destination: {
          city: {
            'san francisco': { business: new QantasEarnings(100,  10) },
            'boston': { business: new QantasEarnings(200,  20) },
          }
        }
      })

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(Segment.fromString('aa i dfw sfo'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i sfo dfw'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i dfw bos'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i bos dfw'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i iah bos'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i bos iah'))).toBe(true)
      })

      test.each([
        ['aa i dfw sfo', 100,  10],
        ['aa i sfo dfw', 100,  10],
        ['aa i dfw bos', 200,  20],
        ['aa i bos dfw', 200,  20]
      ])(`Go path - calculate - %s should yield %s and %s`, (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        expect(geographicalRule.calculate(Segment.fromString(segmentString), 'business')).toMatchObject({
          qantasPoints: expectedQantasPoints,
          statusCredits: expectedStatusCredits,
        })
      })

      test('Rule does not apply', () => {
        // use same airports but invalid combination
        expect(geographicalRule.applies(Segment.fromString('aa i dfw iah'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i sfo bos'))).toBe(false)

        // use 1 valid and 1 not valid airports
        expect(geographicalRule.applies(Segment.fromString('aa i dfw lax'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i lax dfw'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i sfo lax'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i lax sfo'))).toBe(false)

        // use 2 invalid airports
        expect(geographicalRule.applies(Segment.fromString('aa i lax lga'))).toBe(false)
      })
    })

    describe('Country to Country', () => {

      const geographicalRule = new GeographicalRule('geographical rule', {
        origin: { country: new Set(['united states', 'canada']) },
        destination: {
          country: {
            'united kingdom': { business: new QantasEarnings(300,  30) },
            'france': { business: new QantasEarnings(400,  40) },
          }
        }
      })

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(Segment.fromString('aa i jfk lhr'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i lhr jfk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i jfk cdg'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i cdg jfk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i yyz cdg'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i cdg yyz'))).toBe(true)
      })

      test.each([
        ['aa i jfk lhr', 300,  30],
        ['aa i lhr jfk', 300,  30],
        ['aa i yyz cdg', 400,  40],
        ['aa i cdg yyz', 400,  40]
      ])(`Go path - calculate - %s should yield %s and %s`, (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        expect(geographicalRule.calculate(Segment.fromString(segmentString), 'business')).toMatchObject({
          qantasPoints: expectedQantasPoints,
          statusCredits: expectedStatusCredits,
        })
      })

      test('Rule does not apply', () => {
        // use same regions but invalid combination
        expect(geographicalRule.applies(Segment.fromString('aa i jfk lax'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i yyz yvr'))).toBe(false)

        // use 1 valid and 1 not valid region
        expect(geographicalRule.applies(Segment.fromString('aa i jfk ams'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i ams jfk'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i yyz mad'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i mad yyz'))).toBe(false)

        // use 2 invalid airports
        expect(geographicalRule.applies(Segment.fromString('aa i mex mad'))).toBe(false)
      })
    })

    describe('Region to Region', () => {

      const geographicalRule = new GeographicalRule('geographical rule', {
        origin: { region: new Set(['usaEastCoast', 'northernEurope']) },
        destination: {
          region: {
            'westernEurope': { business: new QantasEarnings(500,  50) },
            'southeastAsia': { business: new QantasEarnings(600,  60) },
          }
        }
      })

      test('Go Path - applies', () => {
        expect(geographicalRule.applies(Segment.fromString('aa i jfk lhr'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i lhr jfk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i jfk bkk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i bkk jfk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i hel bkk'))).toBe(true)
        expect(geographicalRule.applies(Segment.fromString('aa i bkk hel'))).toBe(true)
      })

      test.each([
        ['aa i jfk lhr', 500,  50],
        ['aa i lhr jfk', 500,  50],
        ['aa i hel bkk', 600,  60],
        ['aa i bkk hel', 600,  60]
      ])(`Go path - calculate - %s should yield %s and %s`, (segmentString, expectedQantasPoints, expectedStatusCredits) => {
        expect(geographicalRule.calculate(Segment.fromString(segmentString), 'business')).toMatchObject({
          qantasPoints: expectedQantasPoints,
          statusCredits: expectedStatusCredits,
        })
      })

      test('Rule does not apply', () => {
        // use same regions but invalid combination
        expect(geographicalRule.applies(Segment.fromString('aa i jfk hel'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i hel jfk'))).toBe(false)

        // use 1 valid and 1 not valid region
        expect(geographicalRule.applies(Segment.fromString('aa i jfk lax'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i lax jfk'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i hel lax'))).toBe(false)
        expect(geographicalRule.applies(Segment.fromString('aa i lax hnd'))).toBe(false)

        // use 2 invalid airports
        expect(geographicalRule.applies(Segment.fromString('aa i mex eze'))).toBe(false)
      })
    })
  })

  // TODO test mixes of cities,  regions, countries

  // TODO test error states: (1) no fare earning category for a given bucket (2)
})
