export class SegmentInput {
  constructor(airline, fareClass, fromAirportText, toAirportText) {
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
    );

    clonedSegment.fromAirport = this.fromAirport;
    clonedSegment.toAirport = this.toAirport;

    return clonedSegment;
  }
}
