'use strict';

var Runtime = require('../.');

it('onHandle is called before and after each site', function(done){
  var count = 0;

  var runtime = Runtime.create({
    onHandle: function(){
      ++count;
    }
  });

  function one(next){ next(); }
  function two(next){ next(); }

  runtime.stack(one, two)(function(err){
    if(err){ return done(err); }
    count.should.be.eql(4);
    done();
  });
});

it('nested: onHandle is called before and after each site', function(done){
  var count = 0;

  var runtime = Runtime.create({
    onHandle: function(){
      ++count;
    }
  });

  function one(next){ next(); }
  function two(next){ next(); }

  runtime.stack(one, runtime.stack(two))(function(err){
    if(err){ return done(err); }
    count.should.be.eql(6);
    done();
  });
});

it('context for each stack can be given {context: [Object]}', function(done){
  var runtime = Runtime.create();

  runtime.stack(function one(next){
    this.params.should.be.eql(1);
    next();
  }, {context: {params: 1}})(function(err){
    if(err){ return done(err); }
    done();
  });
});

it('can be reused with no side-effects', function(done){
  var count = 0;
  var runtime = Runtime.create();

  var stack = runtime.stack(function one(next){
    ++count;
    this.param = ++this.param;
    this.param.should.be.eql(1);
    next();
  }, {context: {param: 0}});

  runtime.stack(stack, stack)(function(err){
    if(err){ done(err); }
    count.should.be.eql(2);
    done();
  });
});