// TODO(stretch): support shaped maps.
var Scale = {
  getMapScale: function(type, w, h) {
    if (type === 'fullscreen') {
      return Scale.fullScale(w, h);
    } else if (type === 'fit') {
      return Scale.fitScale(w, h);
    } else {
      return 1;
    }
  },

  fullScale: function(w, h) {
    // TODO
    return 2;
  },

  fitScale: function(w, h) {
    // TODO
    return 0.5;
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

function Map(/* add | create | edit | view */ type, map) {
  this.name = map.name;
  this.tables = map.tables || [];
  this.scale = Scale.getMapScale(Scale.display(type), map.width, map.height);

  this.$container = $('.map-' + type);
  this.offset = this.$container.offset();
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
        $('.selected').remove();
        e.preventDefault();
      }
    });

    this.$container.on('mousedown', function(e) {
      var x = e.pageX;
      var y = e.pageY;
    });

  }

  // Save the configuration.
  $('.save').click(function() {
    self.save();
  });
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
    this.$container.append($table);
  }
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
      x: offset.left,
      y: offset.top,
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
    tables: [{x:50, y:50, width:30, height:30, color:'red'}, {x:100,y:150,width:100,height:20,color:'blue'}],
    width: 500,
    height: 500
  }
  new Map('view', dummy);
});
