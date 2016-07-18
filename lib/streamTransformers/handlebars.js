const Handlebars = require('handlebars');
const promisify = require('promisify-node');
const globAsync = require('glob').glob;
const _ = require('lodash');
const through = require('through2');
const marked = require('marked');

const fs = promisify('fs');
const resolveGlob = promisify(globAsync);

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

module.exports = function createHandlebarsStream({index, page, partials, debug = false}) {
  const indexTemplate = fs.readFile(index, 'utf8')
      .then(compileTemplate);
  const pageTemplate = fs.readFile(page, 'utf8')
      .then(compileTemplate);
  const partialsLoaded = registerGlobPartials(partials, debug);

  let docsBySection;

  Handlebars.registerHelper('withAllSections', function(options) {
    return options.fn(docsBySection);
  });

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
        .catch(e => next(e));
    },
    function(done) {
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this
      indexTemplate
        .then(compile => ({ name: 'index', contents: compile(docsBySection) }))
        .then(JSON.stringify)
        .then(push)
        .then(() => done())
        .catch(e => done(e));
    }
  );
};

function compileTemplate(template) {
  return Handlebars.compile(template, {preventIndent: true});
}

function registerGlobPartials(globs, debug = false) {
  const commonPaths = globs.map(path => path.split('*')[0]);

  return loadPartials(globs)
    .then(_.partial(removeCommonPath, commonPaths))
    .then(partials =>
      partials
        .map(
          ({ path, contents }) => {
            if(debug) {
              console.log(`Registering partilal: ${path}`);
            }
            return Handlebars.registerPartial(path, compileTemplate(contents))
          }
        )
    );
}

function loadPartials(globs) {
  return Promise
    .all(globs.map(path => resolveGlob(path)))
    .then(_.flatten)
    .then(paths =>
      Promise.all(
        paths.map(path =>
          fs.readFile(path, 'utf8')
            .then(contents => ({path, contents}))
        )
      )
    );
}

function removeCommonPath(commonPaths, partials) {
  return partials.map(
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
}
