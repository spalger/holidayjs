$(function () {
  $("#editor-shapes").owlCarousel({
    items: 5,
    itemsDesktop: [1199, 10],
    itemsDesktopSmall: [979, 5]
  });

  var $canvas = $('#editor-canvas');
  var canvas = new fabric.Canvas('editor-canvas', {
    width: $canvas.width(),
    height: $canvas.height()
  });

  fabric.Image.fromURL('/images/sweater.png', function(img) {
    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
  });

  $('#editor-controls-save').click(function () {
    var pngDataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8
    });

    var pngData = pngDataUrl.replace(/^data\:image\/jpeg\;base64\,/, '');

    $.post('/image-upload', pngData, function () {
      alert('saved');
    }, 'text');
  });

  $('#editor-shapes').on('click', '.owl-item img', function () {
    var $el = $(this);

    var img = new fabric.Image($el.get(0), {
      left: (canvas.width / 2) - (150 / 2),
      top: (canvas.height / 2) - (150 / 2),
      width: 150,
      height: 150,
    });

    canvas.add(img);
  });
});
