const $ = require('jquery');
const EventCal = require('./src/EventCalendar');

$(function () {

    let myEvents = [
        {
            date: "2018-11-24"
        },
        {
            date: "2018-11-26"
        }
    ]

    const clndr = new EventCal($('html'));
    clndr.init(myEvents);
});