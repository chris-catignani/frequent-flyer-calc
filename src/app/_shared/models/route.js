import { v4 as uuidv4 } from 'uuid';

export class Route {
  constructor(segmentInputs, subtotal, uuid = '') {
    this.uuid = uuid || uuidv4(); // this makes me feel uncomfortable

    this.segmentInputs = segmentInputs;
    this.subtotal = subtotal;
  }

  clone({ segmentInputs, subtotal }) {
    const clonedRoute = new Route(
      segmentInputs !== undefined ? segmentInputs : this.segmentInputs,
      subtotal !== undefined ? subtotal : this.subtotal,
      this.uuid,
    );

    return clonedRoute;
  }
}
