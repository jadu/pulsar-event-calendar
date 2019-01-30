/**
 * Pulsar Event Calendar
 */

'use strict';

import $ from 'jquery';
import moment from 'moment';
import 'moment/locale/en-au';
import 'moment/locale/en-gb';
import 'moment-recur';
window._ = require('underscore');
import 'clndr';

class EventCalendar {

    /**
     * @constructor
     * @param {jQuery} $html jQuery wrapper of the html node
     */
    constructor ($html) {
        this.clndr;
        this.$html = $html;
        this.ariaStartDate = 'This is the event start date. Clicking this button will have no effect.'
        this.dateFormatInternal = 'YYYY-MM-DD';
        this.dateFormatLong = 'D MMMM, YYYY';
        this.dateFormatUS = 'MM/DD/YYYY';
        this.localeFormat = 'DD/MM/YYYY';
        this.today = moment(new Date(), this.localeFormat);
        this.datesToAdd = [];
        this.datesToDel = [];
        this.$ariaLiveRegion;
        this.$patternField;
        this.currentCalendarMonth;
        this.$startDateField;
        this.$endDateField;
        this.$endDateFieldContainer;
        this.$weekdayPicker;
        this.originalStartDate;
        this.originalEndDate;
        this.originalPattern = null;_
        this.originalDatesToAdd = [];
        this.originalDatesToDel = [];
        this.originalWeekdays = [];
    }

    /**
     * Initalises the event calendar providing the correct markup is present within the DOM (as per README.md).
     * 
     * Example usage: 
     *  eventCalendar.init({
     *      startDate: '2019-07-04',
     *      endDate:   '2020-07-04'
     * })
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
    init (options = {}) {
        let _self = this;

        if (typeof _self.$html === 'undefined' || !_self.$html.length) {
            throw new Error('$html must be passed to EventCalendar');
        }   

        let $container = _self.$html.find('.js-event-calendar');

        if (!$container.length) {
            throw new Error('EventCalendar requires a .js-event-calendar element present in the DOM');
        }

         // Set the locale
         _self.setLocale(options.locale);

        /**
         * It's possible to provide conflicting start dates via startDate init option and startDateField.val, 
         * they will be used in this priority order:
         * 
         *  1. startDateField.val (visible to the user in the UI so takes priority)
         *  2. startDate
         *  3. today
         */
        if (typeof options.startDateField !== 'undefined' && options.startDateField.length) {
            _self.$startDateField = _self.$html.find(options.startDateField);
            options.startDate = _self.$startDateField.val().length ? _self.internalDate(_self.$startDateField.val()) : _self.internalDate(options.startDate);
   
            // Set the startDateField value in case it has been passed as an init option
            _self.$startDateField.val(options.startDate);
        }

        /**
         * It's possible to provide conflicting end dates via endDate init option and endDateField.val, 
         * they will be used in this priority order:
         * 
         *  1. endDateField.val (visible to the user in the UI so takes priority)
         *  2. endDate
         *  3. startDate + 15 years
         */
        if (typeof options.endDateField !== 'undefined' && options.endDateField.length) {
            _self.$endDateField = _self.$html.find(options.endDateField);
            
            // If startDate is undefined, use 'today' for the following endDate calculation
            let startDate = (typeof options.startDate !== 'undefined') ? options.startDate : _self.today.format(_self.localeFormat);

            options.endDate = _self.$endDateField.val().length ? _self.internalDate(_self.$endDateField.val()) : moment(startDate, _self.localeFormat).add(15, 'years').format(_self.dateFormatInternal);

            // Store reference to the end date field container, as it will be shown/hidden when choosing patterns
            _self.$endDateFieldContainer = _self.$endDateField.closest('.form__group');
        }

        // Make sure the endDate isn't before the startDate or anything silly like that
        if (
            (typeof options.endDate !== 'undefined' && typeof options.startDate !== 'undefined') &&
            moment(options.endDate, _self.dateFormatInternal).isBefore(moment(options.startDate, _self.dateFormatInternal).format(_self.dateFormatInternal))
        ) {
            throw new Error('End date can not be before the start date');
        }

