
(function() {

  'use strict';

  // check for dependencies
  if (typeof window.d3 === 'undefined') {
    throw 'd3 library not found.';
  }

  // init namespaces
  var ns = {};
  ns.components = {};
  ns.constants = {};

  // set as global
  window.stepViz = ns;

}());
