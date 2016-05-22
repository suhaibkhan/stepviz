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
