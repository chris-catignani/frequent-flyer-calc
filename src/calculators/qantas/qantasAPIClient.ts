import type { Segment } from "@/models/segment";
import type { QantasApiResults } from "@/types/calculator";

const EARN_CATEGORY_MAP: Record<string, string> = {
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

interface QantasRewardEntry {
  fare_class: string;
  earn: number;
  base: number;
  cabin_bonus: number;
  status_credits: number;
}

interface QantasApiResponse {
  errorMessage?: string;
  rewards?: Record<string, QantasRewardEntry>;
}

export const fetchDataFromQantas = async (
  segment: Segment,
  eliteStatus: string,
  fareEarnCategory: string
): Promise<QantasApiResults> => {
  const retval: QantasApiResults = {};

  try {
    const url =
      "/api/qantas?" +
      new URLSearchParams({
        airline: segment.airline,
        fromIata: segment.fromAirport.iata,
        toIata: segment.toAirport.iata,
        eliteStatus,
      }).toString();

    const qantasData = await fetch(url);
    const qantasJson: QantasApiResponse = await qantasData.json();

    if (qantasJson.errorMessage) {
      console.log(`Qantas API returned an error: ${qantasJson.errorMessage}`);
      throw new Error(`Qantas API returned an error: ${qantasJson.errorMessage}`);
    }

    const result = qantasJson.rewards
      ? Object.values(qantasJson.rewards).find((result) => {
          return result.fare_class === EARN_CATEGORY_MAP[fareEarnCategory];
        })
      : undefined;

    if (!result) {
      console.log(
        "Failed to find a matching Qantas API result",
        segment,
        eliteStatus,
        fareEarnCategory,
        qantasJson
      );
      retval.error = new Error("Failed to find a matching Qantas API result");
    } else {
      retval.qantasData = {
        airlinePoints: result.earn,
        basePoints: result.base,
        eliteBonus: result.cabin_bonus,
        elitePoints: result.status_credits,
      };
    }
  } catch (error) {
    retval.error = error as Error;
  }

  return retval;
};
