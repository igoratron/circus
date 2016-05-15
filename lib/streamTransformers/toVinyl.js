const { Buffer } = require('buffer');
const through2 = require('through2');
const { File } = require('gulp-util');

module.exports = function createToVinylStream() {

  return through2.obj(function(chunk, encoding, next) {
    const file = JSON.parse(chunk.toString());

    console.log(`Converting to vinyl ${file.name}`);

    next(null, new File({
      path: `${file.name}.html`,
      contents: new Buffer(file.contents)
    }))
  });
};
