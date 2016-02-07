import renderer from '../lib/renderer';
import expect from 'expect.js';
import sinon from 'sinon';
import Handlebars from 'handlebars';

describe('renderer', function() {
  let templateRenderer;

  beforeEach(function() {
    templateRenderer = sinon.stub().returns('compiled value');
    sinon.stub(Handlebars, 'compile').returns(templateRenderer);
  });

  afterEach(function() {
    Handlebars.compile.restore();
  });

  it('returns a function', function() {
    expect(renderer).to.be.a('function');
  });

  describe('when renderer is initialised', function() {

    let render;

    beforeEach(function() {
      render = renderer('some template');
    });

    it('compiles a template', function() {
      expect(Handlebars.compile.withArgs('some template').calledOnce)
        .to.be(true);
    });

    it('renders each data element', function() {
      render([
        { some: 'value' },
        { other: 'value' }
      ]);

      expect(templateRenderer.callCount).to.be(1);
    });
  });
});
