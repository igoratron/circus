const _ = require('lodash');
const through = require('through2');

const openComment = /\/\*/;
const closeComment = /\*\//;

module.exports = function createCssToYamlStream() {
  return through(function(chunk, encoding, next) {
    try {
      const contents = chunk.toString();
      const sections = extractYAMLSections(contents);
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this
      sections.forEach(push);
      next();
    } catch (e) {
      next(e);
    }
  });
};

function extractYAMLSections(block) {
  return block
    .split('\n')
    .reduce(makeCommentChunks(), [])
    .map(lines => lines.map(stripStars))
    .map(lines => lines.filter(_.negate(_.isEmpty)))
    .map(lines => lines.join('\n'))
}

function makeCommentChunks() {
 let isInsideComment = false;

 return function(blocks, line) {
   if(openComment.test(line)) {
     isInsideComment = true;
     blocks.push([]);
   } else if(closeComment.test(line)) {
     isInsideComment = false;
   } else if(isInsideComment) {
     _.last(blocks).push(line);
   }

   return blocks;
 };
}

function stripStars(block) {
  return block.replace(/^\s*\*/, '');
}
