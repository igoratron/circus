import transform from '../lib/transformer';
import expect from 'expect.js';

describe('transform', function() {

  it('returns a function', function() {
    expect(transform).to.be.a('function');
  });

  it('returns an empty object for empty array', function() {
    expect(transform([])).to.eql({});
  });

  it('merges objects into one', function() {
    expect(transform([
      { some: 'value' },
      { another: 'value' },
    ])).to.eql({
      some: 'value',
      another: 'value'
    });
  });

  it('throws when a key already exists', function() {
    expect(transform).withArgs([
      { some: 'value' },
      { some: 'value' },
    ]).to.throwException();
  });

  it('nests objects based on key', function() {
    expect(transform([
      { section: 'some', value: 'some value' },
      { section: 'another', value: 'some value' },
    ])).to.eql({
      'some': {
        section: 'some',
        value: 'some value'
      },
      'another': {
        section: 'another',
        value: 'some value'
      }
    })
  });

  it('nests multiple levels based on a path', function() {
    expect(transform([
      { section: 'section.some', value: 'some value' },
      { section: 'section.another', value: 'some value' },
    ])).to.eql({
      section: {
        some: {
          section: 'section.some',
          value: 'some value'
        },
        another: {
          section: 'section.another',
          value: 'some value'
        }
      }
    })
  });
});
