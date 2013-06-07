var Scale = {
  getMapScale: function(type, w, h) {
    if (type === 'fullscreen') {
      return Scale.fullScale(w, h, 0);
    } else if (type === 'fit') {
      return Scale.fitScale(w, h, 20);
    } else {
      return 1;
    }
  },

  fullScale: function(w, h, border) {
    var proportion = w / h;
    var _w = $(window).width() - 2 * border;
    var _h = $(window).height() - 2 * border;
    var _proportion = _w / _h;

    if (proportion <= _proportion) {
      // Align left/right.
      return _w / w;

    } else {
      // Align top/bottom.
      return _h / h;
    }
  },

  fitScale: function(w, h, border) {
    var proportion = w / h;
    var _w = $(window).width() - 2 * border;
    var _h = $(window).height() - 2 * border;
    var _proportion = _w / _h;

    if (proportion >= _proportion) {
      // Align left/right.
      return _w / w;

    } else {
      // Align top/bottom.
      return _h / h;
    }
  },

  display: function(type) {
    switch (type) {
      case 'add':
        // Map fits window.
        return 'fit';
      case 'edit':
      case 'create':
        // Appears as created.
        return 'original';
      case 'view':
        // Window scrolls for map.
        return 'fullscreen';
      default:
        return;
    }
  }

};

