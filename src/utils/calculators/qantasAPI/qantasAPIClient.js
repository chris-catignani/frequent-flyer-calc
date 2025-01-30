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
    const url =
      "/api/qantas?" +
      new URLSearchParams({
        airline: segment.airline,
        fromIata: segment.fromAirport.iata,
        toIata: segment.toAirport.iata,
        eliteStatus
      }).toString();

    const qantasData = await fetch(url);
    const qantasJson = await qantasData.json();

    if(qantasJson.errorMessage) {
      console.log(`Qantas API returned an error: ${qantasJson.errorMessage}`)
      throw new Error(`Qantas API returned an error: ${qantasJson.errorMessage}`);
    }

    const result = Object.values(qantasJson.rewards).find((result) => {
      return result.fare_class === EARN_CATEGORY_MAP[fareEarnCategory];
    });

    if(!result) {
      console.log("Failed to find a matching Qantas API result", segment, eliteStatus, fareEarnCategory, qantasJson);
      retval.error = new Error('Failed to find a matching Qantas API result')
    } else {
      retval.qantasData = {
        qantasPoints: result.earn,
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
