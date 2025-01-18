import { getPartnerEarnCategory } from "./partner/partnerEarnCategories"
import { getPartnerRules } from "./partner/partnerRules"

const partnerRules = getPartnerRules()

export const calculate = (segments, eliteStatus) => {
  const retval = {
    segmentResults: [],
    statusCredits: 0,
    qantasPoints: 0
  }

  for (let segment of segments) {
    const rule = partnerRules.find( (rule) => {
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

    retval.segmentResults.push({
      rule: rule.name,
      segment,
      calculation
    })
    retval.qantasPoints += calculation.qantasPoints
    retval.statusCredits += calculation.statusCredits
  }

  return retval
}
