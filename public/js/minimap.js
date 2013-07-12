var util = {
  // Support for basic selectors for raw DOM minimap.
  getElementsBySelector: function(str) {
    var is_class = str.split('.');
    var class_name;
    if ((class_name = is_class.pop()) && is_class.length) {
      return ['class', class_name, document.getElementsByClassName(class_name)];
    }
    var is_id = str.split('#');
    var id_name;
    if ((id_name = is_id.pop()) && is_id.length) {
      return ['id', id_name, [document.getElementById(id_name)]];
    }
    return ['tag', str, document.getElementsByTagName(str)];
  },
  extend: function(dest, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        dest[key] = source[key];
      }
    }
    return dest;
  },
  onFinalEvent: (function() {
    var timers = {};
    return function(cb, ms, id) {
      if (timers[id]) {
        clearTimeout(timers[id]);
      }
      timers[id] = setTimeout(cb, ms);
    };
  })()
};

function Minimap(tracked, container, options) {
  // Maps tracked elements to a list of their top, left, width, and height values.
  this.elements = {};

  // Multiplication factor.
  this.factor = 1;

  // By default a vertical minimap.
  this.orientation = 'default';

  // Save container.
  this.container = util.getElementsBySelector(container)[2][0];

  // TODO: options, util extending fn.
  this.options = util.extend({
    wait: 500
  }, options);

  this.tracked = tracked;

  this.calculate(this.options.width, this.options.height);

  // Smart hide minimap (if no scroll, don't show.)
  if (this.options.smart) {
    // TODO: to handle or not to handle?
    this._setupSmartMinimap();
  }

  this.render();
};

// TODO: browser compatibility.
// Find max x, y, and saves all dimensions.
Minimap.prototype._extractElements = function() {
  for (var i = 0, ii = this.tracked.length; i < ii; i += 1) {
    var identifier = this.tracked[i];
    var elements = util.getElementsBySelector(identifier);
    var extracted = [];

    this.elements[elements[1]] = extracted;
    elements = elements[2];

    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var el = elements[j];

      var left = el.offsetLeft,
          top = el.offsetTop,
          width = el.offsetWidth,
          height = el.offsetHeight;

      this.mx = Math.max(left + width, this.mx);
      this.my = Math.max(top + height, this.my);
      this.sx = Math.min(left, this.sx);
      this.sy = Math.min(top, this.sy);

      extracted.push({
        left: left,
        top: top,
        width: width,
        height: height
      });
    }
  }
  this.mx -= this.sx;
  this.my -= this.sy;
};

// Ported from scale.js to use raw DOM.
Minimap.prototype._calculateScale = function() {
  var proportion = this.mx / this.my;
  var _proportion = this.width / this.height;

  if (proportion <= _proportion) {
    // Match height.
    this.factor = this.height / this.my;
  } else {
    // Match width.
    this.factor = this.width / this.mx;
  }

  if (this.mx > window.innerWidth) {
    this.orientation = 'landscape';
  } else if (this.my < window.innerHeight) {
    this.orientation = 'no-scroll';
  }

  this.mx *= this.factor;
  this.my *= this.factor;

  this.width = window.innerWidth * this.factor;
  this.height = window.innerHeight * this.factor;
};

// Detects scroll & changes active position on minimap.
Minimap.prototype._initializeIntervalHandlers = function() {
  // window.scrollTo!
  var self = this;
  var styles = Minimap.STYLES[this.orientation];
  this.interval = setInterval(function() {
    var axis = styles['axis'];
    var push = (window['scroll' + axis] - self['s' + axis.toLowerCase()]) * self.factor;
    var size = self[styles['dimension']];
    if (push < 0) {
      size += push;
      push = 0;
    }

    self.indicator.setAttribute('style', styles['indicator'] + styles['push']
      + ':' + push + ';' + styles['dimension'] + ':'
      + size + ';');
  }, this.options.wait);
};

