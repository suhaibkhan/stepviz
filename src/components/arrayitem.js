(function(ns, d3) {

  'use strict';

  // constants
  ns.constants.ARRAYITEM_CSS_CLASS = 'arrayItem';
  ns.constants.ARRAYITEM_PROP_LIST = ['fontSize', 'renderer'];

  function drawArrayItem(component) {

    var svgElem = component.svg();
    var compBox = component.layout().getBox();
    var value = component.value();
    var renderer = component.state('renderer');
    var fontSize = component.state('fontSize');

    // draw item
    var rectElem = svgElem.select('rect');
    if (rectElem.empty()) {
      rectElem = svgElem.append('rect')
        .attr('x', 0)
        .attr('y', 0);
    }
    rectElem.attr('width', compBox.width)
      .attr('height', compBox.height);

    var textElem = svgElem.select('text');
    if (textElem.empty()) {
      textElem = svgElem.append('text')
        .text(renderer(value))
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', fontSize);
    }

    // align text in center of rect
    var rectBBox = rectElem.node().getBBox();
    var textBBox = textElem.node().getBBox();

    textElem.attr('dx', (rectBBox.width - textBBox.width) / 2)
      .attr('dy', (rectBBox.height - textBBox.height) / 2);

    // highlight
    toggleHighlight(component);

  }

  function toggleHighlight(component) {

    var props = component.state('highlightProps') || {};

    var svgElem = component.svg();
    var elemClass = svgElem.attr('class');
    var prop = null;
    // highlight if needed
    if (component.state('highlight')) {
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

    } else {
      elemClass = elemClass.replace(ns.config.highlightCSSClass, '');

      // remove custom highlighting
      for (prop in props) {
        if (props.hasOwnProperty(prop)) {
          if (prop.startsWith('rect-')) {
            svgElem.select('rect').style(prop.substring(5), null);
          } else if (prop.startsWith('text-')) {
            svgElem.select('text').style(prop.substring(5), null);
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
    var svgElem = parent.svg().append('g')
      .attr('class', ns.constants.ARRAYITEM_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');
    // save SVG element
    this.setSVG(svgElem);

    // draw
    drawArrayItem(this);
  };

  // inherit from base class
  ns.util.inherits(ns.components.Component, ns.components.ArrayItem);

  ns.components.ArrayItem.prototype.redraw = function() {

    if (!this.svg()) {
      throw 'ArrayItem redraw error - Invalid state or SVG';
    }

    // recalculate layout
    var layout = this.layout();
    layout.reCalculate();

    var compBox = layout.getBox();
    this.svg()
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    // draw
    drawArrayItem(this);
  };

  ns.components.ArrayItem.prototype.changeValue = function(newValue) {
    this.value(newValue);
    drawArrayItem(this);
  };

  ns.components.ArrayItem.prototype.highlight = function(props) {
    this.state('highlight', true);
    this.state('highlightProps', props);
    toggleHighlight(this);
  };

  ns.components.ArrayItem.prototype.unhighlight = function() {
    this.state('highlight', false);
    toggleHighlight(this);
    this.state('highlightProps', null);
  };

  ns.components.ArrayItem.prototype.translate = function(x, y, animate) {
    var that = this;
    return new Promise(function(resolve, reject) {
      // animate by default
      if (animate !== false) animate = true;
      // update layout
      that.layout().translate(x, y);

      var elem = that.svg();
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
      that.layout().moveTo(x, y);

      var elem = that.svg();
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
