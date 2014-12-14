$(function () {
  $('#editor-shapes').owlCarousel({
    items: 5,
    itemsDesktop: [1199, 10],
    itemsDesktopSmall: [979, 5]
  });

  var savedSweaters = new Firebase('https://popping-heat-6667.firebaseio.com/savedSweaters');
  var canvasObjects = new Firebase('https://popping-heat-6667.firebaseio.com/editorObjects');

  var $canvas = $('#editor-canvas');
  var canvas = window.editorCanvas = new fabric.Canvas('editor-canvas', {
    width: 500,
    height: 600
  });

  var rerender = _.bindKey(canvas, 'renderTop');

  fabric.Image.fromURL('/images/sweater.png', function(img) {
    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
  });

  $('#editor-controls-save').click(function () {
    canvas.discardActiveObject();
    savedSweaters.push(canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8
    }));
    canvasObjects.remove();
  });

  $('#editor-controls-clear').click(function () {
    canvasObjects.remove();
  });

  $('#editor-shapes').on('click', '.owl-item img', function () {
    var $el = $(this).clone();
    var img = new fabric.Image($el.get(0), {
      left: (canvas.width / 2) - (150 / 2),
      top: (canvas.height / 2) - (150 / 2),
      width: 150,
      height: 150,
    });

    canvasObjects.push(getStateFromFabric(img));
  });

  canvasObjects.on('child_added', function (snapshot) {
    var key = snapshot.key();
    var ref = canvasObjects.child(key);
    var state = snapshot.val();

    fabric.Image.fromURL(state.src, imgLoaded, _.omit(state, 'src'));

    function imgLoaded(img) {
      canvas.add(img);
      applySnapshot(snapshot);

      ref.on('value', applySnapshot);
      img.on('modified', function () {
        ref.set(getStateFromFabric(img));
      });

      function applySnapshot(stateSnapshot) {
        var state = stateSnapshot.val();
        if (state) {
          img.set(_.omit(state, 'src'));
        } else {
          img.remove();
        }

        rerender();
      }
    }
  });

  var stateProps = 'src width height top left scaleX scaleY originX originY angle'.split(' ');
  function getStateFromFabric(fabric) {
    return _.pick(fabric.toObject(), stateProps);
  }
});
