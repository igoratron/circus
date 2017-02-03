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


function breadcrumbsGetLabel(path, sections) {

  const items = path.split('/');
  const itemsLength = items.length;

  let label = sections;

  for(let i = 0; i < itemsLength; i++) {
    if(i < itemsLength - 1 && label[items[i]].hasOwnProperty('children')) {
      label = label[items[i]]['children'];
    } else {
      label = label[items[i]];
    }
  }

  return label['title'];
};


function breadcrumbsToArray(path, sections) {
  let result = [];

  path.split('/')
      .reduce((finalPath, el) => {
        const composedPath = finalPath + el;
        const breadcrumbLabel = breadcrumbsGetLabel(composedPath, sections);

        result.push({
            label: breadcrumbLabel,
            path: composedPath + '/'
          });

        return composedPath + '/';
      }, '');

  return result;
}


function breadcrumbsTemplate(path, sections) {

  const breadcrumbItems = breadcrumbsToArray(path, sections);
  const breadcrumbItemsLength = breadcrumbItems.length;

  let html = '';


  if(breadcrumbItems.length > 1) {
    for(let i = 0; i < breadcrumbItemsLength; i++) {
      if(i == breadcrumbItemsLength - 1) {
        html += `<span class="breadcrumbs__item breadcrumbs__item--last">${breadcrumbItems[i].label}</span>`;
      } else {
        html += `<a href="/${breadcrumbItems[i].path}" class="breadcrumbs__item">${breadcrumbItems[i].label}</a><span class="breadcrumbs__separator"></span>`;
      }
    }

    html = `<nav class="breadcrumbs">${html}</nav>`;
  }

  return html;
}


function generateSidebar(sections, index = 0) {
  let html = '';
  _.forOwn(sections, function(section) {
    let sectionHtml = `<a href="/${section.section}/">${section.title}</a>`;

    if(section.hasOwnProperty('children')) {
      sectionHtml += generateSidebar(section.children, (index + 1));
    }

    html += `<li>${sectionHtml}</li>`;
  });

  return `<ul class="sidebar-nav sidebar-nav--level-${index}">${html}</ul>`;
}




module.exports = function createHandlebarsStream({homepage, leaf, tableOfContents, partials, debug = false}) {
  const homepageTemplate = compileTemplate(fs.readFileSync(homepage, 'utf8'));
  const leafTemplate = compileTemplate(fs.readFileSync(leaf, 'utf8'));

  const tableOfContentsTemplate = compileTemplate(fs.readFileSync(tableOfContents, 'utf8'));

  const partialsLoaded = registerGlobPartials(partials, debug);

  let docsBySection;

  return through(
    function(chunk, encoding, next) {
      docsBySection = JSON.parse(chunk.toString());
      const push = this.push.bind(this); //eslint-disable-line no-invalid-this

      const sidebarTemplate = generateSidebar(docsBySection);

      Handlebars.registerPartial('sidebar', sidebarTemplate);

      Handlebars.registerHelper('breadcrumbs', (path) =>
        breadcrumbsTemplate(path, docsBySection)
      );

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
