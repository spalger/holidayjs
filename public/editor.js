$(function () {
  $('#editor-shapes').owlCarousel({
    items: 5,
    itemsDesktop: [1199, 10],
    itemsDesktopSmall: [979, 5]
  });

  var $canvas = $('#editor-canvas');
  var canvas = new fabric.Canvas('editor-canvas', {
    width: 500,
    height: 600
  });

  fabric.Image.fromURL('/images/sweater.png', function(img) {
    img.set({width: canvas.width, height: canvas.height, originX: 'left', originY: 'top'});
    canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
  });

  $('#editor-controls-save').click(function () {
    var jpgDataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.8
    });
    var jpgData = jpgDataUrl.replace(/^data\:image\/jpeg\;base64\,/, '');

    // $('#image-thing').val(jpgData);
    // console.log($('#image-thing').val());
    // debugger;
    // $('form').submit();

    $.post('/image-upload', jpgData, function () {
      alert('saved');
          $('#image-thing').val(jpgData);
     }, 'text');
  });

  $('#editor-controls-clear').click(function () {
    canvas.getObjects().forEach(function (obj) {
      obj.remove();
    });
    canvas.renderAll();
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
    canvas.renderAll();
  });

  var mod = _.debounce(saveState, 100, { leading: false, trailing: true, maxWait: 350 });
  canvas.on('object:modified', mod);
  canvas.on('object:added', mod);
  canvas.on('object:removed', mod);

  var myFirebaseRef = new Firebase('https://popping-heat-6667.firebaseio.com/editorState');
  myFirebaseRef.on('value', function (snapshot) {
    onStateUpdate(snapshot.val());
  });

  var knownState;

  function onStateUpdate(newState) {
    if (newState === knownState) return;
    knownState = newState;

    try {
      var state = JSON.parse(newState);
      if (!state || !_.isArray(state.objects)) return;

      var curState = canvas.getObjects();
      var bySrc = _.groupBy(curState, function (obj) {
        return obj.getSrc();
      });

      state.objects
      .forEach(function (obj) {
        var cur = (bySrc[obj.src] || []).pop();
        if (cur) return cur.set(obj);

        var imgEl = document.createElement('img');
        imgEl.src = obj.src;
        var img = new fabric.Image(imgEl, obj);
        canvas.add(img);
      });

      _.forOwn(bySrc, function (set) {
        set.forEach(function (obj) {
          obj.remove();
        });
      });

      canvas.renderAll();
    } catch (e) {
      console.log(e.stack);
    }
  }

  function saveState() {
    var state = JSON.stringify(canvas);
    if (state === knownState) return;
    knownState = state;
    myFirebaseRef.set(knownState);
  }
});
