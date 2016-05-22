(function(ns) {

  'use strict';

  ns.util = {};

  ns.util.defaults = function(props, defaults) {
    props = props || {};
    for (var prop in defaults) {
      if (defaults.hasOwnProperty(prop) && !props.hasOwnProperty(prop)) {
        props[prop] = defaults[prop];
      }
    }
    return props;
  };

  ns.util.objClone = function(obj) {
    var cloneObj = null;

    if (Array.isArray(obj)) {
      cloneObj = [];
      for (var i = 0; i < obj.length; i++) {
        cloneObj.push(ns.util.objClone(obj[i]));
      }
    } else if (typeof obj == 'object') {
      cloneObj = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          cloneObj[prop] = ns.util.objClone(obj[prop]);
        }
      }
    } else {
      cloneObj = obj;
    }
    return cloneObj;
  };

  ns.util.createTaskForPromise = function(fn, context, args) {
    return function() {
      return fn.apply(context, args);
    };
  };

}(window.stepViz));
