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
