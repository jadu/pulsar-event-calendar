/**
 * Pulsar Event Calendar
 */

'use strict';

import $ from 'jquery';
import moment from 'moment';
import 'moment-recur';
window._ = require('underscore');
import 'clndr';

class EventCalendar {

    /**
     * @constructor
     * @param {jQuery} $html jQuery wrapper of the html node
     * @param {jQuery} clndr The clndr instance that is in use
     */
    constructor ($html) {
        this.$html = $html;
        this.$patternField;
        this.$ariaLiveRegion;
        this.dateFormat = 'YYYY-MM-DD';
        this.dateFormatLong = 'D MMMM, YYYY';
        this.clndr;
    }

    /**
     * Initalises the event calendar providing the correct markup is present within the DOM (as per README.md).
     * 
     * @param {string} startDate Specifies the month and year which will be initially focused by the calendar, dates 
     * before this will not be interactive. Will default to the user's current date if not supplied or is null 
     * (format: YYYY-MM-DD)
     * @param {string} endDate Specififies the end of dates made available to the user. Defaults to 
     * startDate + 15 years if not supplied. (format: YYYY-MM-DD)
     * @param {array} events An array of simple dates that should be highlighted in the calendar as selected
     *
     * let exampleEvents = [
     *    { date: 'YYYY-MM-DD' },
     *    { date: 'YYYY-MM-DD' },
     *    { date: 'YYYY-MM-DD' }
     * ];
     */
    init (startDate, endDate, events) {
        if (typeof this.$html === 'undefined' || !this.$html.length) {
            throw new Error('$html must be passed to EventCalendar');
        }   

        let $container = this.$html.find('.js-event-calendar');

        if (!$container.length) {
            throw new Error('EventCalendar requires a .js-event-calendar element present in the DOM');
        }

        let _self = this,
            clndrSelected = startDate ? moment(startDate) : moment(new Date()),
            clndrStart = startDate ? moment(startDate) : moment(new Date()),
            clndrEnd = endDate ? moment(endDate) : moment(new Date()).add(15, 'years'),
            clndrEvents = events ? events : [],
            $weekdayPicker = _self.$html.find('.js-ercal-weekdays'),
            clndrTemplate = `
                <div class='clndr-controls' role='navigation'>
                    <div class='clndr-control-button'>
                        <button class='clndr-previous-button' aria-controls='event-calendar' aria-label='Go to the previous month'>&lsaquo;</button>
                    </div>
                    <div class='month' id='aria-clndr-title' aria-live='polite'><%= month %> <%= year %></div>
                    <div class='clndr-control-button rightalign'>
                        <button class='clndr-next-button' aria-controls='event-calendar' aria-label='Go to the next month'>&rsaquo;</button>
                    </div>
                </div>
                <span class="js-ercal-status hide" role="alert" aria-live="polite"></span>
                <table id='event-calendar' class='clndr-table' border='0' cellspacing='0' cellpadding='0'>
                    <thead>
                        <tr class='header-days'>
                        <% for (var i = 0; i < daysOfTheWeek.length; i++) { %>
                            <td class='header-day'><%= daysOfTheWeek[i] %></td>
                        <% } %>
                        </tr>
                    </thead>
                    <tbody aria-live="polite">
                    <% for (var i = 0; i < numberOfRows; i++) { %>
                        <tr>
                        <% for (var j = 0; j < 7; j++){ %>
                        <% var d = j + i * 7; %>
                            <% var daysLeadingZero = days[d].day < 10 ? '0' + days[d].day : days[d].day; %>
                            <td class='<%= days[d].classes %>'>
                            <% if (days[d].day.length != 0) { %>
                                <button 
                                    class='day-contents' 
                                    data-day="<%= year %>-<%= monthNumerical %>-<%= daysLeadingZero %>" 
                                    aria-label="<% if (days[d].classes.indexOf('selected') >= 0) { %><%= ariaStartDate %><% } else if (days[d].classes.indexOf('event') >= 0) { %><%= ariaSelected %><% } %> <%= days[d].day %> <%= month %>, <%= year %>.<% if (days[d].classes.indexOf('selected') <= 0 && days[d].classes.indexOf('event') <= 0) { %> <%= ariaUnselected %><% } %>"
                                    <% 
                                        if (days[d].classes.indexOf('inactive') >= 0 && 
                                        days[d].classes.indexOf('selected') <= 0) { 
                                    %> disabled<% } %>
                                >
                                    <%= days[d].day %>
                                </button>
                            <% } %>
                            </td>
                        <% } %>
                        </tr>
                    <% } %>
                    </tbody>
                </table>
                <div class="event-calendar-review">
                    <ul class="event-calendar-summary">
                        <li><i class="fa fa-repeat icon--success"></i> Repeat pattern</li>
                        <li><i class="fa fa-plus-circle icon--success"></i> Additional repeat
                            <span class="js-dates-to-add label label--success" style="display: none;"></span></li>
                        <li><i class="fa fa-ban icon--danger"></i> Event will <u>not</u> repeat
                            <span class="js-dates-to-del label label--danger" style="display: none;"></span></li>
                    </ul>
                    <button class="js-ercal-reset">Reset Calendar</button>
                </div>`;

        let precompiledTemplate = _.template(clndrTemplate);

        _self.clndr = $container.clndr({
            clickEvents: {
                click: function(target) {
                    _self.toggleDay(target);
                },
                onMonthChange: function (month) {
                    _self.paintMonth(month);
                },
            },
            constraints: {
                startDate: clndrStart,
                endDate: clndrEnd
            },
            events: clndrEvents,
            extras: {
                datesToAdd: [],
                datesToDel: []
            },
            moment: moment,
            selectedDate: clndrSelected,
            showAdjacentMonths: false,
            render: function (data) {
                // monthNumerical is used to create the data-day attribute on day buttons
                data.monthNumerical = moment().month(data.month).format('MM');
                data.ariaStartDate = 'This is the event start date. Clicking this button will have no effect.';
                data.ariaSelected = 'Selected. Event will repeat on';
                data.ariaUnselected = 'Unselected.';
                return precompiledTemplate(data);
            },
            startWithMonth: clndrStart,
            weekOffset: 1
        });

        // Reset all selected dates
        $container.on('click', '.js-ercal-reset', function() {
            _self.resetCalendar();
        });

        // Store a reference to the pattern field as it’s also used in the resetCalendar() method
        _self.$patternField = _self.$html.find('.js-ercal-repeat');

        // Store a reference to the aria alert status element used to update screen readers when things change
        _self.$ariaLiveRegion = _self.$html.find('.js-ercal-status');

        // Recalculate upcoming occurences based on the pattern dropdown
        _self.$patternField.on('change', function() {
            let $elem = $(this),
                pattern = $elem.val();

            // Show the weekday picker if the pattern is `weekly`
            if (pattern === 'weekly') {
                _self.$html.find('[name="ercal-weekdays"][value="' + clndrStart.day() + '"]').prop('checked', true);
                $weekdayPicker.show();
            }
            else {
                _self.$html.find('[name="ercal-weekdays"]').prop('checked', false); 
                $weekdayPicker.hide();
            }

            // Unpaint the currently stored pattern
            _self.paintMonth(_self.clndr.month, 'clear');

            /*
                Set the new recurrence pattern

                Any dates in the datesToAdd / datesToDel collections will maintain their state
                and override the pattern
            */
            _self.setPattern(pattern);
            _self.paintMonth(_self.clndr.month, 'repeat-on');
        });

        // Watch for changes to the weekday picker (only visible when the pattern is `weekly`)
        _self.$html.find('[name="ercal-weekdays"]').on('change', function() {
            _self.toggleWeekday();
        });

        return _self.clndr;
    }

