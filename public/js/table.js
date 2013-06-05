function Table($el) {
  this.$el = $el;
}

Table.prototype.toJSON = function() {
  return {
    x: $el.offsetLeft,
    y: $el.offsetTop,
    width: $el.offsetWidth,
    height: $el.offsetHeight
  };
}



tables = [];

/** Table: { x: ?, y: ?, w: ?, h: ? } */

function add(x, y, w, h) {
  tables.push({ 'x': x, 'y': y, 'w': w, 'h': h });
};

$(function() {
    var $container = $('#map');

    $container.on('mousedown', function(e) {
		var left_adjust = $container.offset().left;
		var top_adjust = $container.offset().top;
        var click_y = e.pageY;
        var click_x = e.pageX;
	    var $selection = $('<div>').addClass('selection-box wood').mousedown(function(e) {
			e.stopPropagation();
			$('.selection-box').each(function() { $(this).removeClass('selected'); })
			$(this).addClass('selected');
			var diff_x = e.pageX - $(this).offset().left;
			var diff_y = e.pageY - $(this).offset().top;
			var oppdiff_x = $(this).offset().left + $(this).width() - e.pageX;
			var oppdiff_y = $(this).offset().top + $(this).height() - e.pageY;
			
			$container.mousemove(function(e) {
				var move_x = e.pageX,
	                move_y = e.pageY;
				
				if (move_x + oppdiff_x < left_adjust + $container.width() 
						&& move_y + oppdiff_y < top_adjust + $container.height()
						&& move_x - diff_x > left_adjust
						&& move_y - diff_y > top_adjust) {
	            	$selection.css({
	                	'left': move_x - left_adjust - diff_x
	            	});
					$selection.css({
		                'top': move_y - top_adjust - diff_y
		            });
				} else {
					$(this).mouseup();
				}
	            
			}).on('mouseup', function(e) {
		    	$(this).off('mousemove');
		    });
		});

        $selection.css({
          'top':    click_y - top_adjust,
          'left':   click_x - left_adjust,
          'width':  0,
          'height': 0
        });

        $container.on('mousemove', function(e) {
			$selection.appendTo($container);
            var move_x = e.pageX,
                move_y = e.pageY,
                width  = Math.abs(move_x - click_x),
                height = Math.abs(move_y - click_y);

            $selection.css({
                'width':  width,
                'height': height
            });
            if (move_x < click_x) { //mouse moving left instead of right
                $selection.css({
                    'left': (click_x - left_adjust) - width
                });
            }
            if (move_y < click_y) { //mouse moving up instead of down
                $selection.css({
                    'top': (click_y - top_adjust) - height
                });
            }
        }).on('mouseup', function(e) {
            $container.off('mousemove');
        });
	$('html').keyup(function(e){
	  if(e.keyCode == 88) $('.selected').remove();
  }) 

    });
	$('#save').on('click', function() {
		var count = $('.selection-box').length;
		$('.selection-box').each(function(el) {
			add($(this).position().left, $(this).position().top, $(this).width(), $(this).height());
			if (!--count) {
				console.log(JSON.stringify(tables));
		  		$('#mapdata').val(JSON.stringify(tables));
			}
		})
	});

});





