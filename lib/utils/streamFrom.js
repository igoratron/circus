import {Readable} from 'stream';

class StreamFrom extends Readable {
  constructor(array) {
    super();
    this.values = array;
  }

  _read() {
    this.values.forEach(value => this.push(value));
    this.push(null);
  }
}

export default function streamFrom(array) {
  return new StreamFrom(array);
}
