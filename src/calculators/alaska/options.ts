import { ALASKA_GROUP_AIRLINES } from "@/calculators/alaska/constants";
import type { ProgramOptions } from "@/types/program";

export const EARN_METHODS = ["distance", "price", "segments"] as const;
export const BOOKING_TYPES = ["cash", "award"] as const;
export const TICKET_ISSUERS = ["alaska", "american", "other"] as const;

export type EarnMethod = (typeof EARN_METHODS)[number];
export type BookingType = (typeof BOOKING_TYPES)[number];
export type TicketIssuer = (typeof TICKET_ISSUERS)[number];

// A type alias (not an interface) so it is assignable to ProgramOptions
export type AtmosOptions = {
  earnMethod: EarnMethod;
  bookingType: BookingType;
  ticketIssuer: TicketIssuer;
  fareUsd: number;
  pointsRedeemed: number;
  globalLocals: boolean;
};

export const DEFAULT_ATMOS_OPTIONS: AtmosOptions = {
  earnMethod: "distance",
  bookingType: "cash",
  ticketIssuer: "alaska",
  fareUsd: 0,
  pointsRedeemed: 0,
  globalLocals: false,
};

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

const nonNegative = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : 0;

export const toAtmosOptions = (options: ProgramOptions = {}): AtmosOptions => ({
  earnMethod: pick(options.earnMethod, EARN_METHODS, DEFAULT_ATMOS_OPTIONS.earnMethod),
  bookingType: pick(options.bookingType, BOOKING_TYPES, DEFAULT_ATMOS_OPTIONS.bookingType),
  ticketIssuer: pick(options.ticketIssuer, TICKET_ISSUERS, DEFAULT_ATMOS_OPTIONS.ticketIssuer),
  fareUsd: nonNegative(options.fareUsd),
  pointsRedeemed: nonNegative(options.pointsRedeemed),
  globalLocals: options.globalLocals === true,
});

export const validateAtmosOptions = (programOptions: ProgramOptions): Record<string, string> => {
  const options = toAtmosOptions(programOptions);
  if (options.earnMethod !== "price") {
    return {};
  }
  // Partner-issued tickets earn from the partner chart, so the fare has no effect
  if (options.bookingType === "cash" && options.ticketIssuer !== "other" && options.fareUsd <= 0) {
    return { fareUsd: "Enter the fare paid" };
  }
  if (options.bookingType === "award" && options.pointsRedeemed <= 0) {
    return { pointsRedeemed: "Enter the points redeemed" };
  }
  return {};
};

/** Price paid earns 5 points per $1 on 027 tickets, and on 001 tickets for American-marketed flights */
export const usesRevenueEarning = (airline: string, issuer: TicketIssuer): boolean =>
  issuer === "alaska" || (issuer === "american" && airline === "aa");

/** Only partner flights earning from the "other partner earn chart" need a fare class */
export const requiresFareClass = (airline: string, options: AtmosOptions): boolean =>
  options.earnMethod === "price" &&
  options.bookingType === "cash" &&
  !ALASKA_GROUP_AIRLINES.has(airline) &&
  !usesRevenueEarning(airline, options.ticketIssuer);
