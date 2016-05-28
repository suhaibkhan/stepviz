(function(ns, d3) {

  'use strict';

  /**
   * Base class for all components
   *
   * @class
   * @memberof stepViz.components
   */
  ns.components.Component = function(parent, value, layout, props, defaults) {
    // default values for props
    defaults = defaults || {};

    if (typeof value == 'undefined') {
      throw 'Invalid value';
    }

    if (!layout) {
      throw 'Invalid layout';
    }

    this._state = ns.util.defaults(props, defaults);
    this._state.parent = parent;
    this._state.value = value;
    this._state.layout = layout;
    this._state.children = [];
    // will be defined in child class
    this._state.svgElem = null;

  };

  /**
   * Returns layout of the component.
   *
   * @return {stepViz.Layout} layout
   */
  ns.components.Component.prototype.getLayout = function() {
    return this._state.layout;
  };

  /**
   * Create a layout with current component as parent.
   *
   * @param {Object} box - Layout box object
   * @param {Object} margin - Layout margin object
   * @return {stepViz.Layout} new layout
   */
  ns.components.Component.prototype.createLayout = function(box, margin) {
    return new ns.Layout(this, box, margin);
  };

  /**
   * Update layout associated with current component.
   *
   * @param {Object} box - New layout box object
   * @param {Object} margin - New layout margin object
   */
  ns.components.Component.prototype.updateLayout = function(box, margin) {
    return this._state.layout.setBox(box, margin);
  };

  /**
   * Returns SVG container of the component. Usually an SVG group.
   *
   * @return {Array} d3 selector corresponding to SVGElement of the component.
   */
  ns.components.Component.prototype.svg = function() {
    return this._state.svgElem;
  };

  /**
   * Redraws component
   * @abstract
   */
  ns.components.Component.prototype.redraw = function() {
    // needs to be implemented in the child class
    throw 'Not implemented';
  };

}(window.stepViz, window.d3));
