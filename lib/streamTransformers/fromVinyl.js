const through2 = require('through2');
const { PluginError } = require('gulp-util');

module.exports = function createFromVinylStream() {

  return through2.obj(function(chunk, encoding, next) {
    if(chunk.isNull()) {
      next();
      return;
    }

    if(chunk.isStream()) {
      throw new PluginError('circus', 'Streaming is not supported.');
    }

    console.log('Vinyl file received:', chunk.path);

    next(null, chunk.contents.toString());
  });
};
