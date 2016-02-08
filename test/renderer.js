import renderer, { registerPartial } from '../lib/renderer';
import expect from 'expect.js';
import sinon from 'sinon';
import Handlebars from 'handlebars';
import marked from 'marked';

describe('renderer', function() {
  let templateRenderer;

  before(function() {
    templateRenderer = sinon.stub().returns('compiled value');
    sinon.stub(Handlebars, 'compile').returns(templateRenderer);
  });

  it('returns a function', function() {
    expect(renderer).to.be.a('function');
  });

  describe('when renderer is initialised', function() {

    let render;

    before(function() {
      render = renderer('some template');
    });

    it('compiles a template', function() {
      expect(Handlebars.compile.withArgs('some template').calledOnce)
        .to.be(true);
    });

    describe('when a template is compiled with data', function() {

      let result;

      before(function() {
        sinon.stub(marked, 'parse').returns('compiled markdown');
        result = render('some data');
      });

      it('passes the result of handlebars into marked', function() {
        expect(marked.parse.withArgs('compiled value').calledOnce).to.be(true);
      });

      it('returns markdown', function() {
        expect(result).to.be('compiled markdown');
      });
    });
  });
});

describe('registerPartial', function() {

  before(function() {
    sinon.stub(Handlebars, 'registerPartial');
  });

  it('returns a function', function() {
    expect(registerPartial).to.be.a('function');
  });

  it('calls Handlebars.registerHelper', function() {
    registerPartial('some name', 'some template');
    expect(
      Handlebars.registerPartial
        .withArgs('some name', 'some template').calledOnce
    ).to.be(true);
  });
});
