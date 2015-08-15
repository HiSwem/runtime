'use strict';

var Runtime = require('../');

it('create() should return a new instance', function(){
  var runtime = Runtime.create();
  runtime.constructor.should.be.eql(Runtime);
});

it('createClass() should return a new constructor', function(){
  var Ctor = Runtime.createClass();
  Ctor.super_.should.be.eql(Runtime);
  (new Ctor()).constructor.should.be.eql(Ctor);
});

it('create(object props) should give the instance properties', function(){
  var props = {name : 'name'};
  var runtime = Runtime.create(props);
  runtime.should.have.properties(props);
});

it('createClass(object mixin) mixin with new constructor', function(){
  var mixin = {method: function(){}};
  var Ctor = Runtime.createClass(mixin);
  Ctor.prototype.should.have.property('method', mixin.method);
});
