const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const calendar = new EventCalendar($('html'));
    
    /**
     * Simple init() method which will default to startDate = today / endDate = today + 15 years
     */
    //calendar.init();

    /**
     * More detailed example with saved events, start date and end date
     */

    let myEvents = [
        { date: '2019-01-25' },
        { date: '2019-02-10' }
    ];

    let startDate   = '2019-01-02';
    let endDate     = '2019-02-20';

    calendar.init(startDate, endDate, myEvents);

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