import { v4 as uuidv4 } from 'uuid';
import type { Airport } from '@/types/airport';

export interface SegmentInputProps {
  airline?: string;
  fareClass?: string;
  fromAirportText?: string;
  toAirportText?: string;
}

export class SegmentInput {
  uuid: string;
  airline: string;
  fareClass: string;
  fromAirportText: string;
  toAirportText: string;
  fromAirport?: Airport | null;
  toAirport?: Airport | null;

  constructor(
    airline: string,
    fareClass: string,
    fromAirportText: string,
    toAirportText: string,
    uuid: string = '',
  ) {
    this.uuid = uuid || uuidv4();
    this.airline = airline;
    this.fareClass = fareClass;
    this.fromAirportText = fromAirportText;
    this.toAirportText = toAirportText;
    this.fromAirport = undefined;
    this.toAirport = undefined;
  }

  toString(): string {
    return `${this.airline} ${this.fareClass} ${this.fromAirportText} ${this.toAirportText}`;
  }

  clone({ airline, fareClass, fromAirportText, toAirportText }: SegmentInputProps): SegmentInput {
    const clonedSegment = new SegmentInput(
      airline !== undefined ? airline : this.airline,
      fareClass !== undefined ? fareClass : this.fareClass,
      fromAirportText !== undefined ? fromAirportText : this.fromAirportText,
      toAirportText !== undefined ? toAirportText : this.toAirportText,
      this.uuid,
    );

    clonedSegment.fromAirport = this.fromAirport;
    clonedSegment.toAirport = this.toAirport;

    return clonedSegment;
  }
}

export const defaultSegmentInput = new SegmentInput(
  'qf',
  '',
  '',
  '',
  '00000000-0000-0000-0000-000000000000',
);
