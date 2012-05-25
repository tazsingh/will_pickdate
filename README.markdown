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

    $(name_of_element).will_pickdate();

Dependencies
------------
1. [jQuery](http://jquery.com/ "jQuery")
2. [jquery.mousewheel](https://github.com/brandonaaron/jquery-mousewheel "jquery.mousewheel") if you would like to use the time picker


Running the Tests
-----------------

1. Make sure that Ruby 1.9 is installed.
2. Run `make guard` to run `bundle` and `guard`.
3. Run `make server` separately to run the server.
4. Point your browser to [http://localhost:8000/spec/index.html](http://localhost:8000/spec/index.html).

Authors
-------
* Tasveer Singh ([tazsingh](http://github.com/tazsingh "tazsingh")) 
* Adam St. John ([astjohn](http://github.com/astjohn "astjohn"))

Take a look at the [contributors](https://github.com/zenapsis/will_pickdate/contributors "contributors") page for a full list of contributors.

Inspired By
-----------
[MooTools DatePicker](https://github.com/monkeyphysics/mootools-datepicker "MooTools DatePicker")

Licence
-------
MIT
