import { v4 as uuidv4 } from 'uuid';

export class Route {
  constructor(segmentInputs) {
    this.uuid = uuidv4(); // this makes me feel uncomfortable

    this.segmentInputs = segmentInputs;
  }
}
