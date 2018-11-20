/**
 * Pulsar Event Calendar
 */

'use strict';

var moment = require('moment'),
    clndr = require('clndr');

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

        // let $tpl = `<div class="calendar">
        //     <div class="clndr-controls">
        //         <button class="clndr-previous-button">&lsaquo;</button>
        //         <div class="month"><%= month %></div>
        //         <button class="clndr-next-button">&rsaquo;</button>
        //     </div>
        //     <div class="clndr-grid">
        //         <div class="days-of-the-week">
        //         <% _.each(daysOfTheWeek, function (day) { %>
        //             <div class="header-day"><%= day %></div>
        //         <% }); %>
        //             <div class="days">
        //             <% _.each(days, function (day) { %>
        //                 <div class="<%= day.classes %>"><%= day.day %></div>
        //             <% }); %>
        //             </div>
        //         </div>
        //     </div>
        // </div>`;

        let $container = this.$html.find('.calendar'),
            existingEvents;

        var calendar = $container.clndr();

    }

}

module.exports = EventCalendar;

