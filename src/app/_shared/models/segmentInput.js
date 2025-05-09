import { v4 as uuidv4 } from 'uuid';

export class SegmentInput {
  constructor(airline, fareClass, fromAirportText, toAirportText, uuid = '') {
    this.uuid = uuid || uuidv4(); // this makes me feel uncomfortable

    this.airline = airline;
    this.fareClass = fareClass;
    this.fromAirportText = fromAirportText;
    this.toAirportText = toAirportText;

    this.fromAirport = undefined;
    this.toAirport = undefined;
  }

  toString() {
    return `${this.airline} ${this.fareClass} ${this.fromAirportText} ${this.toAirportText}`;
  }

  clone({ airline, fareClass, fromAirportText, toAirportText }) {
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

// hack to create a default segment with a specific uuid
// this is so nextjs doesn't get mad the initial emtpy segment has differing uuids on the client vs server
export const defaultSegmentInput = new SegmentInput('', '', '', '', '00000000-0000-0000-0000-000000000000'); // prettier-ignore
