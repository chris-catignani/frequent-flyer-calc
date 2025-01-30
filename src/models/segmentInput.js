export class SegmentInput {
  constructor(airline, fareClass, fromAirport, toAirport) {
    this.airline = airline
    this.fareClass = fareClass
    this.fromAirport = fromAirport
    this.toAirport = toAirport
  }

  toString() {
    return `${this.airline} ${this.fareClass} ${this.fromAirport} ${this.toAirport}`
  }

  clone({airline, fareClass, fromAirport, toAirport}) {
    return new SegmentInput(
      airline !== undefined ? airline : this.airline,
      fareClass !== undefined ? fareClass : this.fareClass,
      fromAirport !== undefined ? fromAirport : this.fromAirport,
      toAirport !== undefined ? toAirport : this.toAirport
    );
  }
}
