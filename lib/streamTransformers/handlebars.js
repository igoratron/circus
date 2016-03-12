import Handlebars from 'handlebars';
import promisify from 'promisify-node';
import { glob as globAsync } from 'glob';
import _ from 'lodash';
import through from 'through2';
import marked from 'marked';

const fs = promisify('fs');
const glob = promisify(globAsync);

Handlebars.registerHelper('markdown', function(text) {
  if(! text) {
    return text;
  }

  return new Handlebars.SafeString(marked(text));
});

Handlebars.registerHelper('escapePartial', function(partialName) {
  var partial = Handlebars.partials[partialName];
  if(! _.isFunction(partial)) {
    throw new Error(`Partial ${partialName} does not exist.`);
  }

  return partial();
});

export default function createHandlebarsStream({index, page, partials}) {
  const indexTemplate = fs.readFile(index, 'utf8')
      .then(compileTemplate);
  const pageTemplate = fs.readFile(page, 'utf8')
      .then(compileTemplate);
  const partialsLoaded = registerGlobPartials(partials);

  let docsBySection;

  return through(
    function(chunk, encoding, next) {
      docsBySection = JSON.parse(chunk.toString());
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      partialsLoaded
        .then(() => pageTemplate)
        .then(compile => ({ compile, groups: _.toPairs(docsBySection)}))
        .then(({ compile, groups }) =>
          groups
            .map(([ name, data ]) => ({ name, contents: compile(data) }))
         )
        .then(pages =>
          pages
            .map(JSON.stringify)
            .forEach(push)
        )
        .then(() => next())
        .catch(e => console.log(e));
    },
    function(done) {
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this
      indexTemplate
        .then(compile => ({ name: 'index', contents: compile(docsBySection) }))
        .then(JSON.stringify)
        .then(push)
        .then(() => done())
        .catch(e => console.log(e));
    }
  );
}

function compileTemplate(template) {
  return Handlebars.compile(template);
}

function registerGlobPartials(globs) {
  const commonPaths = globs.map(path => path.split('*')[0]);

  return Promise
    .all(globs.map(path => glob(path)))
    .then(_.flatten)
    .then(paths =>
      Promise.all(
        paths.map(path =>
          fs.readFile(path, 'utf8')
            .then(contents => ({path, contents}))
        )
      )
    )
    .then(partials =>
      partials.map(
        partial => {
          partial.path = commonPaths
            .reduce(
              (path, common) => path.replace(common, ''),
                partial.path
            );
          partial.path = partial.path.replace(/\.hbs/, '');
          return partial;
        }
      )
    )
    .then(partials =>
      partials
        .map(
          ({ path, contents }) =>
            Handlebars.registerPartial(path, compileTemplate(contents))
        )
    );
}