Minimap.prototype._setupSmartMinimap = function() {
  var self = this;
  window.onresize = function() {
    util.onFinalEvent(function() {
      self.regenerate();
    }, self.options.wait, 'smart_minimap');
  };
};

Minimap.prototype.render = function() {
  this.minimap = document.createElement('div');

  // Generate map landmarks.
  var identifiers = Object.keys(this.elements);
  for (var i = 0, ii = identifiers.length; i < ii; i += 1) {
    var identifier = identifiers[i]
    var elements = this.elements[identifier];
    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var el = elements[j];
      this._scaleElementProperties(el);

      var landmark = document.createElement('div');
      landmark.setAttribute('class', 'minimap-element minimap-el-' + j
          + ' mini-' + identifier);
      landmark.setAttribute('style', 'left:' + el.left + ';top:' + el.top
          + ';width:' + el.width + ';height:' + el.height
          + ';position:absolute;');
      this.minimap.appendChild(landmark);
    }
  }

  // Minimap wrapper stylings.
  this.minimap.setAttribute('class', 'minimap-wrapper')
  this.minimap.setAttribute('style', 'position:relative;width:' + this.mx
      + ';height:' + this.my + ';');

  this.container.appendChild(this.minimap);
  this._minimapListen();
  this._addIndicators();
};

// Make minimap listen for clicks.
Minimap.prototype._minimapListen = function() {
  var self = this;
  this.minimap.onclick = function(ev) {
    if (self.orientation === 'landscape') {
      var left = (ev.pageX - document.body.scrollLeft - self.minimap.offsetLeft) / self.factor;
      document.body.scrollLeft = left;
    } else {
      var top = (ev.pageY - document.body.scrollTop - self.minimap.offsetTop) / self.factor;
      document.body.scrollTop = top;
    }
  };
};

Minimap.prototype._scaleElementProperties = function(el) {
  el.left = Math.round((el.left - this.sx) * this.factor);
  el.top = Math.round((el.top - this.sy) * this.factor);
  el.width = Math.round(el.width * this.factor);
  el.height = Math.round(el.height * this.factor);
};

Minimap.prototype._addIndicators = function() {
  this.indicator = document.createElement('div');

  this.indicator.setAttribute('class', 'minimap-indicator');
  this.indicator.setAttribute('style',
      Minimap.STYLES[this.orientation]['indicator']);

  this.minimap.appendChild(this.indicator);
};

Minimap.prototype.remove = function() {
  clearInterval(this.interval);
  if (this.minimap) {
    this.container.removeChild(this.minimap);
    this.minimap = null;
  }
};

Minimap.prototype.calculate = function(width, height) {
  // Largest x/y (left/top) values.
  this.mx = 0;
  this.my = 0;

  // Smallest x/y values, for balancing the minimap.
  this.sx = Number.MAX_VALUE;
  this.sy = Number.MAX_VALUE;

  // Max width.
  this.width = width ? Math.min(width, window.innerWidth) : window.innerWidth;
  // Max height.
  this.height = height ? Math.min(height, window.innerHeight) : window.innerHeight;

  this._extractElements();
  this._calculateScale();

  this._initializeIntervalHandlers();
};

Minimap.prototype.recalculate = Minimap.prototype.calculate;

// Should be called when you know new elements are going to be added.
// It's too expensive to call on timeout to detect new elements.
Minimap.prototype.regenerate = function() {
  this.remove();
  this.recalculate(this.options.width, this.options.height);
  if (!this.options.smart || this.orientation != 'no-scroll') {
    this.render();
  }
};

Minimap.STYLES = {
  default: {
    indicator: 'position:absolute;left:0;right:0;', // Set height/top accordingly.
    push: 'top',
    dimension: 'height',
    axis: 'Y'
  },
  landscape: {
    indicator: 'position:absolute;top:0;bottom:0;', // Set width/left accordingly.
    push: 'left',
    dimension: 'width',
    axis: 'X'
  },
  'no-scroll': {
    indicator: 'display:none;',
    // The rest don't matter.
    push: 'left',
    dimension: 'width',
    axis: 'X'
  }
};
