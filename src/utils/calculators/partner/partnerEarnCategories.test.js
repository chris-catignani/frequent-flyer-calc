import { Segment } from "src/models/segment"
import { getPartnerEarnCategory } from "./partnerEarnCategories"

describe('getPartnerEarnCategory', () => {
  test('recognizes the AA earn categories', () => {
    const segment = Segment.fromString('aa i jfk lax')
    expect(getPartnerEarnCategory(segment)).toBe('business')
  })
})
