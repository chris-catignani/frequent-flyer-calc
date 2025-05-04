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
