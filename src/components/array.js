(function(ns, d3) {

  'use strict';

  ns.constants.ARRAY_CSS_CLASS = 'array';

  ns.constants.ARRAY_HORZ_DIR = 'horizontal';
  ns.constants.ARRAY_VERT_DIR = 'vertical';

  ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER = 'after';
  ns.constants.ARRAY_ANIM_SWAP_PATH_BEFORE = 'before';
  ns.constants.ARRAY_ANIM_SWAP_PATH_NONE = 'none';

  ns.constants.ARRAY_PROP_LIST = ['dir', 'fontSize', 'renderer'];

  function drawArray(component, state) {
    var direction = state.dir;
    var compBox = state.layout.getBox();
    var array = state.value;

    var props = {};
    ns.constants.ARRAYITEM_PROP_LIST.forEach(function(propKey){
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

    if (!layout) {
      throw 'Invalid layout';
    }

    this._state = ns.util.defaults(props, {
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

    this._state.value = array;

    this._state.layout = layout;
    var compBox = layout.getBox();

    this._state.parent = parent;

    this._state.svgElem = parent.svg().append('g')
      .attr('class', ns.constants.ARRAY_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

    this._state.children = [];

    // draw
    drawArray(this, this._state);

  };

  ns.components.Array.prototype.createLayout = function(box, margin){
    return new ns.Layout(this, box, margin);
  };

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

  ns.components.Array.prototype.svg = function() {
    return this._state.svgElem;
  };

  ns.components.Array.prototype.getLayout = function() {
    return this._state.layout;
  };

  ns.components.Array.prototype.updateLayout = function(box, margin) {
    return this._state.layout.setBox(box, margin);
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
