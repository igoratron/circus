import chai, { expect } from 'chai';

import streamContainsHelper from '../../lib/utils/chaiStreamHelper';
import streamFrom from '../../lib/utils/streamFrom';
import yamlToJson from '../../lib/streamTransformers/yamlToJson';

chai.use(streamContainsHelper);

describe('cssToYaml', function() {

  it('converts a simple yaml', function() {
    const fixture = `some: value`;

    const output = streamFrom([fixture])
      .pipe(yamlToJson());

    return expect(output).to.be.a.stream([
      JSON.stringify({ some: 'value' })
    ]);
  });

  it('converts multiple yaml docs', function() {
    const fixture = [
     'some: value',
     'another: value'
    ];

    const output = streamFrom(fixture)
      .pipe(yamlToJson());

    return expect(output).to.be.a.stream([
      JSON.stringify({ some: 'value' }),
      JSON.stringify({ another: 'value' })
    ]);
  });
});
