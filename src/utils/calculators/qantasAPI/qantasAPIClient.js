const EARN_CATEGORY_MAP = {
  discountEconomy: "Discount Economy",
  economy: "Economy",
  flexibleEconomy: "Flexible Economy",
  discountPremiumEconomy: "Discount Premium Economy",
  premiumEconomy: "Premium Economy",
  flexiblePremiumEconomy: "Flexible Premium Economy",
  discountBusiness: "Discount Business",
  business: "Business",
  flexibleBusiness: "Flexible Business",
  first: "First",
};

export const fetchDataFromQantas = async (segment, eliteStatus, fareEarnCategory) => {
  const retval = {};

  try {
    const qantasData = await fetch(buildFetchUrl(segment, eliteStatus));
    const qantasJson = await qantasData.json();
    const result = Object.values(qantasJson.rewards).find((result) => {
      return result.fare_class === EARN_CATEGORY_MAP[fareEarnCategory];
    });

    if(!result) {
      retval.error = new Error('Failed to parse a matching Qantas result')
    } else {
      retval.qantasData = {
        basePoints: result.base,
        eliteBonus: result.cabin_bonus,
        statusCredits: result.status_credits,
      };
    }
  } catch (error) {
    retval.error = error;
  }

  return retval
};

// Build the request url, e.g.
// https://api.services.qantasloyalty.com/earnquote/v1/rewards?fares=AA_LHRJFK&tiers=Bronze&date=2025-01-29
const buildFetchUrl = (segment, eliteStatus) => {
  const date = new Date();
  const qantasUrl = new URL(
    "https://api.services.qantasloyalty.com/earnquote/v1/rewards"
  );

  qantasUrl.searchParams.append(
    "fares",
    segment.airline.toUpperCase() +
      "_" +
      segment.fromAirport.toUpperCase() +
      segment.toAirport.toUpperCase()
  );
  qantasUrl.searchParams.append("tiers", eliteStatus);
  qantasUrl.searchParams.append(
    "date",
    date.getFullYear() + "-" + date.getMonth() + 1 + "-" + date.getDate()
  );

  return qantasUrl.href;
};
