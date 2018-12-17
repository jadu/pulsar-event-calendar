'use strict';

import $ from 'jquery';
import EventCalendar from '../../src/EventCalendar';

var moment = require('moment');

describe('EventCalendar', () => {
    const clickEvent = $.Event('click');
    let $html,
        $body,
        clndr,
        eventCalendar,
        eventCalendarWithoutHTML,
        customStartDate = '1981-07-04';

    beforeEach(() => {
        $html = $('<div></div>');
        $body = $('<body><div class="js-event-calendar"></div></body>').appendTo($html);

        eventCalendar = new EventCalendar($html);
    });

    afterEach(() => {
        $body.empty();
    });


    describe('init()', () => {
        beforeEach(() => {
            eventCalendar.init();
        });
    
		it('should throw an error if $html isn’t passed to the component', () => {
			eventCalendarWithoutHTML = new EventCalendar(undefined);

			expect(() => {
                eventCalendarWithoutHTML.init();
            }).to.throw('$html must be passed to EventCalendar');
        });

        it('should throw an error if .js-event-calendar container isn’t present', () => {
            let $htmlWithoutContainer = $('<div></div>'),
                eventCalendarWithoutContainer = new EventCalendar($htmlWithoutContainer);
            
			expect(() => {
                eventCalendarWithoutContainer.init();
            }).to.throw('EventCalendar requires a .js-event-calendar element present in the DOM');
        });

    });


    describe('when no start date is provided', () => {
        beforeEach(() => {
            eventCalendar.init();
        });

        it('should select the current date (today)', () => {
            let today = moment(new Date()).format('YYYY-MM-DD'),
                selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal(today);
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (today)', () => {
            let todayMonthYear = moment(new Date()).format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.false;
        });
    });


    describe('when a start date is provided', () => {
        beforeEach(() => {
            eventCalendar.init(customStartDate);
        });

        it('should select the specified date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal(customStartDate);
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (start month)', () => {
            let todayMonthYear = moment(customStartDate).format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.false;
        });
    });


    describe('when an end date is provided', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-05', '2018-01-10');
        });

        it('should select the specified date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2018-01-05');
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should constrain the available dates to the endDate', () => {
            expect($html.find('[data-day="2018-01-11"]').parent().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (start month)', () => {
            let todayMonthYear = moment('2018-01-01').format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should not show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.true;
        });
    });


    describe('clicking a previously unselected date', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01');
            
            $html.find('[data-day="2018-07-04"]').trigger(clickEvent);
        });
        
        it('should add the appropriate styling to the target date', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
        });
        
        it('should add to target date the array of datesToAdd', () => {
            //console.log(clndr.options.extras.datesToAdd);
        });
    });


    describe('clicking a date before the startDate', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-04');

            $html.find('[data-day="2018-07-01"]').trigger(clickEvent);
        });

        it('should not add any visual styling to the target date', () => {
            expect($html.find('[data-day="2018-07-01"]').parent().hasClass('event-del event-add')).to.be.false;
        });
    });

});

