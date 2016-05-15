const combine = require('stream-combiner');

const createAggregatorStream = require('./lib/streamTransformers/aggregator');
const createCssToYamlStream = require('./lib/streamTransformers/cssToYaml');
const createFromVinylStream = require('./lib/streamTransformers/fromVinyl');
const createHandlebarsStream = require('./lib/streamTransformers/handlebars');
const createToVinylStream = require('./lib/streamTransformers/toVinyl');
const createYamlToJsonStream = require('./lib/streamTransformers/yamlToJson');

module.exports = function circus({templates, groupBy}) {
  return combine(
    createFromVinylStream(),
    createCssToYamlStream(),
    createYamlToJsonStream(),
    createAggregatorStream(groupBy),
    createHandlebarsStream({
      index: templates.index,
      page: templates.page,
      partials: templates.partials
    }),
    createToVinylStream()
  );
};