        // If endDate isn't supplied, set it to `today + 15 years`
        if (options.endDate !== 'Invalid date') {
            options.endDate = _self.internalDate(options.endDate);
        }
        else {
            options.endDate = moment(new Date(), _self.dateFormatInternal).add(15, 'years').format(_self.dateFormatInternal);
        }

        // Process any datesToAdd passed as init() options, converting them to moments and adding to the array
        if (typeof options.datesToAdd !== 'undefined' && options.datesToAdd.length) {
            $.each(options.datesToAdd, function() {
                let dateToAdd = moment(this, _self.dateFormatInternal);

                if (dateToAdd.isAfter(moment(options.startDate, _self.dateFormatInternal))) {
                    _self.datesToAdd.push(dateToAdd);
                }
            });

            _self.originalDatesToAdd = _self.datesToAdd;
        }

        // Process any datesToDel passed as init() options, converting them to moments and adding to the array
        if (typeof options.datesToDel !== 'undefined' && options.datesToDel.length) {
            $.each(options.datesToDel, function() {
                let dateToDel = moment(this, _self.dateFormatInternal);
       
                if (dateToDel.isBefore(moment(options.endDate, _self.dateFormatInternal))) {
                    _self.datesToDel.push(dateToDel);
                }
            });
            _self.originalDatesToDel = _self.datesToDel;
        }

        let clndrSelected = options.startDate ? _self.internalDate(options.startDate) : _self.today.format(_self.dateFormatInternal),
            clndrStart = options.startDate ? _self.internalDate(options.startDate) : _self.today.format(_self.dateFormatInternal),
            clndrEnd = options.endDate,
            clndrEvents = options.events ? options.events : [],
            clndrTemplate = options.template ? options.template : `
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
                                    type='button' 
                                    class='day-contents' 
                                    data-day="<%= year %>-<%= monthNumerical %>-<%= daysLeadingZero %>" 
                                    aria-label="<% if (days[d].classes.indexOf('selected') !== -1) { %><%= ariaStartDate %><% } else if (days[d].classes.indexOf('event') !== -1) { %><%= ariaSelected %><% } %> <%= days[d].day %> <%= month %>, <%= year %>.<% if (days[d].classes.indexOf('selected') === -1 && days[d].classes.indexOf('event') === -1) { %> <%= ariaUnselected %><% } %>"
                                    <% 
                                        if (days[d].classes.indexOf('inactive') !== -1 && 
                                        days[d].classes.indexOf('selected') === -1) { 
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
                        <li><i class="icon-repeat icon--success"></i> Repeat pattern</li>
                        <li><i class="icon-plus-circle icon--success"></i> Additional repeat
                            <span class="js-dates-to-add label label--success" style="display: none;"></span></li>
                        <li><i class="icon-ban icon--danger"></i> Event will <u>not</u> repeat
                            <span class="js-dates-to-del label label--danger" style="display: none;"></span></li>
                    </ul>
                    <button class="btn js-ercal-reset">Reset Calendar</button>
                </div>`;

        let precompiledTemplate = _.template(clndrTemplate);

        // Store original values for start and end dates, used when resetCalendar is triggered
        _self.originalStartDate = clndrStart;
        _self.originalEndDate = clndrEnd;

        // Construct the calendar
        _self.clndr = $container.clndr({
            clickEvents: {
                click: _self.toggleDay.bind(_self),
                onMonthChange: _self.paintMonth.bind(_self)
            },
            constraints: {
                startDate: clndrStart,
                endDate: clndrEnd
            },
            events: clndrEvents,
            extras: {
                datesToAdd: _self.datesToAdd,
                datesToDel: _self.datesToDel
            },
            moment: moment,
            selectedDate: moment(clndrSelected, _self.dateFormatInternal),
            showAdjacentMonths: false,
            render: function (data) {
                // monthNumerical is used to create the data-day attribute on day buttons
                data.monthNumerical = moment().month(data.month).format('MM');
                data.ariaStartDate = _self.ariaStartDate;
                data.ariaSelected = 'Selected. Event will repeat on';
                data.ariaUnselected = 'Unselected.';
                return precompiledTemplate(data);
            },
            startWithMonth: moment(clndrStart, _self.dateFormatInternal)
        });

