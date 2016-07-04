const chai = require('chai');
const expect = chai.expect;

const cssToYaml = require('../../lib/streamTransformers/cssToYaml');
const streamContainsHelper = require('../../lib/utils/chaiStreamHelper');
const streamFrom = require('../../lib/utils/streamFrom');

chai.use(streamContainsHelper);

describe('cssToYaml', function() {

  it('converts a simple commented yaml into a json obj', function() {
    const fixture = `
      /*
       * some: value
       */
    `;

    const output = streamFrom([fixture])
      .pipe(cssToYaml());

    return expect(output).to.be.a.stream([' some: value']);
  });

  it('converts yaml with multiple sections', function() {
    const fixture = `
      /*
       * some: value
       */
      some other text
      /*
       * another: value
       */
    `;

    const output = streamFrom([fixture])
      .pipe(cssToYaml());

    return expect(output).to.be.a.stream([
      ' some: value',
      ' another: value'
    ]);
  });

  it('does not treat anything selectors as documentation', function() {
    const fixture = `
      /*
       * some: value
       */

      * {
        css: property;
      }

      /*
       * another: value
       */
    `;

    const output = streamFrom([fixture])
      .pipe(cssToYaml());

    return expect(output).to.be.a.stream([
      ' some: value',
      ' another: value'
    ]);
  });

  it('can handle empty lines', function() {
    const fixture = `
    /**
     *
     * some: value
     */
    `;
    const output = streamFrom([fixture])
      .pipe(cssToYaml());

    return expect(output).to.be.a.stream([
      ' some: value'
    ]);
  });

  it('preserves indentation ', function() {
    const fixture = `
    /**
     * some: value
     * another: value
     */
    `;
    const output = streamFrom([fixture])
      .pipe(cssToYaml());

    return expect(output).to.be.a.stream([
      [' some: value', ' another: value'].join('\n')
    ]);
  });

  it('ignores single line comments');
});

