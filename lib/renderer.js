import Handlebars from 'handlebars';

export default function renderer(template) {
  return Handlebars.compile(template);
}

export function registerPartial(name, template) {
  Handlebars.registerPartial(name, template);
}
