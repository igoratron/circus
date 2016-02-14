import through from 'through2';

const openComment = /\/\*/;
const closeComment = /\*\//;

export default function createCssToYamlStream() {
  return through(function(chunk, encoding, next) {
    const contents = chunk.toString();
    const sections = extractYAMLSections(contents);
    const push = this.push.bind(this); //eslint-disable-line no-invalid-this

    sections.forEach(push);
    next();
  });
}

function extractYAMLSections(block) {
  return block
    .split('\n')
    .reduce(filterComments(), [])
    .map(lines => lines.join('\n'))
    .map(block => block.replace(/^\s*\*\s*/mg, ''));
}

function filterComments() {
 let isInsideComment = false;

 return function(blocks, line) {
   if(openComment.test(line)) {
     isInsideComment = true;
     blocks.push([]);
   } else if(closeComment.test(line)) {
     isInsideComment = false;
   } else if(isInsideComment) {
     blocks[blocks.length - 1].push(line);
   }

   return blocks;
 };
}
