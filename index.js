const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {

    let myEvents = [
        { date: '2018-01-25' },
        { date: '2018-01-26' }
    ];

    let startDate   = '2018-01-02';
    let endDate     = '2018-02-20';

    const clndr = new EventCalendar($('html'));
    clndr.init(startDate, endDate, myEvents);

    /**
     * Basic getter examples
     */
    $('.js-get-example').on('click', function() {
        let exampleDates = clndr.getDates();
        console.log(exampleDates);
    });

    $('.js-get-pattern').on('click', function() {
        let examplePattern = clndr.getRecurPattern();
        console.log(examplePattern);
    });
});