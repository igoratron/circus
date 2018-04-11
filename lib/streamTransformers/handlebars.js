const Handlebars = require('handlebars');
const promisify = require('promisify-node');
const globAsync = require('glob').glob;
const _ = require('lodash');
const through = require('through2');
const marked = require('marked');
const fs = require('fs');

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

function depthIteration(obj, depth) {
  if(depth === 1) {
    obj.depth = depth;
  }

  for(key in obj) {
    obj[key].depth = depth;

    if(obj[key].hasOwnProperty('children')) {
      depthIteration(obj[key]['children'], depth + 1);
    }
  }

  return obj;
}


module.exports = function createHandlebarsStream({ homepage, leaf, tableOfContents, partials, helpers, debug = false }) {
  const homepageTemplate = compileTemplate(fs.readFileSync(homepage, 'utf8'));
  const leafTemplate = compileTemplate(fs.readFileSync(leaf, 'utf8'));

  const tableOfContentsTemplate = compileTemplate(fs.readFileSync(tableOfContents, 'utf8'));

  const partialsLoaded = registerGlobPartials(partials, debug);

  let docsBySection;

  return through(
    function(chunk, encoding, next) {
      docsBySection = JSON.parse(chunk.toString());
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      Handlebars.registerHelper('sidebar', (options) => {
        const docsBySectionWithDepth = depthIteration(docsBySection, 1);

        return options.fn(docsBySectionWithDepth);
      });
      
      Object.entries(helpers)
        .forEach(( [name, fn] ) => Handlebars.registerHelper(name, fn.bind(null, docsBySection)));

      try {
        partialsLoaded.then(() => {
          generatePages(tableOfContentsTemplate, leafTemplate, docsBySection)
            .map(JSON.stringify)
            .forEach(push);
          next();
        })
        .catch((e) => console.log(e));
      } catch (e) {
        next(e);
      }
    },
    function(done) {
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      try {
        push(JSON.stringify({
          name: 'index',
          contents: homepageTemplate()
        }));
        done();
      } catch(e) {
        done(e);
      }
    }
  );
};

function generatePages(tableOfContentsTemplate, leafTemplate, sections) {
  let result = [];

  _.forOwn(sections, function(section) {
    const path = section.section + '/index';
    if(section.hasOwnProperty('children')) {
      result.push({
        name: path,
        contents: tableOfContentsTemplate(section)
      });
      const children = generatePages(tableOfContentsTemplate, leafTemplate, section.children)
      result = result.concat(children);
    } else {
      result.push({
        name: path,
        contents: leafTemplate(section)
      });
    }
  });

  return result;
}

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
              console.log(`Registering partial: ${path}`);
            }
            return Handlebars.registerPartial(path, compileTemplate(contents))
          }
        )
    )
    .catch(e => console.log(e));
}

function loadPartials(globs) {
  return Promise
    .all(globs.map(path => resolveGlob(path)))
    .then(_.flatten)
    .then(paths =>
      Promise.all(
        paths.map(path => {
          return {
            path,
            contents: fs.readFileSync(path, 'utf8')
          };
        })
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
