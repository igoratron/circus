import { Buffer } from 'buffer';
import through2 from 'through2';
import { File } from 'gulp-util';

export default function createToVinylStream() {

  return through2.obj(function(chunk, encoding, next) {
    const file = JSON.parse(chunk.toString());

    next(null, new File({
      path: `${file.name}.html`,
      contents: new Buffer(file.contents)
    }))
  });
}
