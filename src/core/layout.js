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
