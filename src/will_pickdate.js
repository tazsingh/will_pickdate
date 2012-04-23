//= require jquery.mousewheel

(function($) {

var PROP_NAME = 'will_pickdate';

function will_pickdate() {

  this._defaults = {
    pickerClass: 'wpd',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October',
             'November', 'December'],
    dayShort: 2,
    monthShort: 3,
    startDay: 0, // Sunday (0) through Saturday (6) - be aware that this may affect your layout, since the days on
                 // the right might have a different margin
    timePicker: false,
    timePickerOnly: false,
    yearPicker: true,
    militaryTime: false,
    yearsPerPage: 20,
    format: 'd-m-Y',
    allowEmpty: false,
    inputOutputFormat: 'U', // default to unix timestamp
    animationDuration: 400,
    useFadeInOut: !$.browser.msie, // dont animate fade-in/fade-out for IE
    startView: 'month', // allowed values: {time, month, year, decades}
    positionOffset: { x: 0, y: 0 },
    minDate: null, // { date: '[date-string]', format: '[date-string-interpretation-format]' }
    maxDate: null, // same as minDate
    debug: false,
    toggleElements: null,

    // and some event hooks:
    onShow: $.noop,   // triggered when will_pickdate pops up
    onClose: $.noop,  // triggered after will_pickdate is closed (destroyed)
    onSelect: $.noop  // triggered when a date is selected
  };

}

$.extend(will_pickdate.prototype, {

  // class name is added to elements to indicate they have been configured
  markerClassName: 'will_pickdate',

	/* Override the default settings for all instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (will_pickdate) this object */
//	setDefaults: function(settings) {
//		$.extend(this._defaults, settings || {});
//		return this;
//	},

	/* Attach the max length functionality to an input.
	   @param  input  (element) the control to affect
	   @param  settings  (object) the custom options for this instance
	   @param  index (integer) an index representing the number of datepicker instances */
	_attach_will_pickdate: function(input, options, index) {

		var initial_clone_value, $input, $display_element;

    // store current element specific objects and settings
    this.current = {};
    this.current.settings = $.extend({}, this._defaults, options);

		$input = $(input);
		if ($input.hasClass(this.markerClassName)) {
			return;
		}
		// add class so that we know not to process again
		$input.addClass(this.markerClassName);

    // Bindings
    if(this.current.settings.toggleElements != null && this.current.settings.toggleElements.jquery) {
      this.current.toggler = this.current.settings.toggleElements.eq(index);

      $(document).keydown($.proxy(function(event) {
        if(event.which == 9) this._close(null, true);
      }, this));
    }

    $(document).mousedown($.proxy(this._close, this));



    // set minimum and maximum dates and store within instance properties
    this._setMinMaxDates();

    if (this.current.settings.timePickerOnly) {
      this.current.settings.timePicker = true;
      this.current.settings.startView = 'time';
    }

    // construct input clone for display purposes
    // set initial_clone_value
    if(initial_clone_value = $input.val()) {
      initial_clone_value = this._format(new Date(this._unformat(initial_clone_value,
                                                  this.current.settings.inputOutputFormat)),
                                         this.current.settings.format);
    }
    else if(!this.current.settings.allowEmpty) {
      initial_clone_value = this._format(new Date(), this.current.settings.format);
    }
    else {
      initial_clone_value = '';
    }
    this.current.display = $input.css('display');
    $display_element = $input.css('display', this.current.settings.debug ? this.current.display : 'none')
            .clone(true) // make copy of input element
            .removeAttr('name') // remove name attribute so value is not posted to server
            .attr('id', $input.attr('id') + '_display') // avoid id conflict
            .css('display', this.current.display) // set display
            .val(initial_clone_value); // set initial value
    $input.before($display_element); // place clone before i/o element

    // set value and display elements
    this.current.value_element = $input[0];
    this.current.display_element = $display_element[0];


    if(this.current.toggler) {
      this.current.toggler.css('cursor', 'pointer').click($.proxy(function(event) {
        this._onFocus(event);
      }, this));

      $display_element.blur($.proxy(function() {
        this.current.value_element.val(this.current.display_element.val());
      }, this));
    }
    else {
      $display_element.bind({
        'keydown': $.proxy(function(e) {
          if(this.current.settings.allowEmpty && (e.which == 46 || e.which == 8)) { // delete or backspace
            $(this.current.value_element).val('');
            $(e.target).val('');
            this._close(null, true);
          }
          else if(e.which == 9 || e.which == 27) { // tab or esc
            this._close(null, true);
          }
          else {
            e.preventDefault();
          }
        }, this),
        'focus': $.proxy(function(event) {
          this._onFocus(event);
        }, this)
      });
    }

    // store element specific instance properties, but must use display_element as that is the element
    // which triggers onfocus
		$.data($display_element[0], PROP_NAME, this.current);

	},


	/* Each time a datepicker has focus, the will_pickdate manager will reset
	   the defaults for the partical elements selected. It does so using $.data calls. */
  _onFocus: function(event) {
    var element = event.target,
        inst_props = $.data(element, PROP_NAME);

    // set current settings for will_pickdate manager
    this.current = inst_props;

    if (this.current.working_date == undefined) {
      init_visual_date = new Date();
      if (this.current.maxDate || this.current.minDate) {
        if(this.current.maxDate && init_visual_date.valueOf() > this.current.maxDate.valueOf()) {
          this.current.working_date = new Date(this.current.maxDate.valueOf());
        }
        if(this.current.minDate && init_visual_date.valueOf() < this.current.minDate.valueOf()) {
          this.current.working_date = new Date(this.current.minDate.valueOf());
        }
        if (this.current.working_date == undefined) this.current.working_date = init_visual_date;
      } else {
        this.current.working_date = init_visual_date;
      }
    }

    this._show();
  },

	// Set minimum and maximum dates and store on given instance properties object
  _setMinMaxDates: function() {
    if (this.current.settings.minDate && this.current.settings.minDate.format) {
      this.current.minDate = this._unformat(this.current.settings.minDate.date, this.current.settings.minDate.format);
    }
    if (this.current.settings.maxDate && this.current.settings.maxDate.format) {
      this.current.maxDate = this._unformat(this.current.settings.maxDate.date, this.current.settings.maxDate.format);
    }
  },

  /* Format a given date object into a time string
     @param t (Date) A date to produce a string from.
     @param t (format) The string format that the date should produce.
     @return (String) A pretty date string */
  _format: function(t, format) {
    var f = '',
      h = t.getHours(),
      m = t.getMonth();

    for (var i = 0; i < format.length; i++) {
      switch(format.charAt(i)) {
        case '\\': i++; f+= format.charAt(i); break;
        case 'y': f += (100 + t.getYear() + '').substring(1); break;
        case 'Y': f += t.getFullYear(); break;
        case 'm': f += this._leadZero(m + 1); break;
        case 'n': f += (m + 1); break;
        case 'M': f += this._defaults.months[m].substring(0,this._defaults.monthShort); break;
        case 'F': f += this._defaults.months[m]; break;
        case 'd': f += this._leadZero(t.getDate()); break;
        case 'j': f += t.getDate(); break;
        case 'D': f += this._defaults.days[t.getDay()].substring(0,this._defaults.dayShort); break;
        case 'l': f += this._defaults.days[t.getDay()]; break;
        case 'G': f += h; break;
        case 'H': f += this._leadZero(h); break;
        case 'g': f += (h % 12 ? h % 12 : 12); break;
        case 'h': f += this._leadZero(h % 12 ? h % 12 : 12); break;
        case 'a': f += (h > 11 ? 'pm' : 'am'); break;
        case 'A': f += (h > 11 ? 'PM' : 'AM'); break;
        case 'i': f += this._leadZero(t.getMinutes()); break;
        case 's': f += this._leadZero(t.getSeconds()); break;
        case 'U': f += Math.floor(t.valueOf() / 1000); break;
        default:  f += format.charAt(i);
      }
    }
    return f;
  },

  /* Pad a string with zeroes
     @param v (String) The string to pad.
     @return (String) The padded string. */
  _leadZero: function(v) {
    return v < 10 ? '0'+v : v;
  },

  /* Format a given time string into a date object
     @param t (String) The string to produce a Date from
     @param format (String) A datetime pattern that the string is formatted with.
     @return (Date) A valid date object */
  _unformat: function(t, format) {
    // presumably the mask and date will split identically
    // date portions must be separated by a non-word character
    var d = new Date(),
        maskParts = format.split(/\W+/),
        dateParts = t.split(/\W+/),
        offset = 0, notCounter = 0, part,
        target, targetMask;

    for (var i = 0; i < maskParts.length; i++) {
      targetMask = maskParts[i];
      target = dateParts[i];
      switch(targetMask) {
        case 'yyyy': d.setFullYear(target); break; // year with four digits
        case 'm':                             // month without leading zero (0-11)
        case 'mm': d.setMonth(target); break; // month with leading zero (00-11)
        case 'd':                             // day without leading zero (1-31)
        case 'dd': d.setDate(target); break;  // day with leading zero (01-31)
        case 'H':                             // hours without leading zero (24-hour clock)
        case 'HH': d.setHours(target); break; // hours with leading zero (24-hour clock)
        case 'M':                               // minutes without leading zero
        case 'MM': d.setMinutes(target); break; // minutes with leading zero
        case 'S':                                   // seconds without leading zero
        case 'SS': d.setSeconds(target); break;     // seconds with leading zero
        case 'l':                                   // Milliseconds, 3 digits
        case 'L': d.setMilliseconds(target); break; // Milliseconds, 2 digits
        case 'U': d = new Date(parseInt(target, 10) * 1000); break; // number of milliseconds since epoch
        default:
          notCounter += 1;
      }

    }
    if (notCounter > 0 || maskParts.length != dateParts.length) {
      console.warn("will_pickdate: Portions of the date given (" + t + ") were not parsed properly according to" +
                   " the input format (" + format + ").");
    }
    return d;
  },

  /* Create an object from a date
     @param d (Date) The date object.
     @return (Object) The object containing the date's properties. */
  _dateToObject: function(d) {
    return {
      year: d.getFullYear(),
      month: d.getMonth(),
      day: d.getDate(),
      hours: d.getHours(),
      minutes: d.getMinutes(),
      seconds: d.getSeconds()
    }
  },

  /* Create a date from an object
     @param (Object) The object containing the date's properties.
     @return d (Date) The date object. */
  _dateFromObject: function(values) {
    var d = new Date(), v;
    d.setDate(1);
    $.each(['year', 'month', 'day', 'hours', 'minutes', 'seconds'], $.proxy(function(index, value) {
      v = values[value];
      if(!(v || v === 0)) return;
      switch(value) {
        case 'day': d.setDate(v); break;
        case 'month': d.setMonth(v); break;
        case 'year': d.setFullYear(v); break;
        case 'hours': d.setHours(v); break;
        case 'minutes': d.setMinutes(v); break;
        case 'seconds': d.setSeconds(v); break;
      }
    }, this));
    return d;
  },

  // show the datepicker
  _show: function() {

    this.current.today = new Date();
    this.current.choice = this._dateToObject(this.current.working_date);
    this.current.mode = (this.current.settings.startView == 'time' &&
                         !this.current.settings.timePicker) ? 'month' : this.current.settings.startView;
    this._render();

    this.current.picker.css(this._pickerPosition());

    if($.isFunction(this.current.settings.onShow))
      this.current.settings.onShow(this);
  },

  // Calculate position for picker. Returns object for use with css.
  _pickerPosition: function() {
    // base position is top left corner of visual input plus offset specified by user options
    var $display_element = $(this.current.display_element),
        position = { left: $display_element.offset().left + this.current.settings.positionOffset.x,
                     top: $display_element.offset().top + this.current.settings.positionOffset.y },
        docHeight = $(window).height(),
        scrollTop = $(window).scrollTop(),
        pickerHeight = this.current.picker.outerHeight(),
        lowerDifference = Math.abs(docHeight - position.top + $display_element.outerHeight()),
        upperDifference = position.top + scrollTop,
        displayBelow = lowerDifference > pickerHeight,
        displayAbove = upperDifference > pickerHeight;

    if (!displayAbove && !displayBelow) {
      // display at midpoint of available screen realestate
      position.top = docHeight / 2 - pickerHeight / 2;
      if (docHeight + scrollTop < pickerHeight) {
        console.warn("will_pickdate: Not enough room to display date picker.")
      }

    } else if (displayBelow) {
      // display below takes priority over display above
      position.top += $display_element.outerHeight();
    } else {
      // display at offset above visual element
      position.top -= pickerHeight;
    }
    return position;
  },

  // Build the datepicker and display it
  _render: function(use_fx) {
    if(!this.current.picker) {
      this._constructPicker();
    }
    else {
      var o = this.current.oldContents;
      this.current.oldContents = this.current.newContents;
      this.current.newContents = o;
      this.current.newContents.empty();
    }

    var startDate = new Date(this.current.working_date.getTime());
    this.current.limit = { right: false, left: false };

    switch(this.current.mode) {
      case 'decades': this._renderDecades(); break;
      case 'year': this._renderYear(); break;
      case 'time': this._renderTime(); this.current.limit = { right: true, left: true }; break;
      default: this._renderMonth();
    }

    this.current.picker.find('.previous').toggleClass('disabled',this.current.limit.left);
    this.current.picker.find('.next').toggleClass('disabled',this.current.limit.right);
    this.current.picker.find('.title').css('cursor', this._allowZoomOut() ? 'pointer' : 'default');

    this.current.working_date = startDate;

    if(this.current.settings.useFadeInOut) {
      this.current.picker.fadeIn(this.current.settings.animationDuration);
    }

    if(use_fx) this._fx(use_fx);
  },

  // Build the datepicker dom elements
  _constructPicker: function() {
    $(document.body).append(this.current.picker = $('<div class="' + this.current.settings.pickerClass + '" />'));
    if(this.current.settings.useFadeInOut) {
      this.current.picker.hide();
    }

    var h, title_cont, b;

    this.current.picker.append(h = $('<div class="header"/>'));
    h.append(title_cont = $('<div class="title"/>').click($.proxy(this._zoomOut, this)));

    h.append($('<div class="previous">&larr;</div>').click($.proxy(this._previous, this)));
    h.append($('<div class="next">&rarr;</div>').click($.proxy(this._next, this)));
    h.append($('<div class="closeButton">x</div>').click($.proxy(this._close, this)));
    title_cont.append($('<span class="titleText"/>'));

    this.current.picker.append(b = $('<div class="body"/>'));
    this.current.bodyHeight = b.outerHeight();
    this.current.bodyWidth = b.outerWidth();
    b.append(this.current.slider = $('<div style="position:absolute;top:0;left:0;width:' + 2 * this.current.bodyWidth +
      'px;height:' + 2 * this.current.bodyHeight + 'px" />'));

    this.current.slider.append(this.current.oldContents = $('<div style="position:absolute;top:0;left:' +
      this.current.bodyWidth + 'px;width:' + this.current.bodyWidth + 'px;height:' +
      this.current.bodyHeight +  'px" />'));

    this.current.slider.append(this.current.newContents = $('<div style="position:absolute;top:0;left:0;width:' +
      this.current.bodyWidth + 'px;height:' + this.current.bodyHeight + 'px" />'));
  },

  // Return true if datepicker can zoom to a larger pick range
  _allowZoomOut: function() {
    if (this.current.mode == 'time' && this.current.settings.timePickerOnly) return false;
    if (this.current.mode == 'decades') return false;
    return !(this.current.mode == 'year' && !this.current.settings.yearPicker);
  },

  // Zoom out to a larger pick range
  _zoomOut: function() {
    if(!this._allowZoomOut()) return;
    switch(this.current.mode) {
      case 'year': this.current.mode = 'decades'; break;
      case 'time': this.current.mode = 'month'; break;
      default: this.current.mode = 'year';
    }
    this._render('fade');
  },

  // Select previous date range
  _previous: function() {
    switch(this.current.mode) {
      case 'decades':
        this.current.working_date.setFullYear(
          this.current.working_date.getFullYear() - this.current.settings.yearsPerPage); break;
      case 'year':
        this.current.working_date.setFullYear(this.current.working_date.getFullYear() - 1); break;
      case 'month':
        this.current.working_date.setMonth(this.current.working_date.getMonth() - 1);
    }
    if(this.current.mode != 'time'){
      this._render('left');
    }
  },

  // Select next date range
  _next: function() {
    switch(this.current.mode) {
      case 'decades':
        this.current.working_date.setFullYear(
          this.current.working_date.getFullYear() + this.current.settings.yearsPerPage); break;
      case 'year':
        this.current.working_date.setFullYear(this.current.working_date.getFullYear() + 1); break;
      case 'month':
        this.current.working_date.setMonth(this.current.working_date.getMonth() + 1);
    }
    if (this.current.mode !='time'){
      this._render('right');
    }
  },

  // Close date picker
  _close: function(e, force) {

    // TODO: NEED TO PASS IN PICKER REFERENCE BECAUSE CURRENT COULD REFERENCE SOMETHING ELSE.. i.e. a newly
    //  created current instance because on_focus was triggered....

    if(!this.current.picker || this.current.closing) return;

    if(force || (e && e.target != this.current.picker && this.current.picker.has(e.target).size() == 0 &&
            e.target != this.current.display_element)) {

      this.current.display_element.blur();
      if(this.current.settings.useFadeInOut) {
        this.current.closing = true;
        this.current.picker.fadeOut(this.current.settings.animationDuration >> 1, $.proxy(this._destroy, this));
      }
      else {
        this._destroy();
      }
    }
  },

  // Remove the picker
  _destroy: function() {
    this.current.picker.remove();
    this.current.picker = null;
    this.current.closing = false;
    if($.isFunction(this.current.settings.onClose)) this.current.settings.onClose(this);
  },

  // Build decade selection options
  _renderDecades: function() {
    while(this.current.working_date.getFullYear() % this.current.settings.yearsPerPage > 0) {
      this.current.working_date.setFullYear(this.current.working_date.getFullYear() - 1);
    }

    this._renderTitle(this.current.working_date.getFullYear() + '-' +
            (this.current.working_date.getFullYear() + this.current.settings.yearsPerPage - 1));

    var i, y, e, available = false, container;

    this.current.newContents.append(container = $('<div class="years"/>'));

    if(this.current.minDate && this.current.working_date.getFullYear() <= this.current.minDate.getFullYear()) {
      this.limit.left = true;
    }

    for(i = 0; i < this.current.settings.yearsPerPage; i++) {
      y = this.current.working_date.getFullYear();
      container.append(e = $('<div class="year year' + i + (y == this.current.today.getFullYear() ? ' today' : '') +
              (y == this.current.choice.year ? ' selected' : '') + '">' + y + '</>'));

      if(this._limited('year')) {
        e.addClass('unavailable');
        if(available) {
          this.current.limit.right = true;
        }
        else {
          this.current.limit.left = true;
        }
      }
      else {
        available = true;
        e.click({year: y}, $.proxy(function(event) {
          this.current.working_date.setFullYear(event.data.year);
          this.current.mode = 'year';
          this._render('fade');
        }, this));
      }
      this.current.working_date.setFullYear(this.current.working_date.getFullYear() + 1);
    }

    if(!available ||
        (this.current.maxDate && this.current.working_date.getFullYear() >= this.current.maxDate.getFullYear())) {
      this.current.limit.right = true;
    }
  },

  // Build Year selection options
  _renderYear: function() {
    var month = this.current.today.getMonth(),
        this_year = this.current.working_date.getFullYear() == this.current.today.getFullYear(),
        selected_year = this.current.working_date.getFullYear() == this.current.choice.year,
        available = false,
        container,
        i,e;

    this._renderTitle(this.current.working_date.getFullYear());
    this.current.working_date.setMonth(0);

    this.current.newContents.append(container = $('<div class="months"/>'));

    for(i = 0; i<= 11; i++) {
      container.append(e = $('<div class="month month' + (i+1) + (i==month && this_year ? ' today' : '') +
              (i==this.current.choice.month && selected_year ? ' selected' : '') + '">' +
              (this.current.settings.monthShort ? this.current.settings.months[i].substring(0, this.current.settings.monthShort) :
                this.current.settings.months[i]) + '</div>'));

      if(this._limited('month')) {
        e.addClass('unavailable');
        if(available) {
          this.current.limit.right = true;
        }
        else {
          this.current.limit.left = true;
        }
      }
      else {
        available = true;
        e.click({month:i}, $.proxy(function(event) {
          this.current.working_date.setDate(1);
          this.current.working_date.setMonth(event.data.month);
          this.current.mode = 'month';
          this._render('fade');
        }, this));
      }
      this.current.working_date.setMonth(i);
    }
    if(!available) this.current.limit.right = true;
  },

  // Build time selection options
  _renderTime: function() {
    var container;

    this.current.newContents.append(container = $('<div class="time"/>'));

    if(this.current.settings.timePickerOnly) {
        this._renderTitle('Select a time');
    }
    else {
        this._renderTitle(this._format(this.current.working_date, 'j M, Y'));
    }

    container.append($('<input type="text" class="hour"' + (this.current.settings.militaryTime ? ' style="left:30px"' : '') +
          ' maxlength="2" value="' +
            this._leadZero(this.current.settings.militaryTime ?
              this.current.working_date.getHours() :
                (this.current.working_date.getHours() > 12 ? this.current.working_date.getHours() - 12 :
                  this.current.working_date.getHours())) + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
      event.preventDefault();
      event.stopPropagation();

      var i = $(event.target), v = parseInt(i.val(), 10);
      i.focus();

      if(this.current.settings.militaryTime) {
        if(dy > 0) {
          v = (v < 23) ? v + 1 : 0;
        }
        else if(dy < 0) {
          v = (v > 0) ? v - 1 : 23;
        }
      }
      else {
        var ampm = this.current.picker.find('.ampm');
        if(dy > 0) {
          if(v == 11) {
            v = 12;
            ampm.val(ampm.val() == 'AM' ? 'PM' : 'AM');
          }
          else if(v < 12) {
            v++;
          }
          else {
            v = 1;
          }
        }
        else if (dy < 0) {
          if(v == 12) {
            v = 11;
            ampm.val(ampm.val() == 'AM' ? 'PM' : 'AM');
          }
          else if(v > 1) {
            v--;
          }
          else {
            v = 12;
          }
        }
      }

      i.val(this._leadZero(v));
    }, this)));

    container.append($('<input type="text" class="minutes"' +
      (this.current.settings.militaryTime ? ' style="left:110px"' : '') + ' maxlength="2" value="' +
       this._leadZero(this.current.working_date.getMinutes()) + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
      event.preventDefault();
      event.stopPropagation();

      var i = $(event.target), v = parseInt(i.val(), 10);
      i.focus();
      if(dy > 0) {
        v = (v < 59) ? v + 1 : 0;
      }
      else if(dy < 0) {
        v = (v > 0) ? v - 1 : 59;
      }

      i.val(this._leadZero(v));
    }, this)));

    container.append($('<div class="separator"' + (this.current.settings.militaryTime ? ' style="left:91px"' : '') + '>:</div>'));

    if(!this.current.settings.militaryTime) {
      container.append($('<input type="text" class="ampm" maxlength="2" value="' +
        (this.current.working_date.getHours() >= 12 ? "PM" : "AM") + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
        event.preventDefault();
        event.stopPropagation();

        var i = $(event.target);
        i.focus();

        if(dy > 0 || dy < 0) {
          i.val(i.val() == "AM" ? "PM" : "AM");
        }
      })));
    }

    container.append($('<input type="submit" value="OK" class="ok"/>').click($.proxy(function(event) {
      event.stopPropagation();
      this._select($.extend(this._dateToObject(this.current.working_date),
        { hours: parseInt(this.current.picker.find('.hour').val(), 10) +
            (!this.current.settings.militaryTime && this.current.picker.find('.ampm').val() == "PM" ? 12 : 0),
          minutes: parseInt(this.current.picker.find('.minutes').val(), 10) }));
    }, this)));
  },

  // Render month options
  _renderMonth: function() {
    var month = this.current.working_date.getMonth(),
            container = $('<div class="days"/>'),
            titles = $('<div class="titles"/>'),
            available = false,
            t = this.current.today.toDateString(),
            currentChoice = this._dateFromObject(this.current.choice).toDateString(),
            d, i, classes, e, weekContainer;
    this._renderTitle(this.current.settings.months[month] + ' ' + this.current.working_date.getFullYear());

    this.current.working_date.setDate(1);
    while(this.current.working_date.getDay() != this.current.settings.startDay) {
      this.current.working_date.setDate(this.current.working_date.getDate() - 1);
    }

    this.current.newContents.append(container.append(titles));

    for(d = this.current.settings.startDay; d < (this.current.settings.startDay + 7); d++) {
      titles.append($('<div class="title day day' + (d % 7) + '">' +
              this.current.settings.days[(d % 7)].substring(0,this.current.settings.dayShort) + '</div>'));
    }

    for(i=0;i<42;i++) {
      classes = ['day', 'day' + this.current.working_date.getDay()];
      if(this.current.working_date.toDateString() == t) classes.push('today');
      if(this.current.working_date.toDateString() == currentChoice) classes.push('selected');
      if(this.current.working_date.getMonth() != month) classes.push('otherMonth');

      if(i%7 == 0) {
        container.append(weekContainer = $('<div class="week week' + Math.floor(i/7) + '"/>'));
      }

      weekContainer.append(e = $('<div class="' + classes.join(' ') + '">' + this.current.working_date.getDate() + '</div>'));
      if(this._limited('date')) {
        e.addClass('unavailable');
        if(available) {
          this.current.limit.right = true;
        }
        else if(this.current.working_date.getMonth() == month) {
          this.current.limit.left = true;
        }
      }
      else {
        available = true;
        e.click({day: this.current.working_date.getDate(), month: this.current.working_date.getMonth(),
            year: this.current.working_date.getFullYear()},
          $.proxy(function(event) {
            if(this.current.settings.timePicker) {
              this.current.working_date.setDate(event.data.day);
              this.current.working_date.setMonth(event.data.month);
              this.current.mode = 'time';
              this._render('fade');
            }
            else {
              this._select(event.data);
            }
        }, this));
      }
      this.current.working_date.setDate(this.current.working_date.getDate() + 1);
    }

    if(!available) this.current.limit.right = true;
  },

  // Render the title for the datepicker
  _renderTitle: function(text){
    if(this._allowZoomOut()){
      this.current.picker.find('.title').removeClass('disabled');
    }else{
      this.current.picker.find('.title').addClass('disabled');
    }
    this.current.picker.find('.titleText').text(text);
  },

  // Determine if the datepicker is limited by a minimum or maximum date
  _limited: function(type) {
    var bmin = !!this.current.minDate,
        bmax = !!this.current.maxDate,
        wd, mind, maxd;

    switch(type) {
      case 'year':
        return (bmin && this.current.working_date.getFullYear() < this.current.minDate.getFullYear()) ||
               (bmax && this.current.working_date.getFullYear() > this.current.maxDate.getFullYear());

      case 'month':
        var ms = parseInt('' + this.current.working_date.getFullYear() +
                               this._leadZero(this.current.working_date.getMonth()), 10);
        return bmin && ms < parseInt('' + this.current.minDate.getFullYear() +
                this._leadZero(this.current.minDate.getMonth()), 10) || bmax && ms >
                parseInt('' + this.current.maxDate.getFullYear() + this._leadZero(this.current.maxDate.getMonth()), 10);

      case 'date':
        // time portion of dates must be set to zero for valid comparison
        if (this.current.working_date) {
          wd = new Date(this.current.working_date);
          this._clearTime(wd);
        }
        if (this.current.minDate) {
          mind = new Date(this.current.minDate);
          this._clearTime(mind);
        }
        if (this.current.maxDate) {
          maxd = new Date(this.current.maxDate);
          this._clearTime(maxd);
        }
        return (bmin && wd < mind) || (bmax && wd > maxd);
    }
  },

  // Set the time portion of a date to zero.
  _clearTime: function(d) {
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
  },

  // Use effects for transitions
  _fx: function(effects) {
    if(effects == 'right') {
      this.current.oldContents.css('left',0).show();
      this.current.newContents.css('left',this.bodyWidth).show();
      this.current.slider.css('left',0).animate({'left':-this.bodyWidth});
    }
    else if(effects == 'left') {
      this.current.oldContents.css('left',this.bodyWidth).show();
      this.current.newContents.css('left',0).show();
      this.current.slider.css('left',-this.bodyWidth).animate({'left':0});
    }
    else if(effects == 'fade') {
      this.current.slider.css('left',0);
      this.current.oldContents.css('left',0).fadeOut(this.current.settings.animationDuration>>1);
      this.current.newContents.css('left',0).hide().fadeIn(this.current.settings.animationDuration);
    }
  },

  // Process selection
  _select: function(values) {
    var $value_element = $(this.current.value_element),
        $display_element = $(this.current.display_element);
    this.current.working_date = this._dateFromObject($.extend(this.current.choice, values));
    $value_element.val(this._format(this.current.working_date, this.current.settings.inputOutputFormat)).change();
    $display_element.val(this._format(this.current.working_date, this.current.settings.format));
    this._close(null, true);
    if($.isFunction(this.current.settings.onSelect)) this.current.settings.onSelect(this, this.current.working_date);
  },


  /* Public Access Methods
   *
   * The methods below may be accessed by specifying the method name as a string to will_pickdate
   * followed by any options.  e.g. $("#element").will_pickdate('setDateRange', {'minDate': Date});
   *----------------------------------------------------------------------------------------------- */


  // Return current element's settings
  settings: function(current) {
    this.current = current;
    return this.current.settings;
  },

  /* Set the minimum and maximum date range
     @param current (Object) The current object's settings.  This is handled by the jquery selector automatically.
     @param range (Object) An object specifying the minimum and/or maximum date range. The object should contain
     valid dates and the format is:
       {minDate: Date, maxDate: Date} */
  setDateRange: function(current, range) {
    var minDate = range.minDate,
        maxDate = range.maxDate;

    if (minDate == undefined && maxDate == undefined) {
      console.error("will_pickdate: A minimum or maximum date must be specified.");
    }

    if (minDate != undefined) current.minDate = minDate;
    if (maxDate != undefined) current.maxDate = maxDate;

    // persist state for picker
    $.data(current.display_element, PROP_NAME, current);
  }



});

