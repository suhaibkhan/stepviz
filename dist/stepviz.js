/*!
 * stepviz 0.1.0 (22-05-2016)
 * https://github.com/suhaibkhan/stepviz
 * MIT licensed

 * Copyright (C) 2016 Suhaib Khan, http://suhaibkhan.github.io
 */
if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) ||
      Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}


(function() {

  'use strict';

  if (typeof window.d3 === 'undefined') {
    throw 'd3 library not found.';
  }

  // init namespaces
  var ns = {};
  ns.components = {};
  ns.constants = {};
  ns.config = {};

  // default config
  ns.config.cssClass = 'stepViz';
  ns.config.highlightClass = 'highlight';

  ns.init = function(container, props) {
    return new ns.Board(container, props);
  };

  // set as global
  window.stepViz = ns;

}());

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

(function(ns) {

  'use strict';

  function parseAndCalc(value, relativeValue) {
    var retVal = parseFloat(value);
    if (isNaN(retVal)) {
      throw 'Invalid layout value ' + value;
    } else {
      if (typeof value == 'string') {
        value = value.trim();
        if (value.endsWith('%')) {
          retVal = (retVal / 100) * relativeValue;
        }
      }
    }
    return retVal;
  }

  ns.Layout = function(board, box, margin) {

    this._board = board;

    // defaults
    this._box = ns.util.defaults(box, {
      top: 0,
      left: 0,
      width: 'auto',
      height: 'auto'
    });

    this._margin = ns.util.defaults(margin, {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    });

    this.reCalculate();

  };

  ns.Layout.prototype.reCalculate = function() {
    var boardSize = this._board.size();

    // calculate bounds
    this._top = parseAndCalc(this._box.top, boardSize.height);
    this._left = parseAndCalc(this._box.left, boardSize.width);
    if (this._box.width == 'auto') {
      // use remaining width
      this._width = boardSize.width - this._left;
    } else {
      this._width = parseAndCalc(this._box.width, boardSize.width);
    }
    if (this._box.height == 'auto') {
      // use remaining height
      this._height = boardSize.height - this._top;
    } else {
      this._height = parseAndCalc(this._box.height, boardSize.height);
    }
    
  };

  ns.Layout.prototype.getBounds = function() {
    return {
      top: this._top,
      left: this._left,
      width: this._width,
      height: this._height
    };
  };

  ns.Layout.prototype.getBox = function() {
    return {
      top: this._top + this._margin.top,
      left: this._left + this._margin.left,
      width: this._width - this._margin.left - this._margin.right,
      height: this._height - this._margin.top - this._margin.bottom
    };
  };

  ns.Layout.prototype.translate = function(x, y) {
    this._top += y;
    this._left += x;
  };

  ns.Layout.prototype.clone = function() {
    return new ns.Layout(this._board, ns.util.objClone(this._box),
      ns.util.objClone(this._margin));
  };

}(window.stepViz));

(function(ns) {

  'use strict';

  ns.util = {};

  ns.util.defaults = function(props, defaults) {
    props = props || {};
    for (var prop in defaults) {
      if (defaults.hasOwnProperty(prop) && !props.hasOwnProperty(prop)) {
        props[prop] = defaults[prop];
      }
    }
    return props;
  };

  ns.util.objClone = function(obj){
    var cloneObj = null;

    if (Array.isArray(obj)){
      cloneObj = [];
      for (var i = 0; i < obj.length; i++){
        cloneObj.push(ns.util.objClone(obj[i]));
      }
    }else if (typeof obj == 'object'){
      cloneObj = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)){
          cloneObj[prop] = ns.util.objClone(obj[prop]);
        }
      }
    }else{
      cloneObj = obj;
    }
    return cloneObj;
  };

}(window.stepViz));

