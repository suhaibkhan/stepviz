(function() {

  function init() {
    var vizContainer = stepViz.init('container');

    /*
    var rawArray = [];
    for (var i = 1; i <= 20; i++) {
      rawArray.push([i, i * 34]);
    }

    var rawArrlayout = vizContainer.createLayout({
      width: '50px'
    });
    var rawArrayComp = vizContainer.drawArray(
      rawArray, rawArrlayout, {
        dir: stepViz.constants.ARRAY_VERT_DIR,
        fontSize: '10px',
        renderer: function(d) {
          return d[0] + '  ,  ' + d[1];
        }
      });

    setTimeout(function() {
      rawArrayComp.highlight([2, 5], {'rect-fill': 'red'});
      // rawArrayComp.swap(2, 5);
    }, 1000);

    setTimeout(function() {
      rawArrayComp.unhighlight(2);
      var clone = rawArrayComp.clone();
      clone.translate(200, 0).then(function(){
      });
    }, 4000);
    */

    var matrixLayout = vizContainer.createLayout({});

    var l = 30;

    var matrix = [];
    for (var i = 0; i <= l; i++) {
      var row = [];
      for (var j = 0; j <= l; j++) {
        var e = null;
        if (i == j || i == l - j || i == l / 2 || j == l / 2 ||
          i === 0 || j === 0 || i == l || j == l) {
          e = i * j;
        }
        row.push(e);
      }
      matrix.push(row);
    }

    var matComp = vizContainer.drawMatrix(matrix, matrixLayout, {
      fontSize: '14px'
    });

    // var comArrLayout = vizContainer.layout({left: '50%', height: '5%'});
    // var comArrayComp = vizContainer.drawArray(rawArray, comArrLayout);

    window.onresize = function() {
      vizContainer.redraw();
    };

  }

  window.onload = init;

})();