// The list of commands that return values and don't permit chaining
var getters = ['settings'];

/* Attach the max length functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.will_pickdate = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1),
	    input = this, display, current;

  // try to grab current settings from data to pass to public methods if needed
  if (input.length > 0) {
    $display = $("#" + input.attr('id') + "_display");
    if ($display.length > 0) {
      current = $.data($display[0], PROP_NAME);
    }
  } else {
    console.warn("will_pickdate: Unknown datepicker.");
  }

	if ($.inArray(options, getters) > -1) {
	  if (current) {
		  return $.will_pickdate[options].apply($.will_pickdate, [current].concat(otherArgs));
	  } else {
	    console.warn("will_pickdate: Unknown datepicker.");
	  }
	}
	return this.each(function(index) {
		if (typeof options == 'string') {
			if (!$.will_pickdate[options]) {
				console.error("will_pickdate: Unknown command: " + options);
			}
			if (current) {
			  $.will_pickdate[options].apply($.will_pickdate, [current].concat(otherArgs));
		  } else {
		    console.warn("will_pickdate: Unknown datepicker.");
		  }
		}
		else {
			$.will_pickdate._attach_will_pickdate(this, options || {}, index);
		}
	});
};

/* Initialise the max length functionality. */
$.will_pickdate = new will_pickdate(); // singleton instance

})(jQuery);
