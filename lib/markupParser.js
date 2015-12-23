import yaml from 'js-yaml';
import { isEmpty, isNull } from 'lodash';

const not = fn => (...args) => ! fn(...args);

export default function getMarkup(string) {
  const yamlSections = extractYAMLSections(string);
  const yamlDocuments = Array.of(
    '---\n',
    ...yamlSections.map(appendDocumentBreak),
    '...\n'
  ).join('');

  return parseYAML(yamlDocuments)
    .filter(not(isNull));
}

function extractYAMLSections(block) {
  return block
    .split(/^\s*[^/]+/mg)
    .filter(not(isEmpty))
    .map(a => a.replace(/^\/\//mg, ''))
}

function appendDocumentBreak(section) {
  return section + '\n...\n---\n'
}

function parseYAML(documents) {
  const result = [];
  yaml.safeLoadAll(documents, doc => result.push(doc));
  return result;
}
