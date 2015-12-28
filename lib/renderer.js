import Handlebars from 'handlebars';
import _ from 'lodash';

export default function renderer(template) {
  const render = Handlebars.compile(template);

  return function(data, groupBy = defaultKey) {
    const groupedData = _.groupBy(data, groupBy);

    return _.mapValues(groupedData, render);
  }
}

function defaultKey() {
  return 'ungroupped';
}