    /**
     * Takes the values from the weekday checkboxes (MTWTFSS), defines that as a recur pattern, then paints it.
     */
    toggleWeekday () {
        let _self = this,
            pattern = [];
            
        _self.$html.find('[name="ercal-weekdays"]:checked').map(function() {
            pattern.push($(this).val());
        });

        _self.setPattern('weekdays', pattern);
        _self.paintMonth(this.clndr.month, 'repeat-on');
    }

    /**
     * Fired when a day is clicked, and chooses which actions should be performed based on the classes present on the 
     * button's parent `<td>`.
     * 
     * @param {jquery} target The day being clicked
     * 
     * States:
     *      1. Netural      - The default state of the button
     *      2. To Repeat    - Defined by the recurrence pattern, to be added to the list of selected dates when saved
     *      3. To Add       - Defined by user selection, to be added to the list of selected dates when saved
     *      4. To Delete    - Defined by user selection, To be removed from the list of selected dates when saved, 
     *                          or to prevent a pattern taking effect on this date
     *      5. Selected     - The start date for the recurrence pattern
     */
    toggleDay (target) {
        let _self = this,
            $elem = $(target.element),
            date = target.date,
            datesToAdd = _self.clndr.options.extras.datesToAdd,
            datesToDel = _self.clndr.options.extras.datesToDel;

        // Don't allow interactions on dates in the past, or the event start date
        if ($elem.hasClass('inactive') || $elem.hasClass('selected')) {
            return false;
        }
    
        // If a date is not already selected
        if (!$elem.hasClass('event')) {
            // If the button had 'event-add', then a pattern applied over the top
            if ($elem.hasClass('event-add') && $elem.hasClass('event-repeat')) {
                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                _self.clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.matchDates.bind(this, date));

                // Set it to [4. To Delete] by adding it to the datesToDel collection
                datesToDel.push(date);
            }
            // If the button is currently [4. To Delete]
            else if ($elem.hasClass('event-add')) {
                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                _self.clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.matchDates.bind(this, date));

                // Announce the new status through a live region (instead of the previous status)
                _self.updateLiveRegion('Unselected. Event will not repeat on ' + date.format(_self.dateFormatLong));
            }
            else if ($elem.hasClass('event-repeat')) {
                if ($elem.hasClass('event-del')) {
                    // Remove it from the datesToDel collection
                    _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
                } 
                else {
                    // Set it to [4. To Delete] by adding it to the datesToDel collection
                    datesToDel.push(date);
                }
            }
            // If the button is currently [1. Neutral]
            else if ( 
                !$elem.hasClass('event-add') 
                && !$elem.hasClass('event-del') 
                && !$elem.hasClass('selected')
            ) {
                // Set it to [3. To Add]
                datesToAdd.push(date);
            }

