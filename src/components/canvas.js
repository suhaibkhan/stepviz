(function(ns, d3) {

  'use strict';

  ns.constants.MAIN_CSS_CLASS = 'stepViz';
  ns.constants.CANVAS_PROP_LIST = ['margin'];

  ns.components.Canvas = function(container, props) {

    if (typeof container === 'string') {
      container = document.getElementById(container);
    } else if (!(container instanceof HTMLElement)) {
      throw 'Invalid container';
    }

    props = props || {};
    props.margin = props.margin || {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10
    };
    var layout = new ns.Layout(container, {}, props.margin);

    ns.components.Component.call(this, null, null, layout, props, {});

    var compBounds = layout.getBounds();
    var compBox = layout.getBox();

    var svgElem = d3.select(container)
      .append('svg')
      .attr('width', compBounds.width)
      .attr('height', compBounds.height)
      .append('g')
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')')
      .attr('class', ns.constants.MAIN_CSS_CLASS + ' ' + ns.config.themeCSSClass);
    // save SVG element
    this.setSVG(svgElem);
  };

  // inherit from base class
  ns.util.inherits(ns.components.Component, ns.components.Canvas);

  ns.components.Canvas.prototype.redraw = function() {

    // recalculate layout
    this.layout().reCalculate();
    // update
    var compBounds = this.layout().getBounds();
    var svgRoot = d3.select(this.svg().node().parentNode);
    svgRoot.attr('width', compBounds.width)
      .attr('height', compBounds.height);

    this.redrawAllChildren();

  };

  ns.components.Canvas.prototype.drawArray = function(array, layout, props) {
    var arrayComp = new ns.components.Array(this, array, layout, props);
    this.addChild(arrayComp);
    return arrayComp;
  };

}(window.stepViz, window.d3));
