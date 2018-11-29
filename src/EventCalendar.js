/**
 * Pulsar Event Calendar
 */

'use strict';

require('jquery');
var moment = require('moment');
require('moment-recur');
window._ = require('underscore');
require('clndr');

class EventCalendar {

    /**
     * EventCalendar
     * @constructor
     * @param {jQuery} $html - jQuery wrapper of the html node
     */
    constructor ($html) {
        this.$html = $html;
    }

    /**
     * Initialise
     */
    init (startDate, endDate, events) {
        if (typeof this.$html === 'undefined' || !this.$html.length) {
            throw new Error('$html must be passed to EventCalendar');
        }

        let _self = this,
            clndrStart = (startDate) ? moment(startDate) : moment(new Date()).subtract(1, 'day'),
            clndrEnd = (endDate) ? moment(endDate) : moment(new Date()).add(15, 'years'),
            clndrEvents = (events) ? events : [],
            $container = this.$html.find('.js-event-calendar'),
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

        let clndr = $container.clndr({
            clickEvents: {
                click: function(target) {
                    _self.toggleDay(this, target);
                },
                onMonthChange: function (month) {
                    _self.paintMonth(this, month);
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
            selectedDate: clndrStart,
            showAdjacentMonths: false,
            render: function (data) {

                // monthNumerical is used to create the data-day attribute on day buttons
                data.monthNumerical = moment().month(data.month).format('MM');

                return precompiledTemplate(data);
            },
            startWithMonth: clndrStart,
            weekOffset: 1
        });

        // Reset all selected dates
        $container.on('click', '.js-ercal-reset', function() {
            _self.resetCalendar(clndr);
        });

        // Recalculate upcoming occurences based on the pattern dropdown
        _self.$html.find('.js-ercal-repeat').on('change', function() {
            let pattern = $(this).val();

            // Unpaint the currently stored pattern
            _self.paintMonth(clndr, clndr.month, 'clear');

            /*
                Set the new repeat pattern

                Any dates in the datesToAdd / datesToDel collections will maintain their state
                and override the pattern
            */
            _self.setPattern(clndr, pattern);
            _self.paintMonth(clndr, clndr.month, 'repeat-on');
        });
    }

    /**
     * Toggle Day
     * 
     * @param {*} clndr The calendar object
     * @param {*} target The day being clicked
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
    toggleDay (clndr, target) {
        let $elem = $(target.element),
            date = target.date,
            $control = $elem.find('.day-contents'),
            datesToAdd = clndr.options.extras.datesToAdd,
            datesToDel = clndr.options.extras.datesToDel;
            
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
                console.log('2 - 4. To Clear');

                // Unset it from [3. To Add] by removing it from the datesToAdd collection
                clndr.options.extras.datesToAdd = datesToAdd.filter(EventCalendar.matchDates.bind(this, date));
            }
            else if ($elem.hasClass('event-repeat')) {
                
                if ($elem.hasClass('event-del')) {

                    // Remove it from the datesToDel collection
                    clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
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
                console.log('1 - 1. Is Neutral');
                
                // Set it to [3. To Add]
                datesToAdd.push(date);
            }

            // If the button is currently [5. Selected]
            else {
                if ($elem.hasClass('event-repeat')) {
                    console.log('3 - restore repeat');
                    // $elem.removeClass('event-del').addClass('event-add');
                }
                else {
                    console.log('4 - reset to neutral');

                    // Remove it from the datesToDel collection
                    clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
                }
            }
        }

        // If a date is selected
        else if ($elem.hasClass('event')) {
            if (!$elem.hasClass('event-del')) {
                console.log('4. To Delete');
                // $elem.addClass('event-del');

                // Set it to [4. To Delete] by adding it to the datesToDel collection
                datesToDel.push(date);
            }
            else if ($elem.hasClass('event-del')) {
                console.log('5');
                //$elem.removeClass('event-del');
                clndr.options.extras.datesToDel = datesToDel.filter(EventCalendar.matchDates.bind(this, date));
            }
        }

        this.paintMonth(clndr, clndr.month);
        this.updateReview(clndr);
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
    setPattern (clndr, pattern, method) {
        let _self = this,
            newPattern;
   
        switch (pattern) {
            case 'no-repeat':
                newPattern = null;
                break;
            case 'daily':
                newPattern = clndr.options.selectedDate.recur().every(1).days();
                break;
            case 'weekly':
                newPattern = clndr.options.selectedDate.recur().every(1).weeks();
                break;
            case 'two-weekly':
                newPattern = clndr.options.selectedDate.recur().every(2).weeks();
                break;
            case 'monthly-day':
                // TODO: this doesn't work?
                newPattern = clndr.options.selectedDate.recur().every(clndr.options.selectedDate.day()).daysOfMonth();
                break;
            case 'monthly-date':
                newPattern = clndr.options.selectedDate.recur().every(1).months();
                break;
            case 'annually':
                newPattern = clndr.options.selectedDate.recur().every(1).year();
                break;
            default:
                return false;
        }
        
        _self.recurPattern = newPattern;
    }

    paintRepeatPattern (clndr, method) {    
        let _self = this,
            recurDatesThisMonth = _self.recurPattern
                                    .startDate(clndr.options.selectedDate)
                                    .endDate(clndr.intervalEnd)
                                    .all();

        var method = (method) ? method : 'repeat-on';

        _self.paintDates(clndr, recurDatesThisMonth, method);
    }

    paintDates (clndr, dates, method) {
        let _self = this;
   
        $.each(dates, function() {
            switch (method) {
                case 'del':
                    _self.styleToDel(clndr, this);
                    break;
                case 'clear':
                    _self.styleClear(clndr, this);
                    break;
                case 'repeat-on':
                    _self.styleRepeatOn(clndr, this);
                    break;
                case 'add':
                default:
                    _self.styleToAdd(clndr, this);
                    break;
            }
        });
    }


    paintMonth (clndr, month, method) {
        // console.log('paint month');
        let _self = this;

        // Unpaint the entire month, used to catch any dates resetting to neutral
        _self.styleClearAll(clndr);

        // Repeat pattern to paint for the displayed month
        if (_self.recurPattern != null) {
            _self.paintRepeatPattern(clndr, method);
        }

        // Exceptions to paint as to-add
        if (clndr.options.extras.datesToAdd.length) {
            const datesToAdd = clndr.options.extras.datesToAdd
                                .filter(EventCalendar.isInYear.bind(this, month))
                                .filter(EventCalendar.isInMonth.bind(this, month));

            $.each(datesToAdd, function() {
                _self.styleToAdd(clndr, this);
            });
        }
        
        // Exceptions to paint as to-delete
        if (clndr.options.extras.datesToDel.length) {
            const datesToDel = clndr.options.extras.datesToDel
                                .filter(EventCalendar.isInYear.bind(this, month))
                                .filter(EventCalendar.isInMonth.bind(this, month));

            $.each(datesToDel, function() {
                _self.styleToDel(clndr, this);
            });
        }

        console.log(clndr.options.extras.datesToAdd);
        console.log(clndr.options.extras.datesToDel);
        
        _self.updateReview(clndr);
    }

    styleToAdd (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');

        $elem.parent().addClass('event-add');
    }

    styleToDel (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');
        
        $elem.parent().removeClass('event-add').addClass('event-del');
    }

    styleRepeatOn (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');

        $elem.parent().addClass('event-repeat');
    }

    styleClear (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.format('YYYY-MM-DD') + '"]');
        
        $elem.parent().removeClass('event-add event-del event-repeat');
    }

    styleClearAll (clndr) {
        let $elems = clndr.element.find('.day');
        
        $elems.removeClass('event-add event-del event-repeat');
    }

    styleReset (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.date.date._i + '"]');
        
        $elem.parent().addClass('event-del');
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
    
    updateReview (clndr) {
        const numDatesToAdd = clndr.options.extras.datesToAdd.length,
              numDatesToDel = clndr.options.extras.datesToDel.length,
              datesToAddContainer = clndr.element.find('.js-dates-to-add'),
              datesToDelContainer = clndr.element.find('.js-dates-to-del'),
              resetButton = clndr.element.find('.js-calendar-reset');

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

    resetCalendar (clndr) {

        // Empty the lists of changes to add/del
        clndr.options.extras.datesToAdd = [];
        clndr.options.extras.datesToDel = [];
        
        // Remove the review changes information
        this.updateReview(clndr);

        // Return to the initial view
        clndr.today();
    }

}

module.exports = EventCalendar;

