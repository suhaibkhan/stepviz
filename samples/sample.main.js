(function() {

  function init() {
    var vizContainer = stepViz.init('container');
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
      rawArrayComp.highlight([2, 5]);
      // rawArrayComp.swap(2, 5);
    }, 1000);

    setTimeout(function() {
      rawArrayComp.unhighlight([2, 5]);
      var clone = rawArrayComp.clone();
      clone.translate(80, 0).then(function(){
        alert('ok');
      });
    }, 4000);

    // var comArrLayout = vizContainer.layout({left: '50%', height: '5%'});
    // var comArrayComp = vizContainer.drawArray(rawArray, comArrLayout);

    console.log(vizContainer);

    window.onresize = function() {
      vizContainer.redraw();
    };

  }

  window.onload = init;

})();
