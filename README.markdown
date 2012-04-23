will_pickdate
=============

Easy to use and well designed date picker widget with year in decades, month in year, day of month, and time of day support.
[Check it out Here](http://zenapsis.github.com/will_pickdate/ "will_pickdate on Github")

Most date pickers only support day of month. If you want to pick a time, you would require another time picker widget. This is both bad UX and bad UI.
With will_pickdate, you can do all that and more within a single well designed widget.
Clicking on the title will take you to the previous view, while selecting a year, month, or day will take you to the next view.

Usage
-----
Default:

    $(name_of_element).will_pickdate({});

With Time Selection (requires jquery.mousewheel):

    $(name_of_element).will_pickdate({
        timePicker:true
    });

Options
-------

    pickerClass: 'wpd'
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December']
    dayShort: 2
    monthShort: 3
    startDay: 0 // Sunday (0) through Saturday (6) - be aware that this may affect your layout, since the days on the right might have a different margin
    timePicker: false
    timePickerOnly: false
    yearPicker: true
    militaryTime: false
    yearsPerPage: 20
    format: 'd-m-Y'
    allowEmpty: false
    inputOutputFormat: 'U' // default to unix timestamp
    animationDuration: 400
    useFadeInOut: !$.browser.msie // dont animate fade-in/fade-out for IE
    startView: 'month' // allowed values: {time, month, year, decades}
    positionOffset: { x: 0, y: 0 }
    minDate: null // { date: '[date-string]', format: '[date-string-interpretation-format]' }
    maxDate: null // same as minDate
    debug: false
    toggleElements: null

Minimum and Maximum Date Interpretation
---------------------------------------

Date format for minimum and maxium date range does not match that required by the other format specifiers, and options
are restricted to the following syntax:

    'yyyy' // year with four digits
    'm'    // month without leading zero (0-11)
    'mm'   // month with leading zero (00-11)
    'd'    // day without leading zero (1-31)
    'dd'   // day with leading zero (01-31)
    'H'    // hours without leading zero (24-hour clock)
    'HH'   // hours with leading zero (24-hour clock)
    'M'    // minutes without leading zero
    'MM'   // minutes with leading zero
    'S'    // seconds without leading zero
    'SS'   // seconds with leading zero
    'l'    // Milliseconds, 3 digits
    'L'    // Milliseconds, 2 digits
    'U'    // number of milliseconds since epoch

Each date portion must be separated by a non-word character.  Therefore, the following are valid examples:

    'yyyy-d-m'
    'dd-m-yyyy'
    'd-m-yyyy HH:MM:SS'

Callbacks
---------

    onShow: $.noop,   // triggered when will_pickdate pops up
    onClose: $.noop,  // triggered after will_pickdate is closed (destroyed)
    onSelect: $.noop  // triggered when a date is selected


Dependencies
------------
1. [jQuery](http://jquery.com/ "jQuery")
2. [jquery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel "jquery.mousewheel") if you would like to use the time picker


Authors
-------
* Tasveer Singh ([tazsingh](http://github.com/tazsingh "tazsingh"))
* Adam St. John ([astjohn](http://github.com/astjohn "astjohn"))
* Andrew Walker ([awalkerca](http://github.com/awalkerca "awalkerca"))

Inspired By
-----------
[MooTools DatePicker](https://github.com/monkeyphysics/mootools-datepicker "MooTools DatePicker")

Licence
-------
MIT
