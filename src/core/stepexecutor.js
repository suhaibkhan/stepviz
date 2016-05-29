
(function(ns) {

  'use strict';

  ns.StepExecutor = function() {
    this._currentStepIndex = -1;
    this._steps = [];
  };

  ns.StepExecutor.prototype.add = function(stepFn, clearFn, noOfTimes){
    noOfTimes = noOfTimes || 1;
    stepFn = stepFn || function(){};
    clearFn = clearFn || function(){};
    if (typeof stepFn != 'function' || typeof clearFn != 'function'){
      throw Error('Invalid argument');
    }
    for (var i = 0; i < noOfTimes; i++){
      this._steps.push({forward: stepFn, backward: clearFn});
    }
  };

  ns.StepExecutor.prototype.hasNext = function(){
    return (this._currentStepIndex + 1 < this._steps.length);
  };

  ns.StepExecutor.prototype.hasBack = function(){
    return (this._currentStepIndex >= 0);
  };

  ns.StepExecutor.prototype.next = function(context){
    if (this._currentStepIndex + 1 >= this._steps.length ){
      throw Error('No forward steps');
    }
    this._currentStepIndex++;
    this._steps[this._currentStepIndex].forward.call(context);
  };

  ns.StepExecutor.prototype.back = function(context){
    if (this._currentStepIndex < 0){
      throw Error('No backward steps');
    }
    this._steps[this._currentStepIndex].backward.call(context);
    this._currentStepIndex--;
  };

}(window.stepViz));
