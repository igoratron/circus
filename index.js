import { Buffer } from 'buffer';
import _ from 'lodash';
import through from 'through2';
import { PluginError, File } from 'gulp-util';
import { readFileSync } from 'fs';

import markupParser from './lib/markupParser';
import renderer, { registerPartial } from './lib/renderer';

export default function circus({templates, groupBy}) {
  const pageTemplate = readFileSync(templates.page, 'utf-8');
  const indexTemplate = readFileSync(templates.index, 'utf-8');
  const layoutTemplate = readFileSync(templates.partials[0], 'utf-8');

  const pageRenderer = renderer(pageTemplate);
  const indexRenderer = renderer(indexTemplate);
  registerPartial('partials/layout', layoutTemplate);

  const jsonDocs = [];

  return through({ objectMode: true },
    function transform(chunk, encoding, next) {
      if(chunk.isNull()) {
        next();
        return;
      }

      if(chunk.isStream()) {
        throw new PluginError('circus', 'Streaming is not supported.');
      }

      try {
        jsonDocs.push(...markupParser(chunk.contents.toString()));
      } catch (ex) {
        throw new PluginError(
          'circus',
          `Failed to parse ${chunk.path}.\nReason: ${ex.message}`
        );
      }

      next();
    },
    function finish(done) {
      const docsBySection = _.groupBy(jsonDocs, groupBy);
      const renderedPages = _.mapValues(docsBySection, pageRenderer);
      const renderedIndex = indexRenderer(docsBySection);
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      _.pairs(renderedPages)
        .map(function([path, contents]) {
          return new File({
            path:  `./${path}.html`,
            contents: new Buffer(contents)
          });
        })
        .forEach(push);

      push(new File({
        path: 'index.html',
        contents: new Buffer(renderedIndex)
      }));

      done();
    }
  );
}