        // Reset all selected dates
        $container.on('click', '.js-ercal-reset', function() {
            _self.resetCalendar();
        });

        // Store a reference to the aria alert status element used to update screen readers when things change
        _self.$ariaLiveRegion = _self.$html.find('.js-ercal-status');

        // Store a reference to the weekday picker, which is shown if the pattern is 'weekly'
        _self.$weekdayPicker = _self.$html.find('.js-ercal-weekdays');
        _self.localiseWeekday();

        // Store initial state of weekday checkboxes to be used in the resetCalendar() method
        _self.$html.find('[name="ercal-weekdays"]:checked').map(function() {
            _self.originalWeekdays.push($(this).val());
        });

        // Store a reference to the pattern field as it’s also used in the resetCalendar() method
        _self.$patternField = _self.$html.find('.js-ercal-repeat');
        _self.originalPattern = _self.$patternField.val();

        // If a startDate field is defined, bind a change event to fire When a new start date is chosen
        if (typeof _self.$startDateField !== 'undefined') {
            _self.setStartDateMaximum();
            _self.$startDateField.on('change', _self.changeStartDate.bind(_self));
        }

        // If an endDate field is defined, bind a change event to fire When a new end date is chosen
        if (typeof _self.$endDateField !== 'undefined') {
            _self.setEndDateMinimum();
            _self.$endDateField.on('change', _self.changeEndDate.bind(_self));
        }
        
        // If datesToAdd or datesToDel have been passed as an init() option, trigger a paint to style them
        if (_self.clndr.options.extras.datesToAdd.length || _self.clndr.options.extras.datesToDel.length) {
            _self.paintMonth(moment(clndrSelected, _self.dateFormatInternal));
        }

        // Recalculate upcoming occurences based on the pattern dropdown
        _self.$patternField.on('change', _self.applyPattern.bind(_self));

        // Watch for changes to the weekday picker (only visible when the pattern is `weekly`)
        _self.$html.find('[name="ercal-weekdays"]').on('change', function() {
            _self.toggleWeekday();
        });

