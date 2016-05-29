(function(ns, d3) {

  'use strict';

  /**
   * Base class for all components
   *
   * @class
   * @memberof stepViz.components
   * @abstract
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
   * Returns or set value of the component.
   * If new value is not specified, existing value is returned.
   *
   * @param {Object} [value] - New value to be saved in state
   * @return {Object} Value associated with the component.
   */
  ns.components.Component.prototype.value = function(newValue) {
    if (typeof newValue != 'undefined') {
      // set new value
      this._state.value = newValue;
    }
    return this._state.value;
  };

  /**
   * Returns parent of the component or null for root component.
   *
   * @return {stepViz.components.Component} Parent component
   */
  ns.components.Component.prototype.parent = function() {
    return this._state.parent;
  };

  /**
   * Returns or set value of the specified state property.
   * If value is not specified, existing value is returned.
   *
   * @param {String} property - State property name
   * @param {Object} [value] - Value to be saved
   * @return {Object} State property value
   */
  ns.components.Component.prototype.state = function(property, value) {

    if (typeof property != 'string') {
      throw 'Invalid property name';
    }

    if (typeof value != 'undefined') {
      // set new value
      this._state[property] = value;
    }
    // return existing value
    return this._state[property];

  };

  /**
   * Returns layout of the component.
   *
   * @return {stepViz.Layout} Layout
   */
  ns.components.Component.prototype.layout = function() {
    return this._state.layout;
  };

  /**
   * Create a layout with current component as parent.
   *
   * @param {Object} box - Layout box object
   * @param {Object} margin - Layout margin object
   * @return {stepViz.Layout} New layout
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
   * Set SVGElement of the component.
   *
   * @param {Array} d3 selector corresponding to SVGElement.
   */
  ns.components.Component.prototype.setSVG = function(svgElem) {
    this._state.svgElem = svgElem;
  };

  /**
   * Redraws component
   * @abstract
   */
  ns.components.Component.prototype.redraw = function() {
    // Needs to be implemented in the child class
    throw 'Not implemented on Component base class';
  };

  /**
   * Redraws all children of current component.
   */
  ns.components.Component.prototype.redrawAllChildren = function() {
    for (var i = 0; i < this._state.children.length; i++) {
      this._state.children[i].redraw();
    }
  };

  /**
   * Add a child component to current component.
   *
   * @param {stepViz.components.Component} child - Child component
   */
  ns.components.Component.prototype.addChild = function(child) {
    this._state.children.push(child);
  };

  /**
   * Returns child component at specified index or null if not available.
   *
   * @param {Number} index - Child component index
   * @return {stepViz.components.Component} Child component
   */
  ns.components.Component.prototype.child = function(index) {
    if (index >= 0 && index < this._state.children.length) {
      return this._state.children[index];
    }
    return null;
  };

  /**
   * Clone state properties from the component.
   *
   * @param {Array} excludeProps - Array of properties to exclude while cloning.
   * @return {Object} Cloned properties object
   */
  ns.components.Component.prototype.cloneProps = function(excludeProps) {

    excludeProps = excludeProps || [];

    var state = this._state;

    var props = {};
    var discardProps = ['value', 'layout', 'parent', 'svgElem', 'children'].concat(excludeProps);
    for (var prop in state) {
      if (state.hasOwnProperty(prop) && discardProps.indexOf(prop) == -1) {
        props[prop] = ns.util.objClone(state[prop]);
      }
    }

    return props;

  };

}(window.stepViz, window.d3));
