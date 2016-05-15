const yaml = require('js-yaml');
const through = require('through2');

module.exports = function createYamlToJsonStream() {
  return through(function(chunk, encoding, next) {
    const contents = chunk.toString();
    try {
      const json = yaml.safeLoad(contents);
      console.log('Converted to YAML');

      if(typeof json === 'string') {
        next();
        return;
      }

      next(null, JSON.stringify(json));
    } catch (ex) {
      next(ex);
    }
  });
};
