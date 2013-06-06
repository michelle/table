// TODO(stretch): support non-rectangular maps.
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

}

// Base map already exists.
function Map(/* add | create | edit | view */ type, map) {
  this.name = map.name;
  this.tables = map.tables || [];
  this.scale = Scale.getMapScale(Scale.display(type), map.width, map.height);

  this.$container = $('.map-' + type);
  // TODO: consider if margin: 0 auto is wanted to display map.
  // TODO: consider if borders around tables.
  this.offset = map.offset;
  this.type = type;

  // Don't save unnecessary changes.
  this.changed = false;

  if (map.tables) {
    this.render();
  }
  this.initializeDOM();
};

Map.prototype.initializeDOM = function() {
  console.log('Initialize DOM handlers');
  var self = this;

  // Backspace removes selected table in create/edit modes.
  if (['create', 'edit'].indexOf(this.type) !== -1) {
    $(window).on('keyup', function(e) {
      var kc = e.keyCode || e.which;
      if (kc === 8) {
        self.deleteSelected();
        e.preventDefault();
      }
    });


    this.creating = true;
    this.mousedown = false;
    // Click x, y position.
    var cx = 0,
        cy = 0;

    this.$container.on('mousedown', function(e) {
      cx = e.pageX;
      cy = e.pageY;

      var $table = $('<div></div>').addClass('table');
      self.addTableHandlers($table);
      self.setSelected($table);
      self.mousedown = true;

      $table.css({
        left: cx - self.offset.left,
        top: cy - self.offset.top
      });
      self.$container.append($table);

    }).on('mousemove', function(e) {
      if (!self.mousedown) {
        return;
      }

      var mx = e.pageX,
          my = e.pageY;

      if (!self.creating) {

        if (false) {
          self.$selection.css({
            left: mx,
            top: my
          });
        } else {
          self.$container.mouseup();
        }

      } else {

        var width = Math.abs(cx - mx),
            height = Math.abs(cy - my);

        self.$selected.css({
          width: width,
          height: height
        });

        if (mx < cx) { // mouse moving left.
          self.$selected.css({
            left: cx - self.offset.left - width
          });
        }
        if (my < cy) { // mouse moving up.
          self.$selected.css({
            top: cy - self.offset.top - height
          });
        }

      }
    }).on('mouseup', function(e) {
      self.mousedown = false;
    });

  }

  // Save the configuration.
  $('.save').click(function() {
    self.save();
  });
};

Map.prototype.setSelected = function($table) {
  // TODO: handle multiple.
  if (this.$selected) {
    this.$selected.removeClass('selected');
  }

  this.$selected = $table;
  this.$selected.addClass('selected');
};

Map.prototype.deleteSelection = function() {
  // TODO: handle multiple.
  if (this.$selected) {
    this.$selected.remove();
  }
};

Map.prototype.render = function() {
  for (var i = 0, ii = this.tables.length; i < ii; i += 1) {
    var table = this.tables[i];
    var $table = $('<div></div>').addClass('table').css({
      left: table.x * this.scale,
      top: table.y * this.scale,
      width: table.width * this.scale,
      height: table.height * this.scale,
      backgroundColor: table.color
    });

    // Make sure correct table is selected in edit mode.
    if (this.type === 'edit') {
      this.addTableHandlers($table);
    }
    this.$container.append($table);
  }
};

Map.prototype.addTableHandlers = function($table) {
  var self = this;
  $table.on('mousedown', function(e) {
    self.creating = false;
    self.setSelected($table);
    e.stopPropagation();
  }).on('mouseup', function(e) {
    self.creating = true;
  });
};

Map.prototype.save = function() {
  if (this.changed) {
    if (['create', 'edit'].indexOf(this.type) !== -1) {
      this.saveTables();
    } else if (this.type === 'add') {
      this.savePoint();
    }
  }
};

Map.prototype.saveTables = function() {
  var self = this;
  this.tables = [];

  // TODO: labels.
  $('.table').each(function(el) {
    var offset = $(el).offset();

    self.tables.push({
      x: offset.left - self.offset.left,
      y: offset.top - self.offset.top,
      width: $(el).width(),
      height: $(el).height(),
      color: $(el).css('backgroundColor')
    });
  });

  console.log('Updating tables', self.tables);
  // TODO: post.
};

Map.prototype.savePoint = function() {

  // TODO: post.
};

// Sample initialize.
$(document).ready(function() {
  // Dummy data.
  var dummy = {
    name: 'Tester',
    tables: [{x:50, y:50, width:30, height:30, color:'red'}, {x:100,y:150,width:400,height:350,color:'blue'}],
    width: 500,
    height: 500,
    offset: { top: 100, left: 100 }
  }
  new Map('create', dummy);
});
