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

      extracted.push({
        left: left,
        top: top,
        width: width,
        height: height
      });
    }
  }
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

  var identifiers = Object.keys(this.elements);
  for (var i = 0, ii = identifiers.length; i < ii; i += 1) {
    var identifier = identifiers[i]
    var elements = this.elements[identifier];
    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var el = elements[j];
      el.left = Math.round(el.left * this.factor);
      el.top = Math.round(el.top * this.factor);
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

  minimap.setAttribute('class', '_mini-wrap')
  minimap.setAttribute('style', 'position:relative;');

  this.container.appendChild(minimap);
};