(function(ns, d3) {

  'use strict';

  ns.constants.ARRAY_HORZ_DIR = 'horizontal';
  ns.constants.ARRAY_VERT_DIR = 'vertical';

  ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER = 'after';
  ns.constants.ARRAY_ANIM_SWAP_PATH_BEFORE = 'before';
  ns.constants.ARRAY_ANIM_SWAP_PATH_NONE = 'none';

  function drawSVGArray(svgElem, state, compBox, props) {

    var direction = props.dir;
    var fontSize = props.fontSize;
    var renderer = props.renderer;

    // draw rectangles
    var x = 0;
    var y = 0;
    var interval = 0;
    if (direction == ns.constants.ARRAY_VERT_DIR) {
      interval = Math.floor(compBox.height / state.length);
    } else {
      interval = Math.floor(compBox.width / state.length);
    }

    for (var i = 0; i < state.length; i++) {

      var elemGroup = svgElem.append('g')
        .attr('transform', 'translate(' + x + ',' + y + ')');

      var rect = elemGroup.append('rect')
        .attr('x', 0)
        .attr('y', 0);

      if (direction == ns.constants.ARRAY_VERT_DIR) {
        rect.attr('width', compBox.width)
          .attr('height', interval);
        y += interval;
      } else {
        rect.attr('height', compBox.height)
          .attr('width', interval);
        x += interval;
      }

      var text = elemGroup.append('text')
        .text(renderer(state[i].value))
        .attr('x', 0)
        .attr('y', 0)
        .style('font-size', fontSize);

      // align text in center of rect
      var rectBBox = rect.node().getBBox();
      var textBBox = text.node().getBBox();

      text.attr('dx', (rectBBox.width - textBBox.width) / 2);
      text.attr('dy', (rectBBox.height - textBBox.height) / 2);

      state[i].elem = elemGroup;
    }
  }

  ns.components.Array = function(board, array, layout, props) {

    this._board = board;

    if (!Array.isArray(array)) {
      throw 'Invalid array';
    }

    if (array.length === 0) {
      throw 'Empty array';
    }

    if (!layout) {
      throw 'Invalid layout';
    } else {
      this._layout = layout;
    }

    this._props = ns.util.defaults(props, {
      dir: ns.constants.ARRAY_HORZ_DIR,
      fontSize: '12px',
      renderer: function(d) {
        return d;
      }
    });

    var compBox = this._layout.getBox();

    this._svgElem = this._board._svg.append('g')
      .attr('class', ns.config.cssClass + ' array')
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    this._state = [];
    for (var i = 0; i < array.length; i++) {
      this._state.push({
        value: array[i]
      });
    }

    // draw
    drawSVGArray(this._svgElem, this._state, compBox, this._props);

  };

  ns.components.Array.prototype.redraw = function() {
    // clear existing
    for (var i = 0; i < this._state.length; i++) {
      this._state[i].elem = null;
    }
    this._svgElem.selectAll('*').remove();
    // recalculate layout
    this._layout.reCalculate();
    // draw
    drawSVGArray(this._svgElem, this._state, this._layout.getBox(), this._props);
  };

  ns.components.Array.prototype.getLayout = function() {
    return this._layout;
  };

  ns.components.Array.prototype.highlight = function(arrayIndices, props) {

    if (typeof arrayIndices == 'number') {
      arrayIndices = [arrayIndices];
    }

    if (!Array.isArray(arrayIndices)) {
      throw 'Invalid argument to highlight.';
    }

    props = ns.util.defaults(props, {
      highlightClass: ns.config.highlightClass
    });

    for (var i = 0; i < arrayIndices.length; i++) {
      var index = arrayIndices[i];
      if (index > -1 && index < this._state.length) {
        this._state[index].highlight = true;
        this._state[index].elem.attr('class', props.highlightClass);
      }
    }
  };

  ns.components.Array.prototype.unhighlight = function(arrayIndices) {

    if (typeof arrayIndices == 'number') {
      arrayIndices = [arrayIndices];
    }

    if (!Array.isArray(arrayIndices)) {
      throw 'Invalid argument to unhighlight.';
    }

    for (var i = 0; i < arrayIndices.length; i++) {
      var index = arrayIndices[i];
      if (index > -1 && index < this._state.length) {
        this._state[index].highlight = false;
        this._state[index].elem.attr('class', null);
      }
    }
  };

  ns.components.Array.prototype.move = function(x, y, animate) {
    // animate by default
    if (animate !== false) animate = true;

    var arrCompTransform = d3.transform(this._svgElem.transition().attr('transform'));
    // change translate transform
    arrCompTransform.translate = [arrCompTransform.translate[0] + x,
      arrCompTransform.translate[1] + y
    ];
    // update
    this._layout.translate(x, y);
    var elem = this._svgElem;
    if (animate) {
      elem = elem.transition();
    }
    elem.attr('transform', arrCompTransform);
  };

  ns.components.Array.prototype.clone = function() {
    // create a clone of underlying array
    var array = [];
    for (var i = 0; i < this._state.length; i++) {
      array.push(this._state[i].value);
    }

    return this._board.drawArray(array,
      this._layout.clone(), ns.util.objClone(this._props));
  };

  // TODO
  ns.components.Array.prototype.swap = function(i, j, animate, animProps) {
    // animate by default
    if (animate !== false) animate = true;

    animProps = ns.util.defaults(animProps, {
      iDir: ns.constants.ARRAY_ANIM_SWAP_PATH_NONE,
      jDir: ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER
    });

    if (i > -1 && j > -1 && i < this._state.length &&
      j < this._state.length && i != j) {

      var tempItem = this._state[i];
      this._state[i] = this._state[j];
      this._state[j] = tempItem;

      var ithTransform = d3.transform(this._state[j].elem.attr('transform'));
      var jthTransform = d3.transform(this._state[i].elem.attr('transform'));

      var ithBox = this._state[j].elem.node().getBBox();
      var jthBox = this._state[i].elem.node().getBBox();

      this._state[i].elem
        .transition()
        .duration(1000)
        .attr('transform', 'translate(' + -(jthBox.width + 10) + ',' + jthTransform.translate[1] + ')')
        //.transition()
        .attr('transform', 'translate(' + -(jthBox.width + 10) + ',' + ithTransform.translate[1] + ')')
        //.transition()
        .attr('transform', 'translate(' + ithTransform.translate[0] + ',' + ithTransform.translate[1] + ')');

      this._state[j].elem
        .transition()
        .duration(1000)
        .attr('transform', 'translate(' + (ithBox.width + 10) + ',' + ithTransform.translate[1] + ')')
        .transition()
        .attr('transform', 'translate(' + (ithBox.width + 10) + ',' + jthTransform.translate[1] + ')')
        .transition()
        .attr('transform', 'translate(' + jthTransform.translate[0] + ',' + jthTransform.translate[1] + ')');
    }
  };

}(window.stepViz, window.d3));
