import { v4 as uuidv4 } from 'uuid';

export class Route {
  constructor(segmentInputs, uuid = '') {
    this.uuid = uuid || uuidv4(); // this makes me feel uncomfortable

    this.segmentInputs = segmentInputs;
  }

  clone({ segmentInputs }) {
    const clonedRoute = new Route(
      segmentInputs !== undefined ? segmentInputs : this.segmentInputs,
      this.uuid,
    );

    return clonedRoute;
  }
}
