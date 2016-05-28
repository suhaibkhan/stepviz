/*!
 * stepviz 0.1.0 (28-05-2016)
 * https://github.com/suhaibkhan/stepviz
 * MIT licensed

 * Copyright (C) 2016 Suhaib Khan, http://suhaibkhan.github.io
 */

(function() {

  'use strict';

  // check for dependencies
  if (typeof window.d3 === 'undefined') {
    throw 'd3 library not found.';
  }

  // init namespaces
  /**
   * stepViz Namespace
   *
   * @namespace
   */
  var ns = {
    /**
     * Components Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    components: {},

    /**
     * Constants Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    constants: {},

    /**
     * Configuration Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    config: {},

    /**
     * Utility functions Namespace
     *
     * @namespace
     * @memberof stepViz
     */
    util: {}
  };

  // set as global
  window.stepViz = ns;

}());

(function(ns) {

  'use strict';

  // Default Configuration

  // Default theme
  ns.config.themeCSSClass = 'default';
  // CSS class used for highlighting
  ns.config.highlightCSSClass = 'highlight';
  // Default font size
  ns.config.defaultFontSize = '12px';

}(window.stepViz));

(function(ns) {

  'use strict';

  ns.init = function(container, props) {
    return new ns.components.Board(container, props);
  };

}(window.stepViz));

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

  ns.Layout = function(parent, box, margin) {
    this._parent = parent;

    // defaults
    this._box = {
      top: 0,
      left: 0,
      width: 'auto',
      height: 'auto'
    };

    this._margin = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    };

    this.setBox(box, margin);
  };

  ns.Layout.prototype.reCalculate = function() {

    var parentSize = {
      width: 0,
      height: 0
    };
    if (this._parent instanceof HTMLElement) {
      parentSize.width = this._parent.offsetWidth;
      parentSize.height = this._parent.offsetHeight;
    } else if (typeof this._parent.getLayout == 'function') {
      var parentBounds = this._parent.getLayout().getBounds();
      parentSize.width = parentBounds.width;
      parentSize.height = parentBounds.height;
    } else {
      throw 'Invalid parent';
    }

    // calculate bounds
    this._top = parseAndCalc(this._box.top, parentSize.height);
    this._left = parseAndCalc(this._box.left, parentSize.width);
    if (this._box.width == 'auto') {
      // use remaining width
      this._width = parentSize.width - this._left;
    } else {
      this._width = parseAndCalc(this._box.width, parentSize.width);
    }
    if (this._box.height == 'auto') {
      // use remaining height
      this._height = parentSize.height - this._top;
    } else {
      this._height = parseAndCalc(this._box.height, parentSize.height);
    }

  };

  ns.Layout.prototype.setBox = function(box, margin) {
    this._box = ns.util.defaults(box, this._box);
    this._margin = ns.util.defaults(margin, this._margin);
    this.reCalculate();
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

  ns.Layout.prototype.moveTo = function(x, y) {
    this._top = y;
    this._left = x;
  };

  ns.Layout.prototype.translate = function(x, y) {
    this._top += y;
    this._left += x;
  };

  ns.Layout.prototype.clone = function() {
    return new ns.Layout(this._parent, ns.util.objClone(this._box),
      ns.util.objClone(this._margin));
  };

}(window.stepViz));

(function(ns) {

  'use strict';

  ns.util.defaults = function(props, defaults) {
    props = props || {};
    var clonedProps = ns.util.objClone(props);
    for (var prop in defaults) {
      if (defaults.hasOwnProperty(prop) && !clonedProps.hasOwnProperty(prop)) {
        clonedProps[prop] = defaults[prop];
      }
    }
    return clonedProps;
  };

  ns.util.objClone = function(obj) {
    var cloneObj = null;

    if (Array.isArray(obj)) {
      cloneObj = [];
      for (var i = 0; i < obj.length; i++) {
        cloneObj.push(ns.util.objClone(obj[i]));
      }
    } else if (typeof obj == 'object') {
      cloneObj = {};
      for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          cloneObj[prop] = ns.util.objClone(obj[prop]);
        }
      }
    } else {
      cloneObj = obj;
    }
    return cloneObj;
  };

  ns.util.createTaskForPromise = function(fn, context, args) {
    return function() {
      return fn.apply(context, args);
    };
  };

}(window.stepViz));

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

