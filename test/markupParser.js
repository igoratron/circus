import getMarkup from '../lib/markupParser.js';
import expect from 'expect.js';

describe('getMarkup', function() {

  it('is a function', function() {
    expect(getMarkup).to.be.a('function');
  });

  it('converts a simple commented yaml into a json obj', function() {
    const fixture = `// some: value`;

    expect(getMarkup(fixture)).to.eql([{
      some: 'value'
    }]);
  });

  it('converts yaml with multiple sections', function() {
    const fixture = multilineString(
      '// some: value',
      'some other text',
      '// another: value'
    );

    expect(getMarkup(fixture)).to.eql([
      { some: 'value' },
      { another: 'value' }
    ]);
  });
});

function multilineString(...strings) {
  return strings.join('\n');
}
