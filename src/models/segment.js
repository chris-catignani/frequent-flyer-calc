export class Segment {
  constructor(airline, fareClass, fromAirport, toAirport) {
    this.airline = airline
    this.fareClass = fareClass
    this.fromAirport = fromAirport
    this.toAirport = toAirport
  }

  static fromString(segmentString) {
    return new Segment(...segmentString.split(" "))
  }

  toString() {
    return `${this.airline} ${this.fareClass} ${this.fromAirport} ${this.toAirport}`
  }
}
