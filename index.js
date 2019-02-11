const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const calendar = new EventCalendar($('html'));

    // let toAdd = [
    //     '2019-02-05',
    //     '2019-02-06',
    //     '2019-02-09',
    //     '2019-02-10',
    //     '2019-02-11',
    //     '2019-02-12'
    // ];

    // let toDel = [
    //     '2019-02-08',
    //     '2019-02-15'
    // ];

    /**
     * Simple init() method which will default to startDate = today / endDate = today + 15 years
     */
    calendar.init({
        startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
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