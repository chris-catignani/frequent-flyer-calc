import { getPartnerEarnCategory } from "./earnCategories"
import { buildPartnerFallbackRule } from "./qantasrules"

const _rules = [
  // _western_europe_rule,
  // _northern_europe_rule,
  // _southeast_europe_rule,
  // _dubai_doha_rule,
  // _usa_short_haul_rule,
  // _usa_east_coast_rule,
  // _usa_dallas_rule,
  buildPartnerFallbackRule()
]

export const calculate = (segments, eliteStatus) => {
  const retval = {
    segments: [],
    statusCredits: 0,
    qantasPoints: 0
  }

  for (let segment of segments) {
    const rule = _rules.find( (rule) => {
      return rule.applies(segment)
    })

    if(!rule) {
      throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`)
    }

    const fareEarnCategory = getPartnerEarnCategory(segment)

    const calculation = rule.calculate(segment, fareEarnCategory)

    // TODO elite status
    // if (status in (_qantas_partner_airlines[segment.airline].status_multipliers || {})) {
    //   calculation.qantas_points = Math.floor(
    //     calculation.qantas_points + 
    //     calculation.qantas_points * _qantas_partner_airlines[segment.airline].status_multipliers[status]
    //   )
    // }

    retval.segments.push({
      rule: rule.name,
      segment,
      calculation
    })
    retval.qantasPoints += calculation.qantasPoints
    retval.statusCredits += calculation.statusCredits
  }

  return retval
}
