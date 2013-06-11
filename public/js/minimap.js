var util = {
  // Support for basic selectors for purposes of raw DOM minimap.
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

  // Smallest x/y values, for purposes of auto-balancing..
  this.sx = Number.MAX_VALUE;
  this.sy = Number.MAX_VALUE;

  // Multiplication factor.
  this.factor = 1;

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

// TODO: borders.
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
};

// TODO: onscroll or requestAnimationFrame check for scrollTop?
// Detects scroll & changes active position on minimap.
Minimap.prototype._initializeScrollHandlers = function() {

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
      landmark.setAttribute('class', '_mini-el _mini-el-' + j + ' mini-' + identifier);
      landmark.setAttribute('style', 'left:' + el.left + ';top:' + el.top
          + ';width:' + el.width + ';height:' + el.height
          + ';position:absolute;');
      minimap.appendChild(landmark);
    }
  }

  // Minimap wrapper stylings.
  minimap.setAttribute('class', '_mini-wrap')
  minimap.setAttribute('style', 'position:relative;');

  this.container.appendChild(minimap);
  this._addIndicators();
};

Minimap.prototype._addIndicators = function() {
  var highlight = document.createElement('div');
  var track_top = document.createElement('div');
  var track_bottom = document.createElement('div');

  highlight.setAttribute('class', '_mini-highlight');
  track_top.setAttribute('class', '_mini-track-top');
  track_bottom.setAttribute('class', '_mini-track-bottom');

  highlight.setAttribute('style', 'position:absolute;left:0;right:0');

  this.indicators = document.createElement('div');
  this.indicators.setAttribute('class', '_mini-indicators');
  this.indicators.appendChild(highlight);
  this.indicators.appendChild(track_top);
  this.indicators.appendChild(track_bottom);

  this.container.appendChild(this.indicators);
};
