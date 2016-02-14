import _ from 'lodash';
import through from 'through2';

export default function createAggregatorStream(groupBy) {
  const jsonDocs = [];

  return through(
    function transform(chunk, encoding, next) {
      jsonDocs.push(JSON.parse(chunk.toString()));
      next();
    },
    function finish(done) {
      const docsBySection = _.groupBy(jsonDocs, groupBy);
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      push(JSON.stringify(docsBySection))
      done();
    }
  );
}
