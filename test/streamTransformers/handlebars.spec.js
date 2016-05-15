const Handlebars = require('handlebars');
const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const handlebars = require('../../lib/streamTransformers/handlebars');
const streamContainsHelper = require('../../lib/utils/chaiStreamHelper');
const streamFrom = require('../../lib/utils/streamFrom');

chai.use(streamContainsHelper);
chai.use(sinonChai);

describe('handlebars', function() {
  let indexDefered;
  let pageDefered;
  let indexReadFile;
  let pageReadFile;
  let mockfs;

  beforeEach(function() {
    indexDefered = makeDefered();
    pageDefered = makeDefered();

    mockfs = sinon.mock(fs);
    indexReadFile = mockfs.expects('readFile')
        .withArgs('some-index', 'utf8')
        .returns(indexDefered.promise);
    pageReadFile = mockfs.expects('readFile')
        .withArgs('some-page', 'utf8')
        .returns(pageDefered.promise);

    sinon.spy(Handlebars, 'compile');

    handlebars({
      index: 'some-index',
      page: 'some-page'
    });
  });

  afterEach(function() {
    mockfs.verify();
    Handlebars.compile.restore();
  });

  it('reads the index template', function() {
    expect(indexReadFile).to.have.been.calledWith('some-index', 'utf8');
  });

  describe('when the index template loads', function() {

    beforeEach(function() {
      indexDefered.resolve('some index template');
    });

    it('compiles the template', function() {
      return indexDefered.promise.then(() => {
        expect(Handlebars.compile).to.have.been.calledWith('some index template');
      });
    });
  });

  it('reads the page template', function() {
    expect(pageReadFile).to.have.been.calledWith('some-page', 'utf8');
  });

  describe('when the page template loads', function() {

    beforeEach(function() {
      pageDefered.resolve('some page template');
    });

    it('compiles the template', function() {
      return pageDefered.promise.then(() => {
        expect(Handlebars.compile).to.have.been.calledWith('some page template');
      });
    });
  });
});

function makeDefered() {
  const result = {};

  result.promise = new Promise(function(resolve, reject) {
    result.resolve = resolve;
    result.reject = reject;
  });

  return result;
}
