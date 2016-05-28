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
    var prop = null;
    // highlight if needed
    if (state.highlight) {
      if (elemClass.indexOf(ns.config.highlightCSSClass) == -1) {
        elemClass += ' ' + ns.config.highlightCSSClass;
      }
      // custom style for highlighting
      for (prop in props) {
        if (props.hasOwnProperty(prop)) {
          if (prop.startsWith('rect-')) {
            svgElem.select('rect').style(prop.substring(5), props[prop]);
          } else if (prop.startsWith('text-')) {
            svgElem.select('text').style(prop.substring(5), props[prop]);
          }
        }
      }

      // save highlight props state
      state.highlightProps = props;

    } else {
      elemClass = elemClass.replace(ns.config.highlightCSSClass, '');
      // remove custom highlighting
      if (state.highlightProps) {
        for (prop in state.highlightProps) {
          if (state.highlightProps.hasOwnProperty(prop)) {
            if (prop.startsWith('rect-')) {
              svgElem.select('rect').style(prop.substring(5), null);
            } else if (prop.startsWith('text-')) {
              svgElem.select('text').style(prop.substring(5), null);
            }
          }
        }
      }

    }
    svgElem.attr('class', elemClass);
  }

  ns.components.ArrayItem = function(parent, value, layout, props) {

    ns.components.Component.call(this, parent, value, layout, props, {
      fontSize: ns.config.defaultFontSize,
      renderer: function(d) {
        if (d === null) {
          return '';
        } else {
          return JSON.stringify(d);
        }
      }
    });

    var compBox = layout.getBox();

    this._state.svgElem = parent.svg().append('g')
      .attr('class', ns.constants.ARRAYITEM_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    // draw
    drawArrayItem(this._state);
  };

  // inherit from base class
  ns.components.ArrayItem.prototype = Object.create(ns.components.Component.prototype);
  ns.components.ArrayItem.prototype.constructor = ns.components.ArrayItem;

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
