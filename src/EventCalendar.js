/**
 * Pulsar Event Calendar
 */

'use strict';

require('jquery');
import $ from 'jquery';
var moment = require('moment');
require('moment-recur');
window._ = require('underscore');
require('clndr');

class EventCalendar {

    /**
     * EventCalendar
     * @constructor
     * @param {jQuery} $html - jQuery wrapper of the html node
     * @param {jQuery} clndr - The clndr instance that is in use
     */
    constructor ($html) {
        this.$html = $html;
        this.clndr;
    }

    /**
     * 
     * @param {string} startDate - Specifies the month and year which will be initially focused by the calendar, dates 
     * before this will not be interactive. Will default to the user's current date if not supplied or is null 
     * (format: YYYY-MM-DD).
     * @param {string} endDate - Specififies the end of dates made available to the user. Defaults to 
     * startDate + 15 years if not supplied. (format: YYYY-MM-DD).
     * @param {array}  events - An array of simple dates that should be highlighted in the calendar as selected. 
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

        if (typeof $container === 'undefined' || !$container.length) {
            throw new Error('EventCalendar requires a .js-event-calendar element present in the DOM');
        }

        let _self = this,
            clndrSelected = (startDate) ? moment(startDate) : moment(new Date()),
            clndrStart = (startDate) ? moment(startDate) : moment(new Date()).subtract(1, 'days'),
            clndrEnd = (endDate) ? moment(endDate) : moment(new Date()).add(15, 'years'),
            clndrEvents = (events) ? events : [],
            $weekdayPicker = this.$html.find('.js-ercal-weekdays'),
            clndrTemplate = `
                <div class='clndr-controls'>
                    <div class='clndr-control-button'>
                        <button class='clndr-previous-button'>&lsaquo;</button>
                    </div>
                    <div class='month' id='aria-clndr-title'><%= month %> <%= year %></div>
                    <div class='clndr-control-button rightalign'>
                        <button class='clndr-next-button'>&rsaquo;</button>
                    </div>
                </div>
                <table class='clndr-table' border='0' cellspacing='0' cellpadding='0'>
                    <thead>
                        <tr class='header-days'>
                        <% for(var i = 0; i < daysOfTheWeek.length; i++) { %>
                            <td class='header-day'><%= daysOfTheWeek[i] %></td>
                        <% } %>
                        </tr>
                    </thead>
                    <tbody>
                    <% for(var i = 0; i < numberOfRows; i++){ %>
                        <tr>
                        <% for(var j = 0; j < 7; j++){ %>
                        <% var d = j + i * 7; %>
                            <% var daysLeadingZero = days[d].day < 10 ? '0' + days[d].day : days[d].day; %>
                            <td class='<%= days[d].classes %>'>
                            <% if(days[d].day.length != 0) { %>
                                <button 
                                    class='day-contents' 
                                    data-day="<%= year %>-<%= monthNumerical %>-<%= daysLeadingZero %>" 
                                    aria-label="<%= days[d].day %> <%= month %>, <%= year %>"
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
                    <button class="js-ercal-reset" style="display: inline;">Reset Calendar</button>
                </div>`;

        let precompiledTemplate = _.template(clndrTemplate);

        // TODO: Finish making the week start on a Monday
        moment.locale('en');

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

                return precompiledTemplate(data);
            },
            startWithMonth: clndrStart
        });

        // Reset all selected dates
        $container.on('click', '.js-ercal-reset', function() {
            _self.resetCalendar();
        });

        // Recalculate upcoming occurences based on the pattern dropdown
        _self.$html.find('.js-ercal-repeat').on('change', function() {
            let pattern = $(this).val();

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
                Set the new repeat pattern

                Any dates in the datesToAdd / datesToDel collections will maintain their state
                and override the pattern
            */
            _self.setPattern(pattern);
            _self.paintMonth(_self.clndr.month, 'repeat-on');
        });

        _self.$html.find('[name="ercal-weekdays"]').on('change', function() {
            _self.toggleWeekday();
        });

        return _self.clndr;
    }

    /**
     * Toggle Weekday
     * 
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
     * Toggle Day
     * 
     * @param {jquery} target The day being clicked
     * 
     * Fired when a day is clicked, and chooses which actions should be performed based on the classes present on the 
     * button's parent `<td>`
     * 
     * States:
     *      1. Netural      - The default state of the button
     *      2. To Repeat    - Defined by the repeat pattern, to be added to the list of selected dates when saved
     *      3. To Add       - Defined by user selection, to be added to the list of selected dates when saved
     *      4. To Delete    - Defined by user selection, To be removed from the list of selected dates when saved, 
     *                          or to prevent a pattern taking effect on this date
     *      5. Selected     - The start date for the repeat pattern
     */
    toggleDay (target) {
        let _self = this,
            $elem = $(target.element),
            date = target.date,
            $control = $elem.find('.day-contents'),
            datesToAdd = _self.clndr.options.extras.datesToAdd,
            datesToDel = _self.clndr.options.extras.datesToDel;
            
        // Remove yellow focus outline on click
        $control.blur();

        // Don't allow interactions on dates in the past, or the event start date
        if ($elem.hasClass('inactive') || $elem.hasClass('selected')) {
            return false;
        }
    
        // If a date is not already selected
        if (!$elem.hasClass('event')) {
            
            // If the button is currently [4. To Delete]
            if ($elem.hasClass('event-add')) {
                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                _self.clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.matchDates.bind(this, date));
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
     * Set Pattern
     * 
     * @param {*} clndr 
     * @param {*} pattern 
     * @param {*} method 
     * 
     * Takes the value of the pattern dropdown and generates a recur pattern based on the selected start date.
     * The pattern is saved and used when painting each month.
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

    paintRepeatPattern (method) {    
        let _self = this,
            recurDatesThisMonth = _self.recurPattern
                                    .startDate(_self.clndr.options.selectedDate)
                                    .endDate(_self.clndr.options.constraints.endDate)
                                    .all();

        //_self.clndr.options.constraints.endDate

        var method = (method) ? method : 'repeat-on';

        _self.paintDates(recurDatesThisMonth, method);
    }

    paintDates (dates, method) {
        let _self = this;
   
        $.each(dates, function() {
            switch (method) {
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


    paintMonth (month, method) {
        let _self = this;

        // Unpaint the entire month, used to catch any dates resetting to neutral
        _self.styleClearAll();

        // Repeat pattern to paint for the displayed month
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

    styleToAdd (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');

        $elem.parent().addClass('event-add');
    }

    styleToDel (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');
        
        $elem.parent().removeClass('event-add').addClass('event-del');
    }

    styleRepeatOn (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');

        $elem.parent().addClass('event-repeat');
    }

    styleClear (target) {
        let _self = this,
            $elem = _self.clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');
        
        $elem.parent().removeClass('event-add event-del event-repeat');
    }

    styleClearAll () {
        let _self = this,
            $elems = _self.clndr.element.find('.day');
        
        $elems.removeClass('event-add event-del event-repeat');
    }

    static isInMonth (dateToCompareTo, date) {
        return date.month() === dateToCompareTo.month();
    }
    
    static isInYear (dateToCompareTo, date) {
        return date.year() === dateToCompareTo.year();
    }

    static matchDates (a, b) {
        return a._i != b._i;
    }
    
    updateReview () {
        let _self = this,
            numDatesToAdd = _self.clndr.options.extras.datesToAdd.length,
            numDatesToDel = _self.clndr.options.extras.datesToDel.length,
            datesToAddContainer = _self.clndr.element.find('.js-dates-to-add'),
            datesToDelContainer = _self.clndr.element.find('.js-dates-to-del'),
            resetButton = _self.clndr.element.find('.js-calendar-reset');

        if (numDatesToAdd > 0) {
            datesToAddContainer.html((numDatesToAdd === 1) 
                ? numDatesToAdd + ' day will be added' : numDatesToAdd + ' days will be added').show();
        }
        else {
            datesToAddContainer.html('').hide();
        }

        if (numDatesToDel > 0) {
            datesToDelContainer.html((numDatesToDel === 1) 
                ? numDatesToDel + ' day will be removed' : numDatesToDel + ' days will be removed').show();
        }
        else {
            datesToDelContainer.html('').hide();
        }

        if (numDatesToAdd != 0 || numDatesToDel != 0) {
            resetButton.show();
        }
        else {
            resetButton.hide();
        }
    }

    resetCalendar () {
        let _self = this;

        // Empty the lists of changes to add/del
        _self.clndr.options.extras.datesToAdd = [];
        _self.clndr.options.extras.datesToDel = [];
        
        // Remove the review changes information
        _self.updateReview();

        // Return to the initial view
        _self.clndr.setMonth(_self.clndr.options.startWithMonth.month());
    }

    getDates () {
        let _self = this;
        return _self.clndr.options.extras;
    }

    getRecurPattern () {
        let _self = this;
        return _self.recurPattern;
    }

}

module.exports = EventCalendar;

