(function(ns, d3) {

  'use strict';

  // constants
  ns.constants.ARRAYITEM_CSS_CLASS = 'arrayItem';
  ns.constants.ARRAYITEM_PROP_LIST = ['fontSize', 'renderer'];

  function drawArrayItem(state) {

    var svgElem = state.svgElem;
    var compBox = state.layout.getBox();
    var value = state.value;
    var renderer = state.renderer;
    var fontSize = state.fontSize;

    // draw item
    var rectElem = svgElem.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', compBox.width)
      .attr('height', compBox.height);

    var textElem = svgElem.append('text')
      .text(renderer(value))
      .attr('x', 0)
      .attr('y', 0)
      .style('font-size', fontSize);

    // align text in center of rect
    var rectBBox = rectElem.node().getBBox();
    var textBBox = textElem.node().getBBox();

    textElem.attr('dx', (rectBBox.width - textBBox.width) / 2);
    textElem.attr('dy', (rectBBox.height - textBBox.height) / 2);

    // highlight
    toggleHighlight(state);

  }

  function toggleHighlight(state, props) {

    props = props || {};

    var svgElem = state.svgElem;
    var elemClass = svgElem.attr('class');

    // highlight if needed
    if (state.highlight) {
      if (elemClass.indexOf(ns.config.highlightCSSClass) == -1) {
        elemClass += ' ' + ns.config.highlightCSSClass;
      }
      // custom style for highlighting
      for (var prop in props) {
        if (props.hasOwnProperty(prop)) {
          if (prop.startsWith('rect-')) {
            svgElem.select('rect').style(prop.substring(5), props[prop]);
          } else if (prop.startsWith('text-')) {
            svgElem.select('text').style(prop.substring(5), props[prop]);
          }
        }
      }
    } else {
      elemClass = elemClass.replace(ns.config.highlightCSSClass, '');
      // remove custom highlighting
      // svgElem.select('rect').attr('style', null);
      //svgElem.select('text').attr('style', null);
    }
    svgElem.attr('class', elemClass);
  }

  ns.components.ArrayItem = function(parent, value, layout, props) {

    if (typeof value == 'undefined') {
      throw 'Invalid value';
    }

    if (!layout) {
      throw 'Invalid layout';
    }

    this._state = ns.util.defaults(props, {
      fontSize: ns.config.defaultFontSize,
      renderer: function(d) {
        if (d === null) {
          return '';
        } else {
          return JSON.stringify(d);
        }
      }
    });

    this._state.value = value;

    this._state.layout = layout;
    var compBox = layout.getBox();

    this._state.parent = parent;

    this._state.svgElem = parent.svg().append('g')
      .attr('class', ns.constants.ARRAYITEM_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    // draw
    drawArrayItem(this._state);
  };

  ns.components.ArrayItem.prototype.redraw = function() {

    if (!this._state || !this._state.svgElem) {
      throw 'ArrayItem redraw error - Invalid state or SVG';
    }

    // clear existing
    this._state.svgElem.selectAll('*').remove();
    // recalculate layout
    this._state.layout.reCalculate();
    // draw
    drawArrayItem(this._state);
  };

  ns.components.ArrayItem.prototype.svg = function() {
    return this._state.svgElem;
  };

  ns.components.ArrayItem.prototype.getLayout = function() {
    return this._state.layout;
  };

  ns.components.ArrayItem.prototype.updateLayout = function(box, margin) {
    return this._state.layout.setBox(box, margin);
  };

  ns.components.ArrayItem.prototype.highlight = function(props) {
    this._state.highlight = true;
    toggleHighlight(this._state, props);
  };

  ns.components.ArrayItem.prototype.unhighlight = function() {
    this._state.highlight = false;
    toggleHighlight(this._state);
  };

  ns.components.ArrayItem.prototype.translate = function(x, y, animate) {
    var that = this;
    return new Promise(function(resolve, reject) {
      // animate by default
      if (animate !== false) animate = true;
      // update layout
      that._state.layout.translate(x, y);

      var elem = that._state.svgElem;
      var transform = d3.transform(elem.attr('transform'));
      // add to existing translate
      transform.translate = [transform.translate[0] + x, transform.translate[1] + y];
      if (animate) {
        elem.transition().attr('transform', transform.toString()).each('end', resolve);
      } else {
        elem.attr('transform', transform.toString());
        resolve();
      }
    });
  };

  ns.components.ArrayItem.prototype.moveTo = function(x, y, animate) {
    var that = this;
    return new Promise(function(resolve, reject) {
      // animate by default
      if (animate !== false) animate = true;
      // update layout
      that._state.layout.moveTo(x, y);

      var elem = that._state.svgElem;
      var transform = d3.transform(elem.attr('transform'));
      // new translate
      transform.translate = [x, y];
      if (animate) {
        elem.transition().attr('transform', transform.toString()).each('end', resolve);
      } else {
        elem.attr('transform', transform.toString());
        resolve();
      }
    });
  };

  ns.components.ArrayItem.prototype.moveThroughPath = function(path) {

    var animTasks = [];

    if (typeof path != 'string') {
      throw 'Invalid path';
    }

    var pathCoords = path.split(' ');

    for (var i = 0; i < pathCoords.length; i++) {
      var coordStr = pathCoords[i];
      var coordStrFirstChar = coordStr.charAt(0);
      var animate = true;
      if (coordStrFirstChar == 'M' || coordStrFirstChar == 'L' ||
        (coordStrFirstChar >= '0' && coordStrFirstChar <= '9')) {

        animate = coordStrFirstChar == 'M' ? false : true;
        if (coordStrFirstChar == 'M' || coordStrFirstChar == 'L') {
          coordStr = coordStr.substring(1);
        }

        var coords = coordStr.split(',').map(parseFloat);
        if (coords.length == 2) {
          var task = ns.util.createTaskForPromise(
            this.moveTo, this, [coords[0], coords[1], animate]);
          animTasks.push(task);
        }
      }
    }

    return animTasks.reduce(function(prevTask, nextTask) {
      return promise.then(nextTask);
    }, Promise.resolve());

  };

}(window.stepViz, window.d3));
