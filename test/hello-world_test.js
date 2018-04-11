/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const chai = require('chai');
const sinon = require('sinon');
chai.use(require('sinon-chai'));

const { expect } = chai;

describe('hello-world', function() {
  beforeEach(function() {
    this.robot = {
      respond: sinon.spy(),
      hear: sinon.spy()
    };

    return require('../src/hello-world')(this.robot);
  });

  it('registers a respond listener', function() {
    return expect(this.robot.respond).to.have.been.calledWith(/hello/);
  });

  return it('registers a hear listener', function() {
    return expect(this.robot.hear).to.have.been.calledWith(/orly/);
  });
});
