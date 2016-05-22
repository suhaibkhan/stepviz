(function(ns, d3) {

  'use strict';

  ns.Board = function(container, props) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    } else if (!(container instanceof HTMLElement)) {
      throw 'Invalid container';
    }

    this._container = container;
    this._props = ns.util.defaults(props, {
      margin: {
        top: 10,
        left: 10,
        bottom: 10,
        right: 10
      }
    });

    var margin = this._props.margin;
    this._width = this._container.offsetWidth - margin.left - margin.right;
    this._height = this._container.offsetHeight - margin.top - margin.bottom;

    this._svg = d3.select(this._container)
      .append('svg')
      .attr('width', this._width + margin.left + margin.right)
      .attr('height', this._height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    this._components = [];

  };

  ns.Board.prototype.redraw = function() {

    var margin = this._props.margin;
    this._width = this._container.offsetWidth - margin.left - margin.right;
    this._height = this._container.offsetHeight - margin.top - margin.bottom;

    var svgParent = d3.select(this._svg.node().parentNode);
    svgParent
      .attr('width', this._width + margin.left + margin.right)
      .attr('height', this._height + margin.top + margin.bottom);

    for (var i = 0; i < this._components.length; i++) {
      this._components[i].redraw();
    }

  };

  ns.Board.prototype.size = function() {
    return {
      width: this._width,
      height: this._height
    };
  };

  ns.Board.prototype.drawArray = function(array, layout, props) {
    var arrayComp = new ns.components.Array(this, array, layout, props);
    this._components.push(arrayComp);
    return arrayComp;
  };

  ns.Board.prototype.layout = function(box, margin) {
    var layout = new ns.Layout(this, box, margin);
    return layout;
  };

}(window.stepViz, window.d3));
