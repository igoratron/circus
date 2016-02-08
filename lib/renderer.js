import Handlebars from 'handlebars';
import marked from 'marked';
import registrar from 'handlebars-registrar';

Handlebars.registerHelper('markdown', function(text) {
  if(!text) {
    return text;
  }

  return new Handlebars.SafeString(marked(text));
});

Handlebars.registerHelper('escapePartial', function(partialName) {
  var partial = Handlebars.partials[partialName];
  return partial();
});

export default function renderer(template) {
  return Handlebars.compile(template);
}

export function registerPartials(paths) {
  registrar(Handlebars, {
    partials: paths
  });
}
