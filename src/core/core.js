(function(ns) {

  'use strict';

  ns.init = function(container, props) {
    return new ns.components.Board(container, props);
  };

}(window.stepViz));
