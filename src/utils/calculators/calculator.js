import { getPartnerEarnCategory } from "./partner/partnerEarnCategories"
import { getPartnerRules } from "./partner/partnerRules"
import { getQantasEarnCategory } from "./qantas/qantasEarnCategories"
import { getQantasMinimumPoints, getQantasRules } from "./qantas/qantasRules"

// TODO make this a map of airline to rules?
const partnerRules = getPartnerRules() // this is a list
const qantasRules = getQantasRules() // this is a map of airlineCode -> rules[]
const qantasMinPoints = getQantasMinimumPoints()

export const calculate = (segments, eliteStatus) => {
  const retval = {
    segmentResults: [],
    statusCredits: 0,
    qantasPoints: 0
  }

  for (let segment of segments) {
    try {
      const {fareEarnCategory, rule, minPoints} = getEarnCalculationRequirements(segment)

      if(!rule) {
        throw new Error(`Could not find a rule to calculate earnings for segment: ${segment}`)
      }

      const calculation = rule.calculate(segment, fareEarnCategory)

      // TODO elite status
      // if (status in (_qantas_partner_airlines[segment.airline].status_multipliers || {})) {
      //   calculation.qantas_points = Math.floor(
      //     calculation.qantas_points + 
      //     calculation.qantas_points * _qantas_partner_airlines[segment.airline].status_multipliers[status]
      //   )
      // }
      
      const qantasPoints = Math.max(calculation.qantasPoints, minPoints)

      retval.segmentResults.push({
        rule: rule.name,
        segment,
        calculation,
        minPoints,
      })
      retval.qantasPoints += qantasPoints
      retval.statusCredits += calculation.statusCredits
    } catch (err) {
      retval.segmentResults.push({
        error: err,
        segment,
      })
    }
  }

  return retval
}

// TODO clean this up
const getEarnCalculationRequirements = (segment) => {
  if(segment.airline in qantasRules) {
    const fareEarnCategory = getQantasEarnCategory(segment)

    const rule = qantasRules[segment.airline].find( (rule) => {
      return rule.applies(segment, fareEarnCategory)
    })

    const minPoints = qantasMinPoints[segment.airline][fareEarnCategory]

    return {fareEarnCategory, rule, minPoints}
  } else {
    const fareEarnCategory = getPartnerEarnCategory(segment)

    const rule = partnerRules.find( (rule) => {
      return rule.applies(segment, fareEarnCategory)
    })

    return {fareEarnCategory, rule, minPoints: 0}
  }
}
