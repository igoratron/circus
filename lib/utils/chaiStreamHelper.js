export default function streamContainsHelper(chai, utils) {
  const Assertion = chai.Assertion;

  Assertion.addMethod('stream', function(expected) {
    const stream = this._obj; //eslint-disable-line no-invalid-this
    const assert = this.assert.bind(this); //eslint-disable-line no-invalid-this

    return new Promise(function(resolve, reject) {
      const result = [];

      stream.on('readable', function() {
        const actual = stream.read();

        if(actual !== null) {
          result.push(actual.toString());
          return;
        }
      });

      stream.on('end', function() {
        assert(
          utils.eql(expected, result),
          'expected #{act} to deeply equal #{exp}',
          'expected #{act} to not deeply equal #{exp}',
          expected,
          JSON.stringify(result)
        );

        resolve();
      });

      stream.on('error', reject);
    });
  });
}
