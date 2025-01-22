import { Segment } from "@/models/segment"
import { getQantasEarnCategory } from "./qantasEarnCategories"

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

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['k', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['t', 'discountPremiumEconomy'],

    ['r', 'premiumEconomy'],

    ['w', 'flexiblePremiumEconomy'],

    ['d', 'business'],
    ['i', 'business'],

    ['c', 'flexibleBusiness'],
    ['j', 'flexibleBusiness']
  ])('recognizes the Qantas domestic %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = Segment.fromString(`qf ${fareClass} syd mel`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })

  // qantas international
  test.each([
    ['e', 'discountEconomy'],
    ['n', 'discountEconomy'],
    ['o', 'discountEconomy'],
    ['q', 'discountEconomy'],

    ['g', 'economy'],
    ['k', 'economy'],
    ['l', 'economy'],
    ['m', 'economy'],
    ['s', 'economy'],
    ['v', 'economy'],

    ['b', 'flexibleEconomy'],
    ['h', 'flexibleEconomy'],
    ['y', 'flexibleEconomy'],

    ['t', 'discountPremiumEconomy'],

    ['r', 'premiumEconomy'],

    ['w', 'flexiblePremiumEconomy'],

    ['i', 'discountBusiness'],

    ['d', 'business'],

    ['c', 'flexibleBusiness'],
    ['j', 'flexibleBusiness'],

    ['a', 'first'],
    ['f', 'first']
  ])('recognizes the Qantas international %s fareclass is a %s categories', (fareClass, expectedCategory) => {
    const segment = Segment.fromString(`qf ${fareClass} syd lax`)
    expect(getQantasEarnCategory(segment)).toBe(expectedCategory)
  })
})
