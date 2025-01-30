import { Segment } from "src/models/segment"
import { getPartnerEarnCategory } from "./partnerEarnCategories"
import { buildSegmentFromString } from "@/test/testUtils"

describe('getPartnerEarnCategory', () => {

  // basic case
  test.each([
    ['n', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],

    ['g', 'economy'],
    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],

    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['p', 'premiumEconomy'],
    ['w', 'premiumEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],
    ['r', 'business'],

    ['a', 'first'],
    ['f', 'first']
  ])('recognizes the American Airlines %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`aa ${fareClass} jfk lax`)
    expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
  })

  // alaska has a special character in the Qantas website
  test.each([
    ['g', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],
    ['x', 'discountEconomy'],

    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['n', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],

    ['a', 'first'],
    ['f', 'first']
  ])('recognizes the Alaska Airline %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`as ${fareClass} jfk lax`)
    expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
  })

  // Qatar does not have Premium Economy
  test.each([
    ['k', 'discountEconomy'],
    ['l', 'discountEconomy'],
    ['m', 'discountEconomy'],
    ['v', 'discountEconomy'],

    ['b', 'economy'],
    ['h', 'economy'],

    ['y', 'flexibleEconomy'],

    ['c', 'business'],
    ['d', 'business'],
    ['i', 'business'],
    ['j', 'business'],
    ['p', 'business'],
    ['r', 'business'],

    ['a', 'first'],
    ['f', 'first']
  ])('recognizes the Qatar Airlines %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`qr ${fareClass} jfk lax`)
    expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
  })

  describe('Japan Airlines special cases', () => {
    test('intra-Japan flights fail', () => {
      const segment = buildSegmentFromString(`jl i hnd cts`)
      expect(() => getPartnerEarnCategory(segment)).toThrow('Intra Japan flights on JAL are not yet supported')
    })

    test('non intra-Japan flights succeed', () => {
      const segment = buildSegmentFromString(`jl i hnd tpe`)
      expect(getPartnerEarnCategory(segment)).toBe('business')
    })
  })

  describe('Malaysia Airlines special cases', () => {
    test.each([
      ['mh j kul syd', 'flexibleEconomy'],
      ['mh j syd kul', 'flexibleEconomy'],
      ['mh j kul lhr', 'flexibleEconomy'],
      ['mh j lhr kul', 'flexibleEconomy'],
      ['mh j kul cdg', 'flexibleEconomy'],
      ['mh j cdg kul', 'flexibleEconomy'],
    ])('Flights between Australia and Malaysia, UK or Europe', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })

    test.each([
      ['mh j kul akl', 'flexibleEconomy'],
      ['mh j akl kul', 'flexibleEconomy'],
      ['mh j akl lhr', 'flexibleEconomy'],
      ['mh j lhr akl', 'flexibleEconomy'],
      ['mh j akl cdg', 'flexibleEconomy'],
      ['mh j cdg akl', 'flexibleEconomy'],
    ])('Flights between New Zealand and Malaysia, UK or Europe', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })

    test.each([
      ['mh j kul lhr', 'flexibleEconomy'],
      ['mh j lhr kul', 'flexibleEconomy'],
      ['mh j kul cdg', 'flexibleEconomy'],
      ['mh j cdg kul', 'flexibleEconomy'],
      ['mh j kul doh', 'flexibleEconomy'],
      ['mh j doh kul', 'flexibleEconomy'],
    ])('Flights between Malaysia and UK, Europe or Middle East', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })

    test.each([
      ['mh j kul tpe', 'business'],
      ['mh j tpe kul', 'business'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })
  })

  describe('SriLanka Airlines special cases', () => {
    test.each([
      ['ul p syd kul', 'economy'],
      ['ul p kul syd', 'economy'],
      ['ul p syd cmb', 'economy'],
      ['ul p cmb syd', 'economy'],
      ['ul p per kul', 'flexibleEconomy'],
      ['ul p kul per', 'flexibleEconomy'],
    ])('Flights between Southeast Australia and Malaysia or Sri Lanka', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })

    test.each([
      ['ul p cdg kul', 'economy'],
      ['ul p kul cdg', 'economy'],
      ['ul p ist kul', 'economy'],
      ['ul p kul ist', 'economy'],
      ['ul p cdg cmb', 'economy'],
      ['ul p cmb cdg', 'economy'],
      ['ul p ist cmb', 'economy'],
      ['ul p cmb ist', 'economy'],
    ])('Flights between Europe and Malaysia or Sri Lanka', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })

    test.each([
      ['ul p doh cmb', 'flexibleEconomy'],
      ['ul p cmb doh', 'flexibleEconomy'],
    ])('Non special case flights', (segmentString, expectedCategory) => {
      const segment = buildSegmentFromString(segmentString)
      expect(getPartnerEarnCategory(segment)).toBe(expectedCategory)
    })
  })

  describe('Edge cases', () => {
    test('invalid airline code', () => {
      const segment = buildSegmentFromString(`xx i hnd cts`)
      expect(() => getPartnerEarnCategory(segment)).toThrow('No airline configured for xx')
    })

    test('invalid fare code', () => {
      const segment = buildSegmentFromString(`aa x hnd cts`)
      expect(() => getPartnerEarnCategory(segment)).toThrow('Airline aa is not configured for fare class x')
    })
  })
})
