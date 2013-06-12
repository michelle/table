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
  }
};

function Minimap(tracked, container, options) {
  // Maps tracked elements to a list of their top, left, width, and height values.
  this.elements = {};

  // Largest x/y (left/top) values.
  this.mx = 0;
  this.my = 0;

  // Smallest x/y values, for balancing the minimap.
  this.sx = Number.MAX_VALUE;
  this.sy = Number.MAX_VALUE;

  // Multiplication factor.
  this.factor = 1;

  // By default a vertical minimap.
  this.orientation = 'default';

  // Save container.
  this.container = util.getElementsBySelector(container)[2][0];

  // TODO: options, util extending fn.
  options = options || {};
  // Max width.
  this.width = options.width ? Math.min(options.width, window.innerWidth) : window.innerWidth;
  // Max height.
  this.height = options.height ? Math.min(options.height, window.innerHeight) : window.innerHeight;

  this._extractElements(tracked);
  this._calculateScale();

  this._initializeScrollHandlers();

  this._render();
  // TODO: handlers for window resize, etc. How to best handle or not handle?
};

// TODO: browser compatibility.
// Find max x, y, and saves all dimensions.
Minimap.prototype._extractElements = function(identifiers) {
  for (var i = 0, ii = identifiers.length; i < ii; i += 1) {
    var identifier = identifiers[i];
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
    this.orientation = 'landscape';
  }

  this.mx *= this.factor;
  this.my *= this.factor;

  this.width *= this.factor;
  this.height *= this.factor;
};

// Detects scroll & changes active position on minimap.
Minimap.prototype._initializeScrollHandlers = function() {
  // window.scrollTo!
  var self = this;
  var styles = Minimap.STYLES[this.orientation];
  this.timeout = setInterval(function() {
    var axis = styles['axis'];
    var push = (window['scroll' + axis] - self['s' + axis.toLowerCase()]) * self.factor;
    self.indicator.setAttribute('style', styles['indicator'] + styles['push']
      + ':' + push + ';' + styles['dimension'] + ':'
      + self[styles['dimension']] + ';');
    console.log(styles['dimension'])
  }, 1000);
};

Minimap.prototype._render = function() {
  var minimap = document.createElement('div');

  // Generate map landmarks.
  var identifiers = Object.keys(this.elements);
  for (var i = 0, ii = identifiers.length; i < ii; i += 1) {
    var identifier = identifiers[i]
    var elements = this.elements[identifier];
    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var el = elements[j];
      el.left = Math.round((el.left - this.sx) * this.factor);
      el.top = Math.round((el.top - this.sy) * this.factor);
      el.width = Math.round(el.width * this.factor);
      el.height = Math.round(el.height * this.factor);

      var landmark = document.createElement('div');
      landmark.setAttribute('class', 'minimap-element minimap-el-' + j
          + ' mini-' + identifier);
      landmark.setAttribute('style', 'left:' + el.left + ';top:' + el.top
          + ';width:' + el.width + ';height:' + el.height
          + ';position:absolute;');
      minimap.appendChild(landmark);
    }
  }

  // Minimap wrapper stylings.
  minimap.setAttribute('class', 'minimap-wrapper')
  minimap.setAttribute('style', 'position:relative;width:' + this.mx
      + ';height:' + this.my + ';');

  this.minimap = minimap;
  this.container.appendChild(minimap);
  this._addIndicators();
};

Minimap.prototype._addIndicators = function() {
  this.indicator = document.createElement('div');

  this.indicator.setAttribute('class', 'minimap-indicator');
  this.indicator.setAttribute('style',
      Minimap.STYLES[this.orientation]['indicator']);

  this.minimap.appendChild(this.indicator);
};

// TODO: Clean up DOM and timeout.
Minimap.prototype.remove = function() {
  clearTimeout(this.timeout);

};

Minimap.STYLES = {
  default: {
    indicator: 'position:absolute;left:0;right:0;', // Set height/top accordingly.
    push: 'top',
    dimension: 'height',
    axis: 'Y'
  },
  landscape: {
    indicator: 'position:absolute:top:0;bottom:0;', // Set width/left accordingly.
    push: 'left',
    dimension: 'width',
    axis: 'X'
  }
};
