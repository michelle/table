// TODO(stretch): support non-rectangular maps.
// TODO: create base map.
// TODO: anchors for adjusting sizes.
// TODO: change colors.
// TODO: grid/snap to grid.

function Map(/* add | create | edit | view */ type, map) {
  this.name = map.name;
  this.tables = map.tables || [];
  this.points = map.points || [];
  this.scale = Scale.getMapScale(Scale.display(type), map.width, map.height);
  this.width = map.width;
  this.height = map.height;

  // Post updates to ID if available.
  this.id = map.id;

  this.$container = $('.map-' + type);
  // TODO: consider if margin: 0 auto is wanted to display map.
  // TODO: consider if borders around tables.
  this.offset = map.offset;
  this.type = type;

  if (map.tables) {
    this.render();
  }
  this.initializeDOM();
};

Map.prototype.initializeDOM = function() {
  console.log('Initialize DOM handlers');
  var self = this;

  if (['create', 'edit'].indexOf(this.type) !== -1) {
    this.registerKeys();

    this.creating = true;
    var $table;

    // Drawing.
    // TODO: refactor & split into a Draw class.
    this.$container.on('mousedown', function(e) {

      $table = $('<div></div>').addClass('table');
      self.addTableHandlers($table);
      self.mousedown = { x: e.pageX, y: e.pageY };

      $table.css({
        left: self.mousedown.x - self.offset.left,
        top: self.mousedown.y - self.offset.top
      });
    })

    $(window).on('mousemove', function(e) {
      if (!self.mousedown) {
        return;
      }

      if ($table) {
        self.$container.append($table);
        self.setSelected($table);
        $table = null;
      }

      var mx = e.pageX, // Current position.
          my = e.pageY,
          cx = self.mousedown.x, // Mousedown position.
          cy = self.mousedown.y;

      if (!self.creating) {

        var dx = cx - self.selected_offset.left, // Left/top diffs.
            dy = cy - self.selected_offset.top;

        var left = mx - self.offset.left - dx,
            top = my - self.offset.top - dy;

        var table_width = self.$selected.width(),
            table_height = self.$selected.height();

        if (left >= 0
            && top >= 0
            && left + table_width <= self.width
            && top + table_height <= self.height) {
          self.$selected.css({
            left: left,
            top: top
          });
        } else {
          self.$selected.css({
            left: Math.min(Math.max(0, left), self.width - table_width),
            top: Math.min(Math.max(0, top), self.width - table_height)
          });

        }

      } else {

        var width = Math.abs(cx - mx),
            height = Math.abs(cy - my);

        if (mx < cx) { // mouse moving left.
          var left = cx - self.offset.left - width;
          if (left < 0) {
            left = 0;
            width = self.$selected.width();
          }
          self.$selected.css({
            left: left
          });
        } else if (mx > self.offset.left + self.width) {
          width = self.width - self.selected_offset.left + self.offset.left;
        }

        if (my < cy) { // mouse moving up.
          var top = cy - self.offset.top - height;
          if (top < 0) {
            top = 0;
            height = self.$selected.height();
          }
          self.$selected.css({
            top: top
          });
        } else if (my > self.offset.top + self.height) {
          height = self.height - self.selected_offset.top + self.offset.top;
        }

        self.$selected.css({
          width: width,
          height: height
        });


      }
    }).on('mouseup', function(e) {
      self.creating = true;
      delete self.mousedown;
    });

  }

  // Save the configuration.
  $('.save').click(function() {
    self.save();
  });
};

Map.prototype.registerKeys = function() {
  var self = this;
  // Backspace removes selected table in create/edit modes.
  $(window).on('keyup', function(e) {
    var kc = e.keyCode || e.which;
    if (kc === 8) {
      self.deleteSelected();
      e.preventDefault();
    }
  });
};

Map.prototype.setSelected = function($table) {
  // TODO: handle multiple.
  if (this.$selected) {
    this.$selected.removeClass('selected');
  }

  this.$selected = $table;
  this.$selected.addClass('selected');
  this.selected_offset = this.$selected.offset();
};

Map.prototype.deleteSelected = function() {
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
    if (['edit', 'create'].indexOf(this.type) !== -1) {
      this.addTableHandlers($table);
    }
    this.$container.append($table);
  }
};

Map.prototype.addTableHandlers = function($table) {
  var self = this;
  $table.on('mousedown', function(e) {
    self.creating = false;
    self.mousedown = { x: e.pageX, y: e.pageY };
    self.setSelected($table);
    e.stopPropagation();
  });
};

Map.prototype.save = function() {
  if (['create', 'edit'].indexOf(this.type) !== -1) {
    this.saveTables();
  } else if (this.type === 'add') {
    this.savePoint();
  }
};

Map.prototype.saveTables = function() {
  var self = this;
  this.tables = [];

  // TODO: labels.
  $('.table').each(function() {
    var offset = $(this).offset();

    self.tables.push({
      x: offset.left - self.offset.left,
      y: offset.top - self.offset.top,
      width: $(this).width(),
      height: $(this).height(),
      color: $(this).css('backgroundColor')
    });
  });

  console.log(this.toJSONString());
  // TODO: post.
};

// Only point info should be posted.
Map.prototype.savePoint = function() {
  // TODO: post.
};

Map.prototype.toJSON = function() {
  return {
    name: this.name,
    tables: this.tables,
    offset: this.offset,
    width: this.width,
    height: this.height
  }
};

Map.prototype.toJSONString = function() {
  return JSON.stringify(this.toJSON());
};
