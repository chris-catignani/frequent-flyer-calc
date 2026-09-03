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
  error?: string;
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

    if (!qantasData.ok) {
      let msg = `Qantas API request failed with status ${qantasData.status}`;
      try {
        const errJson: QantasApiResponse = await qantasData.json();
        if (errJson.error || errJson.errorMessage) {
          msg = errJson.error || errJson.errorMessage || msg;
        }
      } catch {
        // fallback to default msg
      }
      throw new Error(msg);
    }

    const qantasJson: QantasApiResponse = await qantasData.json();

    if (qantasJson.error || qantasJson.errorMessage) {
      throw new Error(qantasJson.error || qantasJson.errorMessage);
    }

    const result = qantasJson.rewards
      ? Object.values(qantasJson.rewards).find((result) => {
          return result.fare_class === EARN_CATEGORY_MAP[fareEarnCategory];
        })
      : undefined;

    if (!result) {
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
