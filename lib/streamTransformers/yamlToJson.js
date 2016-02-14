import yaml from 'js-yaml';
import through from 'through2';

export default function createYamlToJsonStream() {
  return through(function(chunk, encoding, next) {
    const contents = chunk.toString();
    const json = yaml.safeLoad(contents);
    next(null, JSON.stringify(json));
  });
}
