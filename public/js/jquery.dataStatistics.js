$.fn.dataStatistics = function(options) {
	options = $.extend({
		init: 0,
		max: 00000,
		time: 60000,
		len: 6
	}, options || {});

	var _this = this
	var el = '<div class="digit_set"></div>';
	var html = '<div class="digit">' + 
		'  <div class="digit_top">' + 
		'    <span class="digit_wrap"></span>' + 
		'  </div>' + 
		'  <div class="shadow_top"></div>' + 
		'  <div class="digit_bottom">' + 
		'    <span class="digit_wrap"></span>' + 
		'  </div>' + 
		'  <div class="shadow_bottom"></div>' + 
		'</div>';
	// 渲染dom
	function renderHTML (value) {
		var nowNums = value.toString().split('');
		if (_this.find('.digit_set').length !== value.length) {
			for (var v = 0; v < value.length; v ++) {
					_this.append(el)
				if (v === value.length) {
					_this.find('.digit_set').eq(v).addClass('set_last')
				}
			}
		}
		_this.find('.digit_set').each(function() {
			for (i = 0; i <= 9; i++) {
				if ($(this).find('.digit').length !== 10) {
					$(this).append(html);
				}
				currentDigit = $(this).find('.digit')[i];
				$(currentDigit).find('.digit_wrap').html(i);
			}
		});
		$.each(nowNums, function(index, val) {
			var set = _this.find('.digit_set').eq(index);
			var i = parseInt(val)
			set.find('.digit').removeClass('active').eq(i).addClass('active');
			set.find('.digit').removeClass('previous').eq(i + 1).addClass('previous');
		});
	}

	return {
		init: function () {
			let t = ''
			if (options.len) {
				for (i = 0; i < options.len; i ++) {
					t += '0'
				}
			} else {
				t = '00000'
			}
			renderHTML(t)
		},
		render: function (value) {
			renderHTML(value)
		}
	}
};