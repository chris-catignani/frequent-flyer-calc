import { v4 as uuidv4 } from "uuid";
import type { Airport } from "@/types/airport";

export interface SegmentInput {
  readonly uuid: string;
  readonly airline: string;
  readonly fareClass: string;
  readonly fromAirportText: string;
  readonly toAirportText: string;
  readonly fromAirport?: Airport | null;
  readonly toAirport?: Airport | null;
}

export interface CreateSegmentInputOptions {
  airline?: string;
  fareClass?: string;
  fromAirportText?: string;
  toAirportText?: string;
  uuid?: string;
  fromAirport?: Airport | null;
  toAirport?: Airport | null;
}

export function createSegmentInput(options?: CreateSegmentInputOptions): SegmentInput;
export function createSegmentInput(
  airline?: string,
  fareClass?: string,
  fromAirportText?: string,
  toAirportText?: string,
  uuid?: string
): SegmentInput;
export function createSegmentInput(
  airlineOrOptions?: string | CreateSegmentInputOptions,
  fareClass: string = "",
  fromAirportText: string = "",
  toAirportText: string = "",
  uuid: string = ""
): SegmentInput {
  if (typeof airlineOrOptions === "object" && airlineOrOptions !== null) {
    return {
      uuid: airlineOrOptions.uuid || uuidv4(),
      airline: airlineOrOptions.airline ?? "",
      fareClass: airlineOrOptions.fareClass ?? "",
      fromAirportText: airlineOrOptions.fromAirportText ?? "",
      toAirportText: airlineOrOptions.toAirportText ?? "",
      fromAirport: airlineOrOptions.fromAirport,
      toAirport: airlineOrOptions.toAirport,
    };
  }
  return {
    uuid: uuid || uuidv4(),
    airline: airlineOrOptions ?? "",
    fareClass,
    fromAirportText,
    toAirportText,
  };
}

export const defaultSegmentInput: SegmentInput = Object.freeze({
  uuid: "00000000-0000-0000-0000-000000000000",
  airline: "qf",
  fareClass: "",
  fromAirportText: "",
  toAirportText: "",
});

export const segmentInputToString = (segmentInput: SegmentInput): string => {
  return `${segmentInput.airline} ${segmentInput.fareClass} ${segmentInput.fromAirportText} ${segmentInput.toAirportText}`;
};