        _self.applyPattern();
    }

    /**
     * Takes the value stored in the repeat pattern field and shows the weekday picker if required.
     */
    applyPattern () {
        let _self = this,
            pattern = _self.$patternField.val()

        // Toggle visibility of endDate field by showing/hiding it's container (based on Pulsar markup) 
        if (typeof _self.$endDateFieldContainer !== 'undefined') {
            if (pattern === '1day') {
                _self.$endDateFieldContainer.hide();
                _self.$endDateField.attr('disabled', true);
            }
            else {
                _self.$endDateFieldContainer.show();
                _self.$endDateField.attr('disabled', false);
            }
        }

        // Show the weekday picker if the pattern is `weekly`
        if (pattern === 'weekly') {
            // Choose the weekday based on the startDate
            _self.$html.find('[name="ercal-weekdays"][value="' + moment(_self.clndr.options.constraints.startDate, _self.dateFormatInternal).day() + '"]').prop('checked', true);
            _self.$weekdayPicker.show();
            _self.toggleWeekday();
        }
        else {
            _self.$html.find('[name="ercal-weekdays"]').prop('checked', false); 
            _self.$weekdayPicker.hide();
        }

        // If we're using the weekly pattern, this will have been painted appropriately before this point
        if (pattern !== 'weekly') {
            // Unpaint the currently stored pattern
            _self.paintMonth(_self.clndr.month, 'clear');

            /*
                Set the new recurrence pattern

                Any dates in the datesToAdd / datesToDel collections will maintain their state
                and override the pattern
            */
            _self.setPattern(pattern);
            _self.paintMonth(_self.clndr.month, 'repeat-on');
        }
    }

    /**
     * Change the order of the weekday picker to start with Sunday if using `en` or `en-us` locale
     */
    localiseWeekday () {
        let _self = this,
            locale = moment.locale();

        if (locale === 'en'  || locale === 'en-us') {
            let lastDay = _self.$weekdayPicker.find('label').last();

            if (lastDay.find('span').text() === 'SU') {
                _self.$weekdayPicker.find('label').first().before(lastDay);
            }
        }
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
            return;
        }
    
        // If a date is selected
        if ($elem.hasClass('event')) {
            if ($elem.hasClass('event-del')) {
                // Restore initial styling by removing it from the datesToDel collection
                _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.doesNotMatchDate.bind(this, date));
            } 
            else {
                // Set it to [4. To Delete] by adding it to the datesToDel collection
                datesToDel.push(date);
            }
        }

        // If a date is not already selected
        else {
            // If the button had 'event-add', then a pattern applied over the top
            if ($elem.hasClass('event-add') && $elem.hasClass('event-repeat')) {
                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                _self.clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.doesNotMatchDate.bind(this, date));

                // Set it to [4. To Delete] by adding it to the datesToDel collection
                datesToDel.push(date);
            }
            // If the button is currently [4. To Delete]
            else if ($elem.hasClass('event-add')) {
                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                _self.clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.doesNotMatchDate.bind(this, date));

                // Announce the new status through a live region (instead of the previous status)
                _self.updateLiveRegion('Unselected. Event will not repeat on ' + date.format(_self.dateFormatLong));
            }
            else if ($elem.hasClass('event-repeat')) {
                if ($elem.hasClass('event-del')) {
                    // Remove it from the datesToDel collection
                    _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.doesNotMatchDate.bind(this, date));
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
                _self.clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.doesNotMatchDate.bind(this, date));
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
            selectedDate = _self.clndr.options.selectedDate,
            newPattern;

        switch (pattern) {
            case 'day':
                newPattern = selectedDate.recur().every(1).days();
                break;
            case 'weekdays':
                newPattern = selectedDate.recur().every(weekdays).daysOfWeek();
                break
            case 'fortnight':
                newPattern = selectedDate.recur().every(2).weeks();
                break;
            case 'monthByDay':
                newPattern = selectedDate.recur()
                                .every(selectedDate.day()).daysOfWeek()
                                .every(selectedDate.monthWeekByDay()).weeksOfMonthByDay();
                break;
            case 'monthByDate':
                newPattern = selectedDate.recur().every(1).months();
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
            repeatEnd = (moment(_self.clndr.options.constraints.endDate, _self.dateFormatInternal).isBefore(_self.clndr.intervalEnd)) ? _self.clndr.options.constraints.endDate : _self.clndr.intervalEnd,
            recurDatesThisMonth = _self.recurPattern
                                    .startDate(_self.clndr.options.selectedDate)
                                    .endDate(repeatEnd)
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
        let _self = this,
            $today = _self.clndr.element.find('[data-day="' + _self.clndr.options.constraints.startDate + '"]');
        
        // Store currently viewed month, used when changing endDate to check if we need to refocus the calendar
        _self.currentCalendarMonth = month;

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

            datesToAdd.forEach(_self.styleToAdd.bind(_self));
        }

        // Exceptions to paint as to-delete
        if (_self.clndr.options.extras.datesToDel.length) {
            const datesToDel = _self.clndr.options.extras.datesToDel
                                .filter(EventCalendar.isInYear.bind(this, month))
                                .filter(EventCalendar.isInMonth.bind(this, month));

            datesToDel.forEach(_self.styleToDel.bind(_self));
        }

        // Reset aria-label for 'today'
        if ($today.length) {
            $today.attr('aria-label', _self.ariaStartDate);
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
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormatInternal) + '"]'),
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

        // Protect against misconfiguration
        if (!_self.$ariaLiveRegion.length) {
            return;
        }

        _self.$ariaLiveRegion.text(message);
    }

    /**
     * Style a date which should be removed from the list of active dates
     * 
     * @param {moment} target The date to style
     */
    styleToDel (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormatInternal) + '"]'),
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
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormatInternal) + '"]');

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
            $elem = _self.clndr.element.find('[data-day="' + target.format(_self.dateFormatInternal) + '"]');

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
                date = moment($elem.data('day'), _self.dateFormatInternal).format(_self.dateFormatLong),
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
     * Reverts all user changes to their initial state (when the calendar was initialised) and return the user to the 
     * initial view the calendar was loaded on (either `today` or the `startDate`).
     */
    resetCalendar () {
        let _self = this;

        _self.clndr.options.extras.datesToAdd.length = 0;

        if (_self.originalDatesToAdd.length) {
            _self.clndr.options.extras.datesToAdd = [..._self.originalDatesToAdd]
        }

        _self.clndr.options.extras.datesToDel.length = 0;

        if (_self.originalDatesToDel.length) {
            _self.clndr.options.extras.datesToDel = [..._self.originalDatesToDel]
        }

        // Set the `selectedDate` to match the new start date
        _self.clndr.options.selectedDate = moment(_self.originalStartDate, _self.dateFormatInternal);

        // Reset start date to original value
        _self.clndr.options.constraints.startDate = _self.originalStartDate;

        if (typeof _self.$startDateField !== 'undefined') {
            _self.$startDateField.val(moment(_self.originalStartDate, _self.dateFormatInternal).format(_self.localeFormat));
        }

        // Reset end date to original value
        _self.clndr.options.constraints.endDate = _self.originalEndDate;

        // Reset end date field to starting value, unless that's 'today + 15 years'
        if (typeof _self.$endDateField !== 'undefined') {
            if (_self.originalEndDate != moment(new Date(), _self.dateFormatInternal).add(15, 'years').format(_self.dateFormatInternal)) {
                _self.$endDateField.val(moment(_self.originalEndDate, _self.dateFormatInternal).format(_self.localeFormat));
            }
            else {
                _self.$endDateField.val('');
            }
        }

        // Reset weekday checkboxes
        _self.$html.find('[name="ercal-weekdays"]').prop('checked', false);

        // Repopulate weekday checkboxes if we're resetting to the weekly pattern
        if ((_self.originalPattern === 'weekly') && _self.originalWeekdays.length) {
            $.each(_self.originalWeekdays, function() {
                _self.$html.find('[name="ercal-weekdays"][value="' + this + '"]').prop('checked', true);
            });
        }

        // Reset the stored recur pattern
        _self.setPattern(_self.originalPattern);

        // Reset the recur pattern field
        _self.$patternField.val(_self.originalPattern);
        _self.applyPattern();

        // Remove the review changes information
        _self.updateReview();

        // Reset the min/max values on the start/end date fields
        _self.setStartDateMaximum();
        _self.setEndDateMinimum();

        // Return to the initial view
        _self.clndr.setMonth(_self.clndr.options.startWithMonth.month());
        _self.paintMonth(_self.clndr.month, 'repeat-on');
    }

    /**
     * Fired when the startDateField changes and re-renders the calendar to start at the new startDate, removes any
     * out-of-bounds dates from the datesToAdd / datesToDel arrays and repaints the month.
     * 
     * Clearing the startDateField will cause the calendar to be reset to the original start date.
     */
    changeStartDate () {
        let _self = this,
            datesToAdd = _self.clndr.options.extras.datesToAdd,
            datesToDel = _self.clndr.options.extras.datesToDel,
            newStartDate = _self.$startDateField.val().length ? _self.$startDateField.val() : _self.originalStartDate,
            newStartDateMoment = moment(newStartDate, _self.localeFormat);

        // Set the `selectedDate` to match the new start date
        _self.clndr.options.selectedDate = newStartDateMoment;

        // Make dates before the new start date inactive
        _self.clndr.options.constraints.startDate = moment(newStartDate, _self.localeFormat).format(_self.dateFormatInternal);
        
        // Navigate to the month/year for the new start date
        _self.clndr
            .setYear(newStartDateMoment.year())
            .setMonth(newStartDateMoment.month())
            .render();

        // Switch selected state styling from the old start date to the new one
        _self.$html.find('.selected').removeClass('selected');
        _self.$html.find('.calendar-day-' + _self.internalDate(newStartDate)).addClass('selected');

        // Remove now out-of-bounds dates from the datesToAdd array
        const outOfBoundsDatesToAdd = _self.clndr.options.extras.datesToAdd
            .filter(EventCalendar.isInYear.bind(this, newStartDateMoment))
            .filter(EventCalendar.isInMonth.bind(this, newStartDateMoment))
            .filter(EventCalendar.isBeforeDate.bind(this, newStartDateMoment));

        $.each(outOfBoundsDatesToAdd, function(k, v) {
            datesToAdd = datesToAdd.filter(EventCalendar.doesNotMatchDate.bind(this, v));
        });

        // Update stored datesToAdd with outOfBounds date removed
        _self.clndr.options.extras.datesToAdd = datesToAdd;

        // Remove now out-of-bounds dates from the datesToDel array
        const outOfBoundsDatesToDel = _self.clndr.options.extras.datesToDel
            .filter(EventCalendar.isInYear.bind(this, newStartDateMoment))
            .filter(EventCalendar.isInMonth.bind(this, newStartDateMoment))
            .filter(EventCalendar.isBeforeDate.bind(this, newStartDateMoment));

        $.each(outOfBoundsDatesToDel, function(k, v) {
            datesToDel = datesToDel.filter(EventCalendar.doesNotMatchDate.bind(this, v));
        });

        // Update stored datesToDel with outOfBounds date removed
        _self.clndr.options.extras.datesToDel = datesToDel;

        // If pattern is weekly, make sure the weekDay picker checks the correct weekday for the new start date
        _self.applyPattern();

        // Reset the endDateField `min` value to reflect the startDate value
        _self.setEndDateMinimum();

        // Update the review information to reflect changes to out-of-bound dates
        _self.updateReview();

        _self.paintMonth(_self.clndr.month);
    }

    /**
     * Fired when the endDateField changes and re-renders the calendar to stop at the new endDate, removes any
     * out-of-bounds dates from the datesToAdd / datesToDel arrays and repaints the month.
     */
    changeEndDate () {
        let _self = this,
            datesToAdd = _self.clndr.options.extras.datesToAdd,
            datesToDel = _self.clndr.options.extras.datesToDel,
            newEndDate = _self.$endDateField.val().length ? _self.$endDateField.val() : moment(new Date(), _self.dateFormatInternal).add(15, 'years').format(_self.localeFormat),
            newEndDateMoment = newEndDate.length ? moment(newEndDate, _self.localeFormat) : moment(new Date(), _self.dateFormatInternal).add(15, 'years');

        // Update the endDate constraint before re-rendering
        _self.clndr.options.constraints.endDate = moment(newEndDate, _self.localeFormat).format(_self.dateFormatInternal);

        // Remove now out-of-bounds dates from the datesToAdd array
        const outOfBoundsDatesToAdd = _self.clndr.options.extras.datesToAdd
            .filter(EventCalendar.isInYear.bind(this, newEndDateMoment))
            .filter(EventCalendar.isInMonth.bind(this, newEndDateMoment))
            .filter(EventCalendar.isAfterDate.bind(this, newEndDateMoment));

        $.each(outOfBoundsDatesToAdd, function(k, v) {
            datesToAdd = datesToAdd.filter(EventCalendar.doesNotMatchDate.bind(this, v));
        });

        // Update stored datesToAdd with outOfBounds date removed
        _self.clndr.options.extras.datesToAdd = datesToAdd;

        // Remove now out-of-bounds dates from the datesToDel array
        const outOfBoundsDatesToDel = _self.clndr.options.extras.datesToDel
            .filter(EventCalendar.isInYear.bind(this, newEndDateMoment))
            .filter(EventCalendar.isInMonth.bind(this, newEndDateMoment))
            .filter(EventCalendar.isAfterDate.bind(this, newEndDateMoment));

        $.each(outOfBoundsDatesToDel, function(k, v) {
            datesToDel = datesToDel.filter(EventCalendar.doesNotMatchDate.bind(this, v));
        });

        // Update stored datesToDel with outOfBounds date removed
        _self.clndr.options.extras.datesToDel = datesToDel;

        // If chosen end date is before the currently focused month, then refocus the calendar
        if (newEndDateMoment.isBefore(_self.currentCalendarMonth)) {
            _self.clndr.setMonth(newEndDateMoment.month());
        }

        // Reset the startDateField `max` value to reflect the endDate value
        _self.setStartDateMaximum();

        // Update the review information to reflect changes to out-of-bound dates
        _self.updateReview();

        // Render the changes
        _self.clndr.render();
        _self.paintMonth(_self.clndr.month);
    }

    /**
     * Updates the `min` value for the `endDateField` so that dates before the startDate cannot be chosen
     */
    setEndDateMinimum () {
        let _self = this,
            startDate = _self.clndr.options.constraints.startDate;

        // Check for presence of `endDateField`
        if (typeof _self.$endDateField === 'undefined') {
            return;
        }

        _self.$endDateField.attr('min', startDate);
    }

    /**
     * Updates the `max` value for the `startDateField` so that dates after the endDate cannot be chosen
     */
    setStartDateMaximum () {
        let _self = this,
            endDate = _self.clndr.options.constraints.endDate;
        // Check for presence of `startDateField`
        if (typeof _self.$startDateField === 'undefined') {
            return;
        }

        _self.$startDateField.attr('max', endDate);
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

    /**
     * Sets the global moment locale, and the locale date format based on the option.locale setting.
     * Sets to en-gb if none supplied.
     * 
     * @param {string} locale The locale to set (en, en-gb, en-us, en-au)
     */
    setLocale (locale) {
        let _self = this;

        // Default to UK locale if none supplied, other accepted values are `en-us` or `en-au` due to these locale files
        // being `required` into the component.
        if (typeof locale === 'undefined' || locale === '') {
            locale = moment.locale();
        } else {
            // Set the locale.
            moment.locale(locale);
        }

        // If we're using US localisation, dates will be formatted as MM/DD/YYYY in the UI.
        if (locale === 'en'  || locale === 'en-us') {
            _self.localeFormat = _self.dateFormatUS;
        }
    }

    /**
     * Checks the current format of `date` and reformats it as _self.localeFormat (probably YYYY-MM-DD) for internal
     * use within the CLNDR.
     * 
     * @param {string} date The date to convert
     */
    internalDate (date) {
        let _self = this;

        if (date === 'Invalid date') {
            return;
        }

        // If already internal format, just return the same value
        if (moment(date, _self.dateFormatInternal, true).isValid()) {
            return date;
        }

        // Return `today` if no date is provided
        if (typeof date === 'undefined' || !date.length) {
            return moment(_self.today, _self.dateFormatInternal).format(_self.localeFormat);
        }
        
        // Otherwise, reformat the date
        return moment(date, _self.localeFormat).format(_self.dateFormatInternal);
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
     * Check whether the date of the month for `date` is before `dateToCompareTo`
     * 
     * @param {moment} dateToCompareTo Haystack
     * @param {moment} date Needle
     */
    static isBeforeDate (dateToCompareTo, date) {
        return date.date() < dateToCompareTo.date();
    }

    /**
     * Check whether the date of the month for `date` is after `dateToCompareTo`
     * 
     * @param {moment} dateToCompareTo Haystack
     * @param {moment} date Needle
     */
    static isAfterDate (dateToCompareTo, date) {
        return date.date() > dateToCompareTo.date();
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
     * Check whether two moment instances are not the same date
     * 
     * @param {moment} a Haystack
     * @param {moment} b Needle
     */
    static doesNotMatchDate (a, b) {
        return a.format(this.dateFormat) != b.format(this.dateFormat);
    }
}

module.exports = EventCalendar;
