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
    var direction = component.state('dir');
    var compBox = component.layout().getBox();
    var array = component.value();

    var props = {};
    ns.constants.ARRAYITEM_PROP_LIST.forEach(function(propKey) {
      props[propKey] = component.state(propKey);
    });

    var itemSize = 0;
    if (direction == ns.constants.ARRAY_VERT_DIR) {
      itemSize = compBox.height / array.length;
    } else {
      itemSize = compBox.width / array.length;
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

      if (component.child(i)) {
        component.child(i).updateLayout(itemBox);
        component.child(i).redraw();
      } else {
        var childProps = ns.util.objClone(props);
        if (component.state('highlight')[i]) {
          childProps.highlight = true;
          childProps.highlightProps = component.state('highlight')[i];
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

    var svgElem = parent.svg().append('g')
      .attr('class', ns.constants.ARRAY_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');
    // save SVG element
    this.setSVG(svgElem);

    // to save highlight state
    if (!this.state('highlight')) {
      this.state('highlight', {});
    }

    // draw
    drawArray(this);

  };

  // inherit from base class
  ns.util.inherits(ns.components.Component, ns.components.Array);

  ns.components.Array.prototype.drawArrayItem = function(value, layout, props) {
    var arrayItemComp = new ns.components.ArrayItem(this, value, layout, props);
    this.addChild(arrayItemComp);
    return arrayItemComp;
  };

  ns.components.Array.prototype.redraw = function() {
    // recalculate layout
    var layout = this.layout();
    layout.reCalculate();

    var compBox = layout.getBox();
    this.svg()
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');

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
      if (this.child(index)) {
        this.child(index).highlight(props);
        // saving state
        this.state('highlight')[index] = props;
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
      if (this.child(index)) {
        this.child(index).unhighlight();
        if (this.state('highlight')[index]) {
          delete this.state('highlight')[index];
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

  ns.components.Array.prototype.clone = function() {
    return this.parent().drawArray(ns.util.objClone(this.value()),
      this.layout().clone(), this.cloneProps());
  };

  // TODO
  ns.components.Array.prototype.swap = function(i, j, animate, animProps) {
    // animate by default
    if (animate !== false) animate = true;

    animProps = ns.util.defaults(animProps, {
      iDir: ns.constants.ARRAY_ANIM_SWAP_PATH_NONE,
      jDir: ns.constants.ARRAY_ANIM_SWAP_PATH_AFTER
    });

    if (this.child(i) && this.child(j) && i != j) {

      var tempItem = this.child(i);
      this._state.children[i] = this._state.children[j];
      this._state.children[j] = tempItem;

      // swap animation

    }
  };

}(window.stepViz, window.d3));
