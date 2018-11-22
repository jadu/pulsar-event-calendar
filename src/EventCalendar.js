/**
 * Pulsar Event Calendar
 */

'use strict';

require('jquery');
var moment = require('moment');
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
    init (events) {
        if (typeof this.$html === 'undefined' || !this.$html.length) {
            throw new Error('$html must be passed to EventCalendar');
        }

        let _self = this,
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
                                <button class='day-contents' data-day="<%= year %>-<%= monthNumerical %>-<%= daysLeadingZero %>" aria-label="<%= days[d].day %> <%= month %>, <%= year %>">
                                    <%= days[d].day %>
                                </button>
                            <% } %>
                            </td>
                        <% } %>
                        </tr>
                    <% } %>
                    </tbody>
                </table>`;

            let precompiledTemplate = _.template(clndrTemplate);

            $container.clndr({
                clickEvents: {
                    click: function(target) {
                        _self.toggleDay(this, target);
                    },
                    onMonthChange: function (month) {
                        _self.changeMonth(this, month);
                    },
                },
                constraints: {
                    startDate: moment(new Date()).subtract(1, 'day'),
                    endDate: moment(new Date()).add(15, 'years')
                },
                daysOfTheWeek: ['Mon', 'Tur', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                events: events,
                extras: {
                    datesToAdd: [],
                    datesToDel: []
                },
                showAdjacentMonths: false,
                render: function (data) {
                    data.monthNumerical = moment().month(data.month).format('MM');
                    return precompiledTemplate(data);
                }
            });

    }

    toggleDay (clndr, target) {
        var $elem = $(target.element),
            $control = $elem.find('.day-contents'),
            datesToAdd = clndr.options.extras.datesToAdd,
            datesToDel = clndr.options.extras.datesToDel;

        // Remove yellow focus outline on click
        $control.blur();

        // Don't allow interactions on dates in the past
        if ($elem.hasClass('inactive')) {
            return false;
        }
    
        // If a date is not already selected
        if (!$elem.hasClass('event')) {
            if (!$elem.hasClass('event-add')) {
                $elem.addClass('event-add');
                datesToAdd.push({ date: target });
            }
            else if ($elem.hasClass('event-add')) {
                $elem.removeClass('event-add');
                datesToAdd.splice(datesToAdd.indexOf(target), 1);
            }
        }

        // If a date is selected
        else if ($elem.hasClass('event')) {
            if (!$elem.hasClass('event-del')) {
                $elem.addClass('event-del');
                datesToDel.push({ date: target });
            }
            else if ($elem.hasClass('event-del')) {
                $elem.removeClass('event-del');
                datesToDel.splice(datesToDel.indexOf(target), 1);
            }
        }

        console.log(clndr.options.extras);
    }

    styleToAdd (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.date.date._i + '"]');
        
        $elem.parent().addClass('event-add');
    }

    styleToDel (clndr, target) {
        let $elem = clndr.element.find('[data-day="' + target.date.date._i + '"]');
        
        $elem.parent().addClass('event-del');
    }

    static isInMonth (dateToCompareTo, date) {
        return date.date.date.month() === dateToCompareTo.month();
    }
    
    static isInYear (dateToCompareTo, date) {
        return date.date.date.year() === dateToCompareTo.year();
    }

    changeMonth (clndr, month) {
        let _self = this;

        const datesToAdd = clndr.options.extras.datesToAdd
                            .filter(EventCalendar.isInYear.bind(this, month))
                            .filter(EventCalendar.isInMonth.bind(this, month));
        
        const datesToDel = clndr.options.extras.datesToDel
                            .filter(EventCalendar.isInYear.bind(this, month))
                            .filter(EventCalendar.isInMonth.bind(this, month));

        $.each(datesToAdd, function() {
            _self.styleToAdd(clndr, this);
        });

        $.each(datesToDel, function() {
            _self.styleToDel(clndr, this);
        });
    }

}

module.exports = EventCalendar;

