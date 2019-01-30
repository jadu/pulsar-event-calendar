const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const calendar = new EventCalendar($('html'));

    let myEvents = [
        { date: '2019-01-26' },
        { date: '2019-01-28' }
    ];

    let toAdd = [
        '2019-02-05',
        '2019-02-06',
        '2019-02-07'
    ];

    let toDel = [
        '2019-02-08',
        '2019-02-09'
    ];

    /**
     * Simple init() method which will default to startDate = today / endDate = today + 15 years
     */
    calendar.init({
        startDateField: '.js-ercal-start',
        endDateField: '.js-ercal-end',
        // startDate: '2019-02-06',
        // endDate: '2019-02-07'
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