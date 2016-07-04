const through2 = require('through2');

module.exports = function createFromVinylStream() {

  return through2.obj(function(chunk, encoding, next) {
    if(chunk.isNull()) {
      next();
      return;
    }

    if(chunk.isStream()) {
      next(Error('Streaming is not supported.'));
      return;
    }

    next(null, chunk.contents.toString());
  });
};
