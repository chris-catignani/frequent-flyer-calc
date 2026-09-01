import type { Airport } from "@/types/airport";

export interface SegmentProps {
  airline?: string;
  fareClass?: string;
  fromAirport?: Airport | null;
  toAirport?: Airport | null;
}

export class Segment {
  airline: string;
  fareClass: string;
  fromAirport: Airport;
  toAirport: Airport;

  constructor(airline: string, fareClass: string, fromAirport: Airport, toAirport: Airport) {
    this.airline = airline;
    this.fareClass = fareClass;
    this.fromAirport = fromAirport;
    this.toAirport = toAirport;
  }

  toString(): string {
    return `${this.airline} ${this.fareClass} ${this.fromAirport?.iata || ""} ${this.toAirport?.iata || ""}`;
  }

  clone({ airline, fareClass, fromAirport, toAirport }: SegmentProps): Segment {
    return new Segment(
      airline !== undefined ? airline : this.airline,
      fareClass !== undefined ? fareClass : this.fareClass,
      fromAirport !== undefined && fromAirport !== null ? fromAirport : this.fromAirport,
      toAirport !== undefined && toAirport !== null ? toAirport : this.toAirport
    );
  }
}
