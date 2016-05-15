const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const aggregator = require('../../lib/streamTransformers/aggregator');
const streamContainsHelper = require('../../lib/utils/chaiStreamHelper');
const streamFrom = require('../../lib/utils/streamFrom');

chai.use(streamContainsHelper);

describe('aggregator', function() {

  const fixture = [
    JSON.stringify({ some: 'object' }),
    JSON.stringify({ another: 'object' })
  ];

  let grouping;
  let output;

  beforeEach(function() {
    grouping = sinon.mock()
        .twice()
        .returns('group');
    output = streamFrom(fixture)
        .pipe(aggregator(grouping));
  });

  it('groups JSON documents using the grouping function', function() {
    return expect(output).to.be.a.stream([
      JSON.stringify({
        'group': [
          { some: 'object' },
          { another: 'object' }
        ]
      })
    ]);
  });

  it('passes each object to the grouping function', function(done) {
    output
        .resume()
        .on('end', function() {
          expect(grouping.firstCall.calledWith({ some: 'object' })).to.be.true;
          expect(grouping.secondCall.calledWith({ another: 'object' })).to.be.true;

          done();
        });
  });
});
