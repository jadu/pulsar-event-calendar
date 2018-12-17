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


    describe('choosing a previously unselected date', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01');
        });
        
        it('should add the appropriate styling to the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
        });

        it('the datesToAdd and datesToDel arrays should be empty', () => {
            let dates = eventCalendar.getDates();
            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });
        
        it('should add to target date the array of datesToAdd', () => {
            $html.find('[data-day="2018-07-04"]').click();
            
            let dates = eventCalendar.getDates();
            expect(dates.datesToAdd.length).to.equal(1);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should show the toAdd information in the review panel', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-add').html()).to.equal('1 day will be added');
        });

        it('should not show the toDel information in the review panel', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });

        it('should not contain a count in the toDel information', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });
    });

    describe('choosing a previously selected date (one that was passed on init())', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01', null, [{ date: '2018-07-04' }]);
        });
        
        it('should add the appropriate styling to the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-del')).to.be.true;
        });
        
        it('should add to target date the array of datesToDel', () => {
            $html.find('[data-day="2018-07-04"]').click();
            
            let dates = eventCalendar.getDates();
            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(1);
        });

        it('should show the toDel information in the review panel', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });

        it('should update the toDel information with the current number', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-del').html()).to.equal('1 day will be removed');
        });

        it('should not show the toAdd information in the review panel', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: none;');
        });

        it('should not contain a count in the toAdd information', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-dates-to-add').html()).to.equal('');
        });
    });


    describe('clicking a date before the startDate', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-04');

            $html.find('[data-day="2018-07-01"]').click();
        });

        it('should not add any visual styling to the target date', () => {
            expect($html.find('[data-day="2018-07-01"]').parent().hasClass('event-del event-add')).to.be.false;
        });

        it('should not be added to the datesToAdd or datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });
    });


    describe('clicking the next month arrow', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-01');
            $html.find('.clndr-next-button').click();
        });

        it('should show the next month in the header', () => {
            expect($html.find('.month').text()).to.equal('February 2018');
        });
    });


    describe('clicking the previous month arrow', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-01');
            $html.find('.clndr-next-button').click();
            $html.find('.clndr-previous-button').click();
        });

        it('should show the previous month in the header', () => {
            expect($html.find('.month').text()).to.equal('January 2018');
        });
    });

    describe('clicking the reset button', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-01', null, [{ date: '2018-01-10' }]);
        });
        
        it('should empty the datesToAdd and datesToDel arrays', () => {
            $html.find('[data-day="2018-01-02"]').click();
            $html.find('[data-day="2018-01-10"]').click();
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(1);
            expect(dates.datesToDel.length).to.equal(1);

            $html.find('.js-ercal-reset').click();
            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });
    });


});

