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
        state.children[i].redraw();
      } else {
        var childProps = ns.util.objClone(props);
        if (state.highlight[i]) {
          childProps.highlight = true;
          childProps.highlightProps = state.highlight[i];
        }
        var itemLayout = component.createLayout(itemBox);
        component.drawArrayItem(array[i], itemLayout, childProps);
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

    // to save highlight state
    if (!this._state.highlight) {
      this._state.highlight = {};
    }

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
    drawArray(this);
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
        // saving state
        this._state.highlight[index] = props;
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
        if (this._state.highlight[index]) {
          delete this._state.highlight[index];
        }
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
