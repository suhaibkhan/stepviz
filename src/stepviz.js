
(function() {

  'use strict';

  if (typeof window.d3 === 'undefined') {
    throw 'd3 library not found.';
  }

  // init namespaces
  var ns = {};
  ns.components = {};
  ns.constants = {};
  ns.config = {};

  // default config
  ns.config.cssClass = 'stepViz';
  ns.config.highlightClass = 'highlight';

  ns.init = function(container, props) {
    return new ns.Board(container, props);
  };

  // set as global
  window.stepViz = ns;

}());
