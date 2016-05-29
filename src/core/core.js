(function(ns) {

  'use strict';

  ns.init = function(container, props) {
    return new ns.components.Canvas(container, props);
  };

  ns.initStepExecutor = function(){
    return new ns.StepExecutor();
  };

}(window.stepViz));