(function(ns, d3) {

  'use strict';

  ns.constants.ARRAY_CSS_CLASS = 'array';

  ns.constants.ARRAY_HORZ_DIR = 'horizontal';
  ns.constants.ARRAY_VERT_DIR = 'vertical';

  ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER = 'after';
  ns.constants.ARRAY_ANIM_SWAP_PATH_BEFORE = 'before';
  ns.constants.ARRAY_ANIM_SWAP_PATH_NONE = 'none';

  ns.constants.ARRAY_PROP_LIST = ['dir', 'fontSize', 'renderer'];

  function drawArray(component) {
    var state = component._state;
    var direction = state.dir;
    var compBox = state.layout.getBox();
    var array = state.value;

    var props = {};
    ns.constants.ARRAYITEM_PROP_LIST.forEach(function(propKey) {
      props[propKey] = state[propKey];
    });

    var itemSize = 0;
    if (direction == ns.constants.ARRAY_VERT_DIR) {
      itemSize = Math.floor(compBox.height / array.length);
    } else {
      itemSize = Math.floor(compBox.width / array.length);
    }
    var x = 0;
    var y = 0;

    for (var i = 0; i < array.length; i++) {
      // create array item component
      var itemBox = {
        top: y,
        left: x,
        width: 0,
        height: 0
      };

      if (direction == ns.constants.ARRAY_VERT_DIR) {
        itemBox.width = compBox.width;
        itemBox.height = itemSize;
        y += itemSize;
      } else {
        itemBox.width = itemSize;
        itemBox.height = compBox.height;
        x += itemSize;
      }

      if (state.children.length > i) {
        state.children[i].updateLayout(itemBox);
      } else {
        var itemLayout = component.createLayout(itemBox);
        component.drawArrayItem(array[i], itemLayout, ns.util.objClone(props));
      }
    }

  }

  ns.components.Array = function(parent, array, layout, props) {

    if (!Array.isArray(array)) {
      throw 'Invalid array';
    }

    if (array.length === 0) {
      throw 'Empty array';
    }

    ns.components.Component.call(this, parent, array, layout, props, {
      dir: ns.constants.ARRAY_HORZ_DIR,
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
      .attr('class', ns.constants.ARRAY_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    // draw
    drawArray(this);

  };

  // inherit from base class
  ns.components.Array.prototype = Object.create(ns.components.Component.prototype);
  ns.components.Array.prototype.constructor = ns.components.Array;

  ns.components.Array.prototype.drawArrayItem = function(value, layout, props) {
    var arrayItemComp = new ns.components.ArrayItem(this, value, layout, props);
    this._state.children.push(arrayItemComp);
    return arrayItemComp;
  };

  ns.components.Array.prototype.redraw = function() {
    // recalculate layout
    this._state.layout.reCalculate();
    // draw
    drawArray(this, this._state);
  };

  ns.components.Array.prototype.highlight = function(arrayIndices, props) {

    if (typeof arrayIndices == 'number') {
      arrayIndices = [arrayIndices];
    }

    if (!Array.isArray(arrayIndices)) {
      throw 'Invalid argument to highlight.';
    }

    for (var i = 0; i < arrayIndices.length; i++) {
      var index = arrayIndices[i];
      if (index > -1 && index < this._state.children.length) {
        this._state.children[index].highlight(props);
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
      if (index > -1 && index < this._state.children.length) {
        this._state.children[index].unhighlight();
      }
    }
  };

  ns.components.Array.prototype.translate = function(x, y, animate) {
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

  ns.components.Array.prototype.clone = function() {
    var state = this._state;

    var props = {};
    var discardProps = ['value', 'layout', 'parent', 'svgElem', 'children'];
    for (var prop in state) {
      if (state.hasOwnProperty(prop) && discardProps.indexOf(prop) == -1) {
        props[prop] = ns.util.objClone(state[prop]);
      }
    }

    return state.parent.drawArray(ns.util.objClone(state.value),
      state.layout.clone(), props);
  };

  // TODO
  ns.components.Array.prototype.swap = function(i, j, animate, animProps) {
    // animate by default
    if (animate !== false) animate = true;

    animProps = ns.util.defaults(animProps, {
      iDir: ns.constants.ARRAY_ANIM_SWAP_PATH_NONE,
      jDir: ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER
    });

    if (i > -1 && j > -1 && i < this._state.children.length &&
      j < this._state.children.length && i != j) {

      var tempItem = this._state.children[i];
      this._state.children[i] = this._state.children[j];
      this._state.children[j] = tempItem;

      // swap animation

    }
  };

}(window.stepViz, window.d3));

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

    props = props || {};
    props.margin = props.margin || {
      top: 10,
      left: 10,
      bottom: 10,
      right: 10
    };
    var layout = new ns.Layout(container, {}, props.margin);
    
    ns.components.Component.call(this, null, null, layout, props, {});

    var compBounds = this._state.layout.getBounds();
    var compBox = this._state.layout.getBox();

    this._state.svgElem = d3.select(container)
      .append('svg')
      .attr('width', compBounds.width)
      .attr('height', compBounds.height)
      .append('g')
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')')
      .attr('class', ns.constants.MAIN_CSS_CLASS + ' ' + ns.config.themeCSSClass);
  };

  // inherit from base class
  ns.components.Board.prototype = Object.create(ns.components.Component.prototype);
  ns.components.Board.prototype.constructor = ns.components.Board;

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

  ns.components.Board.prototype.drawArray = function(array, layout, props) {
    var arrayComp = new ns.components.Array(this, array, layout, props);
    this._state.children.push(arrayComp);
    return arrayComp;
  };

}(window.stepViz, window.d3));


if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}

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

if (typeof Object.create != 'function') {
  Object.create = (function() {
    var Temp = function() {};
    return function (prototype) {
      if (arguments.length > 1) {
        throw Error('Second argument not supported');
      }
      if(prototype !== Object(prototype) && prototype !== null) {
        throw TypeError('Argument must be an object or null');
     }
     if (prototype === null) {
        throw Error('null [[Prototype]] not supported');
      }
      Temp.prototype = prototype;
      var result = new Temp();
      Temp.prototype = null;
      return result;
    };
  })();
}
