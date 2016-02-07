import yaml from 'js-yaml';
import { isPlainObject } from 'lodash';

const openComment = /\/\*/;
const closeComment = /\*\//

export default function getMarkup(string) {
  const yamlSections = extractYAMLSections(string);
  const yamlDocuments = Array.of(
    '---\n',
    ...yamlSections.map(appendDocumentBreak),
    '...\n'
  ).join('');

  return parseYAML(yamlDocuments)
    .filter(isPlainObject);
}

function extractYAMLSections(block) {
  return block
    .split('\n')
    .reduce(filterComments(), [])
    .map(lines => lines.join('\n'))
    .map(block => block.replace(/^\s*\*/mg, ''));
}

function appendDocumentBreak(section) {
  return section + '\n...\n---\n'
}

function parseYAML(documents) {
  const result = [];
  yaml.safeLoadAll(documents, doc => result.push(doc));
  return result;
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
