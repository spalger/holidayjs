$(function () {
  var $container = $('#editor');
  var canvas = new fabric.Canvas('editor-canvas', {
    width: $container.width(),
    height: $container.height(),
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