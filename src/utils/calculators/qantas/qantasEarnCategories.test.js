import { getQantasEarnCategory } from "./qantasEarnCategories"
import { buildSegmentFromString } from "@/test/testUtils";

describe('getQantasEarnCategory', () => {

  // qantas domestic
  test.each([
    ['e', 'discountEconomy'],
    ['g', 'discountEconomy'],
    ['l', 'discountEconomy'],
    ['m', 'discountEconomy'],
    ['n', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],
    ['s', 'discountEconomy'],
    ['v', 'discountEconomy'],
    ['RedeDeal', 'discountEconomy'],

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['k', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],
    ['Flex', 'flexibleEconomy'],

    ['t', 'discountPremiumEconomy'],
    ['DiscountPremiumEconomy', 'discountPremiumEconomy'],

    ['r', 'premiumEconomy'],
    ['PremiumEconomySaver', 'premiumEconomy'],

    ['w', 'flexiblePremiumEconomy'],
    ['PremiumEconomyFlex', 'flexiblePremiumEconomy'],

    ['d', 'business'],
    ['i', 'business'],
    ['BusinessSale', 'business'],
    ['BusinessSaver', 'business'],

    ['c', 'flexibleBusiness'],
    ['j', 'flexibleBusiness'],
    ['Business', 'flexibleBusiness']
  ])('recognizes the Qantas domestic %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`qf ${fareClass} syd mel`);
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  // qantas international
  test.each([
    ['e', 'discountEconomy'],
    ['n', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],
    ['EconomySale', 'discountEconomy'],

    ['g', 'economy'],
    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],
    ['EconomySaver', 'economy'],

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],
    ['EconomyFlex', 'flexibleEconomy'],

    ['t', 'discountPremiumEconomy'],
    ['PremiumEconomySale', 'discountPremiumEconomy'],

    ['r', 'premiumEconomy'],
    ['PremiumEconomySaver', 'premiumEconomy'],

    ['w', 'flexiblePremiumEconomy'],
    ['PremiumEconomyFlex', 'flexiblePremiumEconomy'],

    ['i', 'discountBusiness'],
    ['BusinessSale', 'discountBusiness'],

    ['d', 'business'],
    ['BusinessSaver', 'business'],

    ['c', 'flexibleBusiness'],
    ['j', 'flexibleBusiness'],
    ['BusinessFlex', 'flexibleBusiness'],

    ['a', 'first'],
    ['f', 'first'],
    ['FirstSale', 'first'],
    ['FirstSaver', 'first'],
    ['FirstFlex', 'first']
  ])('recognizes the Qantas international %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`qf ${fareClass} syd lax`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  // Jetstar JQ
  test.each([
    ['Flex', 'economy'],
    ['FlexPlus', 'economy'],

    ['StarterMax', 'flexibleEconomy'],

    ['BusinessMax', 'business'],
  ])('recognizes the Jetstar JQ %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`jq ${fareClass} syd lax`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  // Jetstar 3k
  test.each([
    ['Flex', 'economy'],
    ['FlexPlus', 'economy'],

    ['StarterMax', 'flexibleEconomy'],

    ['BusinessMax', 'business'],
  ])('recognizes the Jetstar 3k %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`3k ${fareClass} syd lax`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  // Jetstar GK
  test.each([
    ['Flex', 'economy'],
    ['FlexPlus', 'economy'],

    ['StarterMax', 'flexibleEconomy'],

    ['BusinessMax', 'business'],
  ])('recognizes the Jetstar Gk %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = buildSegmentFromString(`gk ${fareClass} syd lax`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  describe('Jetstar New Zealand special case', () => {
    // Jetstar JQ
    test.each([
      ['EconomyStarterFare', 'discountEconomy'],
      ['EconomyStarterFlexBiz', 'discountEconomy'],

      ['Flex', 'economy'],
      ['FlexPlus', 'economy'],
      ['StarterPlus', 'economy'],

      ['StarterMax', 'flexibleEconomy'],
    ])('recognizes the Jetstar JQ New Zealand %s fareclass is a %s categories', (fareClass, expectedCategory) => {
      const segment = buildSegmentFromString(`jq ${fareClass} akl chc`)
      expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
    })
  })
})
