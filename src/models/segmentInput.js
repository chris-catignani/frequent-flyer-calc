export class SegmentInput {
  constructor(airline, fareClass, fromAirportText, toAirportText) {
    this.airline = airline;
    this.fareClass = fareClass;
    this.fromAirportText = fromAirportText;
    this.toAirportText = toAirportText;
  }

  toString() {
    return `${this.airline} ${this.fareClass} ${this.fromAirportText} ${this.toAirportText}`;
  }

  clone({ airline, fareClass, fromAirportText, toAirportText }) {
    return new SegmentInput(
      airline !== undefined ? airline : this.airline,
      fareClass !== undefined ? fareClass : this.fareClass,
      fromAirportText !== undefined ? fromAirportText : this.fromAirportText,
      toAirportText !== undefined ? toAirportText : this.toAirportText
    );
  }
}
