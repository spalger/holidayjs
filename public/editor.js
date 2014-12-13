$(function () {

  $("#editor-shapes").owlCarousel({
    items: 5,
    itemsDesktop: [1199, 10],
    itemsDesktopSmall: [979, 5]
  });

  var $canvas = $('#editor-canvas');
  var canvas = new fabric.Canvas('editor-canvas', {
    width: $canvas.width(),
    height: $canvas.height(),
  });

  // create a rectangle with angle=45
  var rect = new fabric.Rect({
    left: 100,
    top: 100,
    fill: 'red',
    width: 100,
    height: 100,
    angle: 45
  });

  canvas.add(rect);
});
