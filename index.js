import { Buffer } from 'buffer';
import _ from 'lodash';
import through from 'through2';
import { PluginError, File } from 'gulp-util';
import { readFileSync } from 'fs';

import markupParser from './lib/markupParser';
import renderer from './lib/renderer';

export default function circus(templatePath, groupBy) {
  const template = readFileSync(templatePath).toString();
  const render = renderer(template);
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

      jsonDocs.push(...markupParser(chunk.contents.toString()));
      next();
    },
    function finish(done) {
      const blocks = render(jsonDocs, groupBy);

      _.pairs(blocks)
        .map(function([path, contents]) {
          return new File({
            path:  `./${path}.html`,
            contents: new Buffer(contents)
          });
        })
        .forEach(file => this.push(file));

      done();
    }
  );
}
