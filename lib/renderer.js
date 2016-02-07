import Handlebars from 'handlebars';

export default function renderer(template) {
  return Handlebars.compile(template);
}
