import through2 from 'through2';
import { PluginError } from 'gulp-util';

export default function createFromVinylStream() {

  return through2.obj(function(chunk, encoding, next) {
    if(chunk.isNull()) {
      next();
      return;
    }

    if(chunk.isStream()) {
      throw new PluginError('circus', 'Streaming is not supported.');
    }

    next(null, chunk.contents.toString());
  });
}
