(function(ns, d3) {

  'use strict';

  ns.constants.MATRIX_CSS_CLASS = 'matrix';
  ns.constants.ARRAY_PROP_LIST = ['fontSize', 'renderer'];

  ns.components.Matrix = function(parent, matrix, layout, props) {

    if (!Array.isArray(matrix)) {
      throw 'Invalid matrix';
    }

    if (matrix.length === 0) {
      throw 'Empty matrix';
    }

    ns.components.Component.call(this, parent, matrix, layout, props, {});

    var compBox = layout.getBox();

    var svgElem = parent.svg().append('g')
      .attr('class', ns.constants.MATRIX_CSS_CLASS)
      .attr('transform', 'translate(' + compBox.left + ',' + compBox.top + ')');
    // save SVG element
    this.setSVG(svgElem);

    // to save highlight state
    if (!this.state('highlight')) {
      this.state('highlight', {});
    }

    // draw
    drawMatrix(this);

  };

  // inherit from base class
  ns.util.inherits(ns.components.Component, ns.components.Matrix);

  function drawMatrix(component) {
    var compBox = component.layout().getBox();
    var matrix = component.value();

    var props = {};
    ns.constants.ARRAY_PROP_LIST.forEach(function(propKey) {
      if (component.state(propKey)){
        props[propKey] = component.state(propKey);
      }
    });

    var rowWidth = compBox.width;
    var rowHeight = compBox.height / matrix.length;
    var x = 0;
    var y = 0;

    for (var i = 0; i < matrix.length; i++) {
      var row = matrix[i];
      var rowBox = {
        top: y,
        left: x,
        width: rowWidth,
        height: rowHeight
      };

      y += rowHeight;

      if (component.child(i)) {
        component.child(i).updateLayout(itemBox);
        component.child(i).redraw();
      } else {
        var childProps = ns.util.objClone(props);
        if (component.state('highlight')[i]) {
          childProps.highlight = true;
          childProps.highlightProps = component.state('highlight')[i];
        }
        var rowLayout = component.createLayout(rowBox);
        component.drawArray(row, rowLayout, childProps);
      }

    }

  }

  ns.components.Matrix.prototype.drawArray = function(array, layout, props) {
    var arrayComp = new ns.components.Array(this, array, layout, props);
    this.addChild(arrayComp);
    return arrayComp;
  };

  ns.components.Matrix.prototype.changeValue = function(row, column, newValue){
    if (this.child(row)){
      this.child(row).changeValue(column, newValue);
      this.value()[row][column] = newValue;
    }else{
      throw 'Invalid row';
    }
  };

}(window.stepViz, window.d3));
