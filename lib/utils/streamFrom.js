const { Readable } = require('stream');

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

module.exports = function streamFrom(array) {
  return new StreamFrom(array);
};
