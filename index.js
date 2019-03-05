const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const calendar = new EventCalendar($('html'));

    /**
     * Simple init() method which will default to startDate = today / endDate = today + 15 years
     */
    calendar.init({
        startDateField: '.js-ercal-start',
        endDateField: '.js-ercal-end'
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