            // If the button is currently [5. Selected]
            else {
                // Remove it from the datesToDel collection
                _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
            }
        }

        // If a date is selected
        else if ($elem.hasClass('event')) {
            if (!$elem.hasClass('event-del')) {
                // Set it to [4. To Delete] by adding it to the datesToDel collection
                datesToDel.push(date);
            }
            else if ($elem.hasClass('event-del')) {
                // Restore initial styling by removing it from the datesToDel collection
                _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
            }
        }

        _self.paintMonth(_self.clndr.month);
        _self.updateReview();
    }

    /**
     * Takes the value of the pattern dropdown and generates a recur pattern based on the selected start date.
     * The pattern is saved and used when painting each month.
     * 
     * @param {string} pattern The type of pattern to be applied
     * @param {array} weekdays A list of selected weekdays (numbered 0 through 6) to be used for the 'weekdays' pattern.
     */
    setPattern (pattern, weekdays) {
        let _self = this,
            newPattern;
   
        switch (pattern) {
            case 'daily':
                newPattern = _self.clndr.options.selectedDate.recur().every(1).days();
                break;
            case 'weekly':
                newPattern = _self.clndr.options.selectedDate.recur().every(1).weeks();
                break;
            case 'weekdays':
                newPattern = _self.clndr.options.selectedDate.recur().every(weekdays).daysOfWeek();
                break
            case 'two-weekly':
                newPattern = _self.clndr.options.selectedDate.recur().every(2).weeks();
                break;
            case 'monthly-day':
                newPattern = _self.clndr.options.selectedDate.recur().every(_self.clndr.options.selectedDate.day()).daysOfWeek().every(0).weeksOfMonthByDay();
                break;
            case 'monthly-date':
                newPattern = _self.clndr.options.selectedDate.recur().every(1).months();
                break;
            case 'annually':
                newPattern = _self.clndr.options.selectedDate.recur().every(1).year();
                break;
            default:
                newPattern = null;
                break;
        }

        _self.recurPattern = newPattern;
    }

    /**
     * Calculates the dates within the currently viewed month which should be painted by the recurrence pattern, and paints
     * or unpaints them according to the `method`. The pattern will be retrieved from the clndr instance.
     * 
     * @param {string} method `repeat-on` will paint the dates, `clear` will unpaint them
     */
    paintRepeatPattern (method) {    
        let _self = this,
            paintMethod = method ? method : 'repeat-on',
            recurDatesThisMonth = _self.recurPattern
                                    .startDate(_self.clndr.options.selectedDate)
                                    .endDate(_self.clndr.options.constraints.endDate)
                                    .all();

        $.each(recurDatesThisMonth, function() {
            switch (paintMethod) {
                case 'repeat-on':
                    _self.styleRepeatOn(this);
                    break;
                case 'clear':
                default:
                    _self.styleClear(this);
                    break;
            }
        });
    }

    /**
     * Triggered when navigating through or making any changes to the calendar. Takes the dates stored in the 
     * `datesToAdd` and `datesToDel` arrays as well as the currently stored recurrence pattern and paints the dates
     * appropriately. Also triggers the updating of the review panel when finished.
     * 
     * @param {moment} month A moment object representing the currently viewed month
     * @param {string} method `repeat-on` will paint the dates, `clear` will unpaint them
     */
    paintMonth (month, method) {
        let _self = this;

        // Unpaint the entire month, used to catch any dates resetting to neutral
        _self.styleClearAll();

        // Recurrence pattern to paint for the displayed month
        if (_self.recurPattern != null) {
            _self.paintRepeatPattern(method);
        }

        // Exceptions to paint as to-add
        if (_self.clndr.options.extras.datesToAdd.length) {
            const datesToAdd = _self.clndr.options.extras.datesToAdd
                                .filter(EventCalendar.isInYear.bind(this, month))
                                .filter(EventCalendar.isInMonth.bind(this, month));

            $.each(datesToAdd, function() {
                _self.styleToAdd(this);
            });
        }

        // Exceptions to paint as to-delete
        if (_self.clndr.options.extras.datesToDel.length) {
            const datesToDel = _self.clndr.options.extras.datesToDel
                                .filter(EventCalendar.isInYear.bind(this, month))
                                .filter(EventCalendar.isInMonth.bind(this, month));

            $.each(datesToDel, function() {
                _self.styleToDel(this);
            });
        }

        _self.updateReview();
    }

    /**
     * Style a date which should be added to the list of active dates
     * 
     * @param {moment} target The date to style
     */
    styleToAdd (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormat) + '"]'),
            ariaLabel = 'Selected. Event will repeat on ' + target.format(_self.dateFormatLong);

        $elem.attr('aria-label', ariaLabel)
             .parent()
             .addClass('event-add');

        // Announce the new status through a live region (instead of the previous status)
        _self.updateLiveRegion(ariaLabel);
    }

    /**
     * Make screen readers announce the `message` by updating a hidden aria-live region within the template
     * 
     * @param {string} message The text to be announced by the screen reader
     */
    updateLiveRegion (message) {
        let _self = this;

        _self.$ariaLiveRegion.text(message);
    }

    /**
     * Style a date which should be removed from the list of active dates
     * 
     * @param {moment} target The date to style
     */
    styleToDel (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormat) + '"]'),
            ariaLabel = 'Removed. Event will no longer repeat on ' + target.format(_self.dateFormatLong);

        $elem.attr('aria-label', ariaLabel)
             .parent()
             .removeClass('event-add')
             .addClass('event-del');

        // Announce the new status through a live region (instead of the previous status)
        _self.updateLiveRegion(ariaLabel);
    }

    /**
     * Style a date which will be affected by the recurrence pattern and added to the list of active dates
     * 
     * @param {moment} target The date to style
     */
    styleRepeatOn (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormat) + '"]');

        $elem.attr('aria-label', 'Event will repeat on ' + target.format(_self.dateFormatLong) + ' based on the chosen repeat pattern')
             .parent()
             .addClass('event-repeat');
    }

    /**
     * Remove styling from a date and reset it to the 'neutral' state
     * 
     * @param {moment} target The date to style
     */
    styleClear (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormat) + '"]');

        $elem.attr('aria-label', target.format(_self.dateFormatLong) + '.')
             .parent()
             .removeClass('event-add event-del event-repeat');

        // Announce the new status through a live region (instead of the previous status)
        _self.updateLiveRegion('Unselected. Event will not repeat on ' + target.format(_self.dateFormatLong));
    }

    /**
     * Restore all dates to their initial state (when the calendar was initialised)
     */
    styleClearAll (target) {
        let _self = this,
            $elems = _self.clndr.element.find('.day-contents');

            $elems.each(function() {
                let $elem = $(this),
                    $elemParent = $elem.parent(),
                    date = moment($elem.data('day')).format(_self.dateFormatLong),
                    ariaLabel = 'Unselected';

                // If event was passed in the `events` array, it will be reset back to `.selected` and needs labelling
                if ($elemParent.attr('class').indexOf('event') !== -1) {
                    ariaLabel = 'Selected. Event will repeat on this day';
                }

                $elem.attr('aria-label',  date + '. ' + ariaLabel);
                $elemParent.removeClass('event-add event-del event-repeat');
            });
        }

    /**
     * Check whether `date` is in the same month as `dateToCompareTo`
     * 
     * @param {moment} dateToCompareTo Haystack
     * @param {moment} date Needle
     */
    static isInMonth (dateToCompareTo, date) {
        return date.month() === dateToCompareTo.month();
    }
    
    /**
     * Check whether `date` is in the same year as `dateToCompareTo`
     * 
     * @param {moment} dateToCompareTo Haystack
     * @param {moment} date Needle
     */
    static isInYear (dateToCompareTo, date) {
        return date.year() === dateToCompareTo.year();
    }

    /**
     * Check whether two moment instances are the same date
     * 
     * @param {moment} a Haystack
     * @param {moment} b Needle
     */
    static matchDates (a, b) {
        return a.format(this.dateFormat) != b.format(this.dateFormat);
    }
    
    /**
     * Updates the review panel to detail the number of exceptions being applied outside of any recurrence pattern. Controls
     * the visibility of certain elements and updates text counters.
     * 
     * Triggered by the paintMonth() method.
     */
    updateReview () {
        let _self = this,
            numDatesToAdd = _self.clndr.options.extras.datesToAdd.length,
            numDatesToDel = _self.clndr.options.extras.datesToDel.length,
            datesToAddContainer = _self.clndr.element.find('.js-dates-to-add'),
            datesToDelContainer = _self.clndr.element.find('.js-dates-to-del'),
            resetButton = _self.clndr.element.find('.js-calendar-reset');

        // Dates being added (outside of any recurrence pattern)
        if (numDatesToAdd > 0) {
            datesToAddContainer.html(numDatesToAdd + ` ${_self.pluralise('day', numDatesToAdd)} will be added`).show();
        }
        else {
            datesToAddContainer.html('').hide();
        }

        // Dates being removed (outside of any recurrence pattern)
        if (numDatesToDel > 0) {
            datesToDelContainer.html(numDatesToDel + ` ${_self.pluralise('day', numDatesToDel)} will be removed`).show();
        }
        else {
            datesToDelContainer.html('').hide();
        }

        // Show the reset button if changes are to be made
        if (numDatesToAdd != 0 || numDatesToDel != 0) {
            resetButton.show();
        }
        else {
            resetButton.hide();
        }
    }

    /**
     * Pluralises a string given a quantity of 'things'.
     * 
     * @param {string} noun The word to pluralise
     * @param {integer} quantity The quantity to determine whether to pluralise
     */
    pluralise (noun, quantity) {
        return quantity > 1 ? noun + 's' : noun;
    }

    /**
     * Reverts all user changes to their initial state (when the calendar was initialised) and return the user to the 
     * initial view the calendar was loaded on (either `today` or the `startDate`).
     */
    resetCalendar () {
        let _self = this;

        // Empty the lists of changes to add/del
        _self.clndr.options.extras.datesToAdd = [];
        _self.clndr.options.extras.datesToDel = [];

        // Empty the stored recur pattern
        _self.setPattern(null);

        // Reset the recur pattern field
        _self.$patternField.val('no-repeat');

        // Remove the review changes information
        _self.updateReview();

        // Return to the initial view
        _self.clndr.setMonth(_self.clndr.options.startWithMonth.month());
    }

    /**
     * Retrieve the contents of the `datesToAdd` and `datesToDel` arrays.
     */
    getDates () {
        let _self = this;
        return _self.clndr.options.extras;
    }

    /**
     * Retrieve the currently stored recurrence pattern.
     */
    getRecurPattern () {
        let _self = this;
        return _self.recurPattern;
    }
}

module.exports = EventCalendar;
