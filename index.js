const combine = require('stream-combiner');
const gutil = require('gulp-util');

const aggregate = require('./lib/streamTransformers/aggregator');
const cssToYaml = require('./lib/streamTransformers/cssToYaml');
const fromVinyl = require('./lib/streamTransformers/fromVinyl');
const handlebars = require('./lib/streamTransformers/handlebars');
const toVinyl = require('./lib/streamTransformers/toVinyl');
const yamlToJson = require('./lib/streamTransformers/yamlToJson');

module.exports = function circus({ templates, groupBy, helpers, debug = false }) {
  return combine(
    fromVinyl(),
    cssToYaml(),
    yamlToJson(),
    aggregate(groupBy),
    handlebars({
      homepage: templates.homepage,
      tableOfContents: templates.tableOfContents,
      leaf: templates.leaf,
      partials: templates.partials,
      helpers,
      debug
    }),
    toVinyl()
  )
  .on('error', function(error) {
    gutil.log('circus: ', error.message);
  });
};
