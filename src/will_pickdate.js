//= require jquery.mousewheel

(function($) {
  $.fn.will_pickdate = function(opts) {
    return this.each(function(index) {
      if(!$.data(this, 'will_pickdate')) {
        new will_pickdate(this, index, opts);
      }
    });
  };

  function will_pickdate(element, index, options) {
    var init_clone_val;

    this.element = $(element);

    this.options = $.extend({
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
    }, options);

    if(this.options.toggleElements != null && this.options.toggleElements.jquery) {
      this.toggler = this.options.toggleElements.eq(index);

      document.keydown($.proxy(function(event) {
        if(event.which == 9) this.close(null, true);
      }, this));
    }

    this.formatMinMaxDates();
    $(document).mousedown($.proxy(this.close, this));

    if (this.options.timePickerOnly) {
      this.options.timePicker = true;
      this.options.startView = 'time';
    }

    if(init_clone_val = this.element.val()) {
      init_clone_val = this.format(new Date(this.unformat(init_clone_val, this.options.inputOutputFormat)),
              this.options.format);
    }
    else if(!this.options.allowEmpty) {
      init_clone_val = this.format(new Date(), this.options.format);
      this.element.val(this.format(new Date(), this.options.inputOutputFormat));
    }
    else {
      init_clone_val = '';
    }

    this.display = this.element.css('display');
    this.clone = this.element
            .css('display', this.options.debug ? this.display : 'none')
            .data('will_pickdate', true)
            .clone(true)
            .data('will_pickdate', true)
            .removeAttr('name')
            .attr('id', this.element.attr('id') + '_display')
            .css('display', this.display)
            .val(init_clone_val);

    this.element.before(this.clone);

    if(this.toggler) {
      this.toggler.css('cursor', 'pointer').click($.proxy(function(event) {
        this.onFocus(this.element, this.clone);
      }, this));

      this.clone.blur($.proxy(function() {
        this.element.val(this.clone.val());
      }, this));
    }
    else {
      this.clone.bind({
        'keydown': $.proxy(function(e) {
          if(this.options.allowEmpty && (e.which == 46 || e.which == 8)) { // delete or backspace
            this.element.val('');
            $(e.target).val('');
            this.close(null, true);
          }
          else if(e.which == 9 || e.which == 27) { // tab or esc
            this.close(null, true);
          }
          else {
            e.preventDefault();
          }
        }, this),
        'focus': $.proxy(function(e) {
          this.onFocus(this.element, this.clone);
        }, this)
      });
    }
  }

  will_pickdate.prototype = {
    onFocus: function(original, visual_input) {
      var init_visual_date;

      if(init_visual_date = original.val()) {
        init_visual_date = this.unformat(init_visual_date, this.options.inputOutputFormat).valueOf();
      }
      else {
        init_visual_date = new Date();
        if(this.options.maxDate && init_visual_date.valueOf() > this.options.maxDate.valueOf()) {
          init_visual_date = new Date(this.options.maxDate.valueOf());
        }
        if(this.options.minDate && init_visual_date.valueOf() < this.options.minDate.valueOf()) {
          init_visual_date = new Date(this.options.minDate.valueOf());
        }
      }

      this.input = original, this.visual = visual_input;
      this.show(init_visual_date);
    },

    dateToObject: function(d) {
      return {
        year: d.getFullYear(),
        month: d.getMonth(),
        day: d.getDate(),
        hours: d.getHours(),
        minutes: d.getMinutes(),
        seconds: d.getSeconds()
      }
    },

    dateFromObject: function(values) {
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

    // Calculate position for picker. Returns object for use with css.
    pickerPosition: function() {
      // base position is top left corner of visual input plus offset specified by user options
      var position = { left: this.visual.offset().left + this.options.positionOffset.x,
                       top: this.visual.offset().top + this.options.positionOffset.y },
          docHeight = $(window).height(),
          scrollTop = $(window).scrollTop(),
          pickerHeight = this.picker.outerHeight(),
          lowerDifference = Math.abs(docHeight - position.top + this.visual.outerHeight()),
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
        position.top += this.visual.outerHeight();
      } else {
        // display at offset above visual element
        position.top -= pickerHeight;
      }
      return position;
    },

    show: function(timestamp) {
      this.formatMinMaxDates();
      if(timestamp) {
        this.working_date = new Date(timestamp);
      }
      else {
        this.working_date = new Date();
      }
      this.today = new Date();
      this.choice = this.dateToObject(this.working_date);
      this.mode = (this.options.startView == 'time' && !this.options.timePicker) ? 'month' : this.options.startView;

      this.render();

      this.picker.css(this.pickerPosition());

      if($.isFunction(this.options.onShow))
        this.options.onShow();
    },

    render: function(use_fx) {
      if(!this.picker) {
        this.constructPicker();
      }
      else {
        var o = this.oldContents;
        this.oldContents = this.newContents;
        this.newContents = o;
        this.newContents.empty();
      }

      var startDate = new Date(this.working_date.getTime());
      this.limit = { right: false, left: false };

      switch(this.mode) {
        case 'decades': this.renderDecades(); break;
        case 'year': this.renderYear(); break;
        case 'time': this.renderTime(); this.limit = { right: true, left: true }; break;
        default: this.renderMonth();
      }

      this.picker.find('.previous').toggleClass('disabled',this.limit.left);
      this.picker.find('.next').toggleClass('disabled',this.limit.right);
      this.picker.find('.title').css('cursor', this.allowZoomOut() ? 'pointer' : 'default');

      this.working_date = startDate;

      if(this.options.useFadeInOut) {
        this.picker.fadeIn(this.options.animationDuration);
      }

      if(use_fx) this.fx(use_fx);
    },

    fx: function(effects) {
      if(effects == 'right') {
        this.oldContents.css('left',0).show();
        this.newContents.css('left',this.bodyWidth).show();
        this.slider.css('left',0).animate({'left':-this.bodyWidth});
      }
      else if(effects == 'left') {
        this.oldContents.css('left',this.bodyWidth).show();
        this.newContents.css('left',0).show();
        this.slider.css('left',-this.bodyWidth).animate({'left':0});
      }
      else if(effects == 'fade') {
        this.slider.css('left',0);
        this.oldContents.css('left',0).fadeOut(this.options.animationDuration>>1);
        this.newContents.css('left',0).hide().fadeIn(this.options.animationDuration);
      }
    },

    constructPicker: function() {
      $(document.body).append(this.picker = $('<div class="' + this.options.pickerClass + '" />'));
      if(this.options.useFadeInOut) {
        this.picker.hide();
      }

      var h, title_cont, b;

      this.picker.append(h = $('<div class="header"/>'));
      h.append(title_cont = $('<div class="title"/>').click($.proxy(this.zoomOut, this)));

      h.append($('<div class="previous">&larr;</div>').click($.proxy(this.previous, this)));
      h.append($('<div class="next">&rarr;</div>').click($.proxy(this.next, this)));
      h.append($('<div class="closeButton">x</div>').click($.proxy(this.close, this)));
      title_cont.append($('<span class="titleText"/>'));

      this.picker.append(b = $('<div class="body"/>'));
      this.bodyHeight = b.outerHeight();
      this.bodyWidth = b.outerWidth();
      b.append(this.slider = $('<div style="position:absolute;top:0;left:0;width:' + 2 * this.bodyWidth +
              'px;height:' + 2 * this.bodyHeight + 'px" />'));

      this.slider.append(this.oldContents = $('<div style="position:absolute;top:0;left:' + this.bodyWidth +
              'px;width:' + this.bodyWidth + 'px;height:' + this.bodyHeight +  'px" />'));

      this.slider.append(this.newContents = $('<div style="position:absolute;top:0;left:0;width:' +
              this.bodyWidth + 'px;height:' + this.bodyHeight + 'px" />'));
    },

    renderDecades: function() {
      while(this.working_date.getFullYear() % this.options.yearsPerPage > 0) {
        this.working_date.setFullYear(this.working_date.getFullYear() - 1);
      }

      this.renderTitle(this.working_date.getFullYear() + '-' +
              (this.working_date.getFullYear() + this.options.yearsPerPage - 1));

      var i, y, e, available = false, container;

      this.newContents.append(container = $('<div class="years"/>'));

      if(this.options.minDate && this.working_date.getFullYear() <= this.options.minDate.getFullYear()) {
        this.limit.left = true;
      }

      for(i = 0; i < this.options.yearsPerPage; i++) {
        y = this.working_date.getFullYear();
        container.append(e = $('<div class="year year' + i + (y == this.today.getFullYear() ? ' today' : '') +
                (y == this.choice.year ? ' selected' : '') + '">' + y + '</>'));

        if(this.limited('year')) {
          e.addClass('unavailable');
          if(available) {
            this.limit.right = true;
          }
          else {
            this.limit.left = true
          }
        }
        else {
          available = true;
          e.click({year: y}, $.proxy(function(event) {
            this.working_date.setFullYear(event.data.year);
            this.mode = 'year';
            this.render('fade');
          }, this));
        }
        this.working_date.setFullYear(this.working_date.getFullYear() + 1);
      }

      if(!available ||
          (this.options.maxDate && this.working_date.getFullYear() >= this.options.maxDate.getFullYear())) {
        this.limit.right = true;
      }
    },

    renderYear: function() {
      var month = this.today.getMonth(),
          this_year = this.working_date.getFullYear() == this.today.getFullYear(),
          selected_year = this.working_date.getFullYear() == this.choice.year,
          available = false,
          container,
          i,e;

      this.renderTitle(this.working_date.getFullYear());
      this.working_date.setMonth(0);

      this.newContents.append(container = $('<div class="months"/>'));

      for(i = 0; i<= 11; i++) {
        container.append(e = $('<div class="month month' + (i+1) + (i==month && this_year ? ' today' : '') +
                (i==this.choice.month && selected_year ? ' selected' : '') + '">' +
                (this.options.monthShort ? this.options.months[i].substring(0, this.options.monthShort) :
                        this.options.months[i]) + '</div>'));

        if(this.limited('month')) {
          e.addClass('unavailable');
          if(available) {
            this.limit.right = true;
          }
          else {
            this.limit.left = true;
          }
        }
        else {
          available = true;
          e.click({month:i}, $.proxy(function(event) {
            this.working_date.setDate(1);
            this.working_date.setMonth(event.data.month);
            this.mode = 'month';
            this.render('fade');
          }, this));
        }
        this.working_date.setMonth(i);
      }
      if(!available) this.limit.right = true;
    },

    renderTime: function() {
      var container;

      this.newContents.append(container = $('<div class="time"/>'));

      if(this.options.timePickerOnly) {
          this.renderTitle('Select a time');
      }
      else {
          this.renderTitle(this.format(this.working_date, 'j M, Y'));
      }

      container.append($('<input type="text" class="hour"' + (this.options.militaryTime ? ' style="left:30px"' : '') +
            ' maxlength="2" value="' +
              this.leadZero(this.options.militaryTime ?
                this.working_date.getHours() :
                  (this.working_date.getHours() > 12 ? this.working_date.getHours() - 12 :
                    this.working_date.getHours())) + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
        event.preventDefault();
        event.stopPropagation();

        var i = $(event.target), v = parseInt(i.val(), 10);
        i.focus();

        if(this.options.militaryTime) {
          if(dy > 0) {
            v = (v < 23) ? v + 1 : 0;
          }
          else if(dy < 0) {
            v = (v > 0) ? v - 1 : 23;
          }
        }
        else {
          var ampm = this.picker.find('.ampm');
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

        i.val(this.leadZero(v));
      }, this)));

      container.append($('<input type="text" class="minutes"' + (this.options.militaryTime ? ' style="left:110px"' : '') + ' maxlength="2" value="' +
              this.leadZero(this.working_date.getMinutes()) + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
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

        i.val(this.leadZero(v));
      }, this)));

      container.append($('<div class="separator"' + (this.options.militaryTime ? ' style="left:91px"' : '') + '>:</div>'));

      if(!this.options.militaryTime) {
        container.append($('<input type="text" class="ampm" maxlength="2" value="' +
          (this.working_date.getHours() >= 12 ? "PM" : "AM") + '"/>').mousewheel($.proxy(function(event, d, dx, dy) {
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
        
        var parsedHours = parseInt(this.picker.find('.hour').val(), 10);
        if(!this.options.militaryTime){
      	    parsedHours = parsedHours === 12 ? 0 : parsedHours;
      	}
        
        this.select($.extend(this.dateToObject(this.working_date),
          {
      	    hours: parsedHours + (!this.options.militaryTime && this.picker.find('.ampm').val() == "PM" ? 12 : 0),
      	    minutes: parseInt(this.picker.find('.minutes').val(), 10)
      	  }));
      }, this)));
    },

    renderMonth: function() {
      var month = this.working_date.getMonth(),
              container = $('<div class="days"/>'),
              titles = $('<div class="titles"/>'),
              available = false,
              t = this.today.toDateString(),
              currentChoice = this.dateFromObject(this.choice).toDateString(),
              d, i, classes, e, weekContainer;
      this.renderTitle(this.options.months[month] + ' ' + this.working_date.getFullYear());

      this.working_date.setDate(1);
      while(this.working_date.getDay() != this.options.startDay) {
        this.working_date.setDate(this.working_date.getDate() - 1);
      }

      this.newContents.append(container.append(titles));

      for(d = this.options.startDay; d < (this.options.startDay + 7); d++) {
        titles.append($('<div class="title day day' + (d % 7) + '">' +
                this.options.days[(d % 7)].substring(0,this.options.dayShort) + '</div>'));
      }

      for(i=0;i<42;i++) {
        classes = ['day', 'day' + this.working_date.getDay()];
        if(this.working_date.toDateString() == t) classes.push('today');
        if(this.working_date.toDateString() == currentChoice) classes.push('selected');
        if(this.working_date.getMonth() != month) classes.push('otherMonth');

        if(i%7 == 0) {
          container.append(weekContainer = $('<div class="week week' + Math.floor(i/7) + '"/>'));
        }

        weekContainer.append(e = $('<div class="' + classes.join(' ') + '">' + this.working_date.getDate() + '</div>'));
        if(this.limited('date')) {
          e.addClass('unavailable');
          if(available) {
            this.limit.right = true;
          }
          else if(this.working_date.getMonth() == month) {
            this.limit.left = true;
          }
        }
        else {
          available = true;
          e.click({day: this.working_date.getDate(), month: this.working_date.getMonth(),
              year: this.working_date.getFullYear()},
            $.proxy(function(event) {
              if(this.options.timePicker) {
                this.working_date.setDate(event.data.day);
                this.working_date.setMonth(event.data.month);
                this.mode = 'time';
                this.render('fade');
              }
              else {
                this.select(event.data);
              }
          }, this));
        }
        this.working_date.setDate(this.working_date.getDate() + 1);
      }

      if(!available) this.limit.right = true;
    },

    renderTitle: function(text){
        if(this.allowZoomOut()){
            this.picker.find('.title').removeClass('disabled');
        }else{
            this.picker.find('.title').addClass('disabled');
        }
        this.picker.find('.titleText').text(text);
    },

    limited: function(type) {
      var cs = !!this.options.minDate,
        ce = !!this.options.maxDate;

      if(!(cs || ce)) return false;

      switch(type) {
        case 'year':
          return (cs && this.working_date.getFullYear() < this.options.minDate.getFullYear()) ||
                  (ce && this.working_date.getFullYear() > this.options.maxDate.getFullYear());

        case 'month':
          var ms = parseInt('' + this.working_date.getFullYear() + this.leadZero(this.working_date.getMonth()), 10);
          return cs && ms < parseInt('' + this.options.minDate.getFullYear() +
                  this.leadZero(this.options.minDate.getMonth()), 10) || ce && ms >
                  parseInt('' + this.options.maxDate.getFullYear() + this.leadZero(this.options.maxDate.getMonth()), 10);

        case 'date':
          return (cs && this.working_date < this.options.minDate) || (ce && this.working_date > this.options.maxDate);
      }
    },

    allowZoomOut: function() {
      if (this.mode == 'time' && this.options.timePickerOnly) return false;
      if (this.mode == 'decades') return false;
      return !(this.mode == 'year' && !this.options.yearPicker);
    },

    zoomOut: function() {
      if(!this.allowZoomOut()) return;
      switch(this.mode) {
        case 'year': this.mode = 'decades'; break;
        case 'time': this.mode = 'month'; break;
        default: this.mode = 'year';
      }
      this.render('fade');
    },

    previous: function() {
      switch(this.mode) {
        case 'decades':
          this.working_date.setFullYear(this.working_date.getFullYear() - this.options.yearsPerPage); break;
        case 'year':
          this.working_date.setFullYear(this.working_date.getFullYear() - 1); break;
        case 'month':
          this.working_date.setMonth(this.working_date.getMonth() - 1);
      }
      if(this.mode != 'time'){
        this.render('left');
      }

    },

    next: function() {
      switch(this.mode) {
        case 'decades':
          this.working_date.setFullYear(this.working_date.getFullYear() + this.options.yearsPerPage); break;
        case 'year':
          this.working_date.setFullYear(this.working_date.getFullYear() + 1); break;
        case 'month':
          this.working_date.setMonth(this.working_date.getMonth() + 1);
      }
      if (this.mode !='time'){
        this.render('right');
      }
    },

    close: function(e, force) {
      if(!this.picker || this.closing) return;

      if(force || (e && e.target != this.picker && this.picker.has(e.target).size() == 0 &&
              e.target != this.visual)) {

        this.element.blur();
        if(this.options.useFadeInOut) {
          this.closing = true;
          this.picker.fadeOut(this.options.animationDuration >> 1, $.proxy(this.destroy, this));
        }
        else {
          this.destroy();
        }
      }
    },

    destroy: function() {
      this.picker.remove();
      this.picker = null;
      this.closing = false;
      if($.isFunction(this.options.onClose)) this.options.onClose();
    },

    select: function(values) {
      this.working_date = this.dateFromObject($.extend(this.choice, values));
      this.input.val(this.format(this.working_date, this.options.inputOutputFormat)).change();
      this.visual.val(this.format(this.working_date, this.options.format));
      if($.isFunction(this.options.onSelect)) this.options.onSelect(this.working_date);
      this.close(null, true);
    },

    formatMinMaxDates: function() {
      if (this.options.minDate && this.options.minDate.format) {
        this.options.minDate = this.unformat(this.options.minDate.date, this.options.minDate.format);
      }
      if (this.options.maxDate && this.options.maxDate.format) {
        this.options.maxDate = this.unformat(this.options.maxDate.date, this.options.maxDate.format);
        this.options.maxDate.setHours(23);
        this.options.maxDate.setMinutes(59);
        this.options.maxDate.setSeconds(59);
      }
    },

    leadZero: function(v) {
      return v < 10 ? '0'+v : v;
    },

    format: function(t, format) {
      var f = '',
        h = t.getHours(),
        m = t.getMonth();

      for (var i = 0; i < format.length; i++) {
        switch(format.charAt(i)) {
          case '\\': i++; f+= format.charAt(i); break;
          case 'y': f += (100 + t.getYear() + '').substring(1); break;
          case 'Y': f += t.getFullYear(); break;
          case 'm': f += this.leadZero(m + 1); break;
          case 'n': f += (m + 1); break;
          case 'M': f += this.options.months[m].substring(0,this.options.monthShort); break;
          case 'F': f += this.options.months[m]; break;
          case 'd': f += this.leadZero(t.getDate()); break;
          case 'j': f += t.getDate(); break;
          case 'D': f += this.options.days[t.getDay()].substring(0,this.options.dayShort); break;
          case 'l': f += this.options.days[t.getDay()]; break;
          case 'G': f += h; break;
          case 'H': f += this.leadZero(h); break;
          case 'g': f += (h % 12 ? h % 12 : 12); break;
          case 'h': f += this.leadZero(h % 12 ? h % 12 : 12); break;
          case 'a': f += (h > 11 ? 'pm' : 'am'); break;
          case 'A': f += (h > 11 ? 'PM' : 'AM'); break;
          case 'i': f += this.leadZero(t.getMinutes()); break;
          case 's': f += this.leadZero(t.getSeconds()); break;
          case 'U': f += Math.floor(t.valueOf() / 1000); break;
          default:  f += format.charAt(i);
        }
      }
      return f;
    },

    unformat: function(t, format) {
      var d = new Date(),
        a = {},
        c,m,v;
      t = t.toString();

      for (var i = 0; i < format.length; i++) {
        c = format.charAt(i);
        switch(c) {
          case '\\': r = null; i++; break;
          case 'y': r = '[0-9]{2}'; break;
          case 'Y': r = '[0-9]{4}'; break;
          case 'm': r = '0[1-9]|1[012]'; break;
          case 'n': r = '[1-9]|1[012]'; break;
          case 'M': r = '[A-Za-z]{'+this.options.monthShort+'}'; break;
          case 'F': r = '[A-Za-z]+'; break;
          case 'd': r = '0[1-9]|[12][0-9]|3[01]'; break;
          case 'j': r = '[1-9]|[12][0-9]|3[01]'; break;
          case 'D': r = '[A-Za-z]{'+this.options.dayShort+'}'; break;
          case 'l': r = '[A-Za-z]+'; break;
          case 'G':
          case 'H':
          case 'g':
          case 'h': r = '[0-9]{1,2}'; break;
          case 'a': r = '(am|pm)'; break;
          case 'A': r = '(AM|PM)'; break;
          case 'i':
          case 's': r = '[012345][0-9]'; break;
          case 'U': r = '-?[0-9]+$'; break;
          default:  r = null;
        }

        if (r) {
          m = t.match('^'+r);
          if (m) {
            a[c] = m[0];
            t = t.substring(a[c].length);
          } else {
            if (this.options.debug) alert("Fatal Error in will_pickdate\n\nUnexpected format at: '"+t+"' expected format character '"+c+"' (pattern '"+r+"')");
            return d;
          }
        } else {
          t = t.substring(1);
        }
      }

      for (c in a) {
        v = a[c];
        switch(c) {
          case 'y': d.setFullYear(v < 30 ? 2000 + parseInt(v, 10) : 1900 + parseInt(v, 10)); break; // assume between 1930 - 2029
          case 'Y': d.setFullYear(v); break;
          case 'm':
          case 'n': d.setMonth(v - 1); break;
          // FALL THROUGH NOTICE! "M" has no break, because "v" now is the full month (eg. 'February'), which will work with the next format "F":
          case 'M': v = this.options.months.filter(function(index) { return this.substring(0,this.options.monthShort) == v })[0];
          case 'F': d.setMonth(options.months.indexOf(v)); break;
          case 'd':
          case 'j': d.setDate(v); break;
          case 'G':
          case 'H': d.setHours(v); break;
          case 'g':
          case 'h': if (a['a'] == 'pm' || a['A'] == 'PM') { d.setHours(v == 12 ? 0 : parseInt(v, 10) + 12); } else { d.setHours(v); } break;
          case 'i': d.setMinutes(v); break;
          case 's': d.setSeconds(v); break;
          case 'U': d = new Date(parseInt(v, 10) * 1000);
        }
      }

      return d;
    }
  };

})(jQuery);
