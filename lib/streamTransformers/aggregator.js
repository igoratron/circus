const through = require('through2');

module.exports = function createAggregatorStream(groupBy) {
  const jsonDocs = [];

  return through(
    function transform(chunk, encoding, next) {
      jsonDocs.push(JSON.parse(chunk.toString()));
      next();
    },
    function finish(done) {
      try{
        const docsBySection = jsonDocs.reduce(groupBy, {});
        const push = this.push.bind(this); //eslint-disable-line no-invalid-this

        push(JSON.stringify(docsBySection))
        done();
      } catch (e) {
        done(e);
      }
    }
  );
};
