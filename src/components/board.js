(function(ns, d3) {

  'use strict';

  ns.constants.MAIN_CSS_CLASS = 'stepViz';
  ns.constants.BOARD_PROP_LIST = ['margin'];

  ns.components.Board = function(container, props) {
    if (typeof container === 'string') {
      container = document.getElementById(container);
    } else if (!(container instanceof HTMLElement)) {
      throw 'Invalid container';
    }

    this._state = ns.util.defaults(props, {
      margin: {
        top: 10,
        left: 10,
        bottom: 10,
        right: 10
      }
    });

    // generate layout to fill board in container
    this._state.layout = new ns.Layout(container, {}, this._state.margin);

    // no parent for Board
    this._state.parent = null;

    var compBounds = this._state.layout.getBounds();
    var compBox = this._state.layout.getBox();

    this._state.svgElem = d3.select(container)
      .append('svg')
      .attr('width', compBounds.width)
      .attr('height', compBounds.height)
      .append('g')
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')')
      .attr('class', ns.constants.MAIN_CSS_CLASS + ' ' + ns.config.themeCSSClass);

    this._state.children = [];

  };

  ns.components.Board.prototype.redraw = function() {

    // recalculate layout
    this._state.layout.reCalculate();
    // update
    var compBounds = this._state.layout.getBounds();
    var svgRoot = d3.select(this._state.svgElem.node().parentNode);
    svgRoot.attr('width', compBounds.width)
      .attr('height', compBounds.height);

    for (var i = 0; i < this._state.children.length; i++) {
      this._state.children[i].redraw();
    }

  };

  ns.components.Board.prototype.svg = function(){
    return this._state.svgElem;
  };

  ns.components.Board.prototype.getLayout = function() {
    return this._state.layout;
  };

  ns.components.Board.prototype.drawArray = function(array, layout, props) {
    var arrayComp = new ns.components.Array(this, array, layout, props);
    this._state.children.push(arrayComp);
    return arrayComp;
  };

  ns.components.Board.prototype.createLayout = function(box, margin) {
    return new ns.Layout(this, box, margin);
  };

}(window.stepViz, window.d3));
