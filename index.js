const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const calendar = new EventCalendar($('html'));

    let myEvents = [
        { date: '2019-01-26' },
        { date: '2019-01-28' }
    ];

    let toAdd = [
        '2019-01-27',
        '2019-01-29'
    ];

    let toDel = [
        '2019-01-28',
        '2019-01-30'
    ];

    /**
     * Simple init() method which will default to startDate = today / endDate = today + 15 years
     */
    calendar.init({
        startDateField: '.js-ercal-start',
        endDateField: '.js-ercal-end',
        datesToAdd: toAdd,
        datesToDel: toDel
        // events: myEvents,
    });

    /**
     * Basic getter examples, used to log data to the console in demo/demo.html
     */
    $('.js-get-example').on('click', function() {
        let exampleDates = calendar.getDates();
        console.log(exampleDates);
    });

    $('.js-get-pattern').on('click', function() {
        let examplePattern = calendar.getRecurPattern();
        console.log(examplePattern);
    });
});