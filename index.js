import combine from 'stream-combiner';

import createAggregatorStream from './streamTransformers/aggregator';
import createCssToYamlStream from './streamTransformers/cssToYaml';
import createFromVinylStream from './streamTransformers/fromVinyl';
import createHandlebarsStream from './streamTransformers/handlebars';
import createToVinylStream from './streamTransformers/toVinyl';
import createYamlToJsonStream from './streamTransformers/yamlToJson';

export default function circus({templates, groupBy}) {
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
}
