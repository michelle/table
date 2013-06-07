// TODO: jquery.minimap?
function Minimap(tracked, options) {
  // Maps tracked elements to a list of their top, left, width, and height values.
  this.elements = {};

  // Largest x/y (left/top) values.
  this.mx = 0;
  this.my = 0;

  // Multiplication factor.
  this.factor = 1;

  // TODO: options, util extending fn.
  options = options || {};
  // Max width.
  this.width = options.width ? Math.min(options.width, window.innerWidth) : window.innerWidth;
  // Max height.
  this.height = options.height ? Math.min(options.height, window.innerHeight) : window.innerHeight;

  this._extractElements(tracked);
  this._calculateScale();

  this._initializeScrollHandlers();

  // TODO: handlers for window resize, etc. How to best handle or not handle?
};

// TODO: browser compatibility.
// Find max x, y, and saves all dimensions.
Minimap.prototype._extractElements = function(classes) {
  for (var i = 0, ii = classes.length; i < ii; i += 1) {
    var cl = classes[i];
    var elements = document.getElementsByClassName(cl);
    var extracted = [];

    this.elements[cl] = extracted;

    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var element = elements[j];

      var left = element.offsetLeft,
          top = element.offsetTop,
          width = element.offsetWidth,
          height = element.offsetHeight;

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

// Resizes elements. <- do in same loop as render.
/*Minimap.prototype._resizeElements = function() {
  var classes = Object.keys(this.elements);
  for (var i = 0, ii = classes.length; i < ii; i += 1) {
    var elements = this.elements[classes[i]];
    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var element = elements[j];
      element.left *= this.factor;
      element.top *= this.factor;
      element.width *= this.factor;
      element.height *= this.factor;
    }
  }
};*/

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

// TODO: better way to do raw dom nodes?
Minimap.prototype.render = function() {
  var map = '';
  var classes = Object.keys(this.elements);
  for (var i = 0, ii = classes.length; i < ii; i += 1) {
    var cl = classes[i]
    var elements = this.elements[cl];
    for (var j = 0, jj = elements.length; j < jj; j += 1) {
      var element = elements[j];
      element.left = Math.round(element.left * this.factor);
      element.top = Math.round(element.top * this.factor);
      element.width = Math.round(element.width * this.factor);
      element.height = Math.round(element.height * this.factor);

      // TODO: sample stylesheet.
      map += '<div class="_mini-el _mini-el-' + j + ' mini-' + cl;
      map += '" style="left:' + element.left;
      map += ';top:' + element.top;
      map += ';width:' + element.width;
      map += ';height:' + element.height;
      map += ';position:absolute;"></div>'
    }

    return map;
  }
};
