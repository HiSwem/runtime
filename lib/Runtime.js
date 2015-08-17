'use strict';

var util = require('./util');
var Stack = require('./Stack');

exports = module.exports = Runtime;

/**
 Missing docs
**/
function Runtime(props){
  if(!(this instanceof Runtime)){
    return new Runtime(props);
  }

  util.merge(this, util.type(props).plainObject);
}

/**
  Missing docs
**/
Runtime.prototype.Stack = Stack;
Runtime.prototype.isHandle = util.isFunction;
Runtime.prototype.onHandle = function(){ };
Runtime.prototype.onHandleError = function(err){ throw err; };

/**
  Missing docs
**/
Runtime.prototype.stack = function(/* functions... */){
  var fns = util.slice(arguments);
  var self = this;
  var props = util.type(fns[fns.length-1]).plainObject && fns.pop();

  composer.stack = new self.Stack(fns);
  // this way the composer is identifiable
  function composer(next, handle, host){
    var stack = util.merge(fns.filter(self.isHandle, self), props);
    if(handle === composer){ // we are inside other stack
      stack.host = host;
      stack.args = host.wait ? host.args : host.args.concat();
      stack.callback = next;
    } else {
      stack.host = false;
      stack.args = util.slice(arguments);
      stack.callback = typeof arguments[arguments.length-1] === 'function'
        ? stack.args.pop()
        : self.onHandleError;
    }
    stack.index = 0;
    stack.context = stack.context || self;
    return tick(stack);
  }

  // runs each handle
  function tick(stack){
    var handle = stack[stack.index];
    stack.next = ++stack.index < stack.length;
    var args = [next].concat(handle.stack instanceof Stack
      ? [handle, stack] : stack.args
    );

    util.asyncDone(function onNext(){
      next.wait = Boolean(stack.wait);
      self.onHandle(next, handle, stack);
      var result = handle.apply(stack.context, args);
      if(next.wait){ return result; }
      if(stack.next){ tick(stack); }
      if(stack.host.next){ tick(stack.host); }
      return result;
    }, next);

    function next(err){
      if(err instanceof Error){
        return stack.callback.call(self, err, handle, stack);
      } else if(next.wait && arguments.length){
        util.mapPush(stack.args, arguments,
          util.type(err).match(/null|undefined|error/) ? 1 : 0
        );
      }

      next.end = true; --stack.index;
      stack.splice(stack.indexOf(handle), 1);
      self.onHandle(next, handle, stack);

      if(stack.next){ tick(stack); }
      else if(stack.host.next){ tick(stack.host); }

      if(!stack.length){
        return stack.callback.apply(self, [null].concat(stack.args));
      }
    }

    return self;
  }

  return composer;
};