const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {

    let myEvents = [
        { date: '2019-07-25' },
        { date: '2019-07-26' }
    ];

    let startDate = '2019-07-04';

    const clndr = new EventCalendar($('html'));
    clndr.init(startDate, null, myEvents);
});