import Buffer from 'buffer';
import _ from 'lodash';
import through from 'through2';
import { PluginError, isBuffer, File } from 'gulp-util';

import markupParser from './lib/markupParser';
import renderer from './lib/renderer';

export default function circus(template, groupBy) {

  const render = renderer(template);

  return through.obj(function(chunk, encoding, next) {
    if(! File.isVinyl(chunk) || ! isBuffer(chunk.contents)) {
      throw new PluginError('circus', 'The given stream does not look like a vinyl stream');
    }

    const data = markupParser(chunk.toString());
    const blocks = render(data, groupBy);

    _.pairs(blocks)
      .map(function([contents, path]) {
        return new File({
          base: path.join(__dirname, './circus/'),
          cwd: __dirname,
          path: path.join(__dirname, `./circus/${path}.html`),
          contents: new Buffer(contents)
        });
      })
      .forEach(file => this.push(file));

    next();
  });
}
