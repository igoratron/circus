import _ from 'lodash';
import through from 'through2';

const openComment = /\/\*/;
const closeComment = /\*\//;

export default function createCssToYamlStream() {
  return through(function(chunk, encoding, next) {
    const contents = chunk.toString();
    const sections = extractYAMLSections(contents);
    const push = this.push.bind(this); //eslint-disable-line no-invalid-this

    console.log(`Extracted ${sections.length} sections`);

    sections.forEach(push);
    next();
  });
}

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
