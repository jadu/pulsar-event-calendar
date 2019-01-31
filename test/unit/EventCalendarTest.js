'use strict';

import $ from 'jquery';
import EventCalendar from '../../src/EventCalendar';

var moment = require('moment');

describe('EventCalendar', () => {
    const clickEvent = $.Event('click');
    let $html,
        $body,
        eventCalendar,
        eventCalendarWithoutHTML;

    beforeEach(() => {
        $html = $('<div></div>');
        $body = $(`<body>
        <input type="date" class="js-ercal-start" />
        <input type="date" class="js-ercal-end" />
        <select class="js-ercal-repeat">
            <option value="1day">No repeat</option>
            <option value="day">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="fortnight">Every two weeks</option>
            <option value="monthByDay">Monthly, on this day of the month</option>
            <option value="monthByDate">Monthly, on this date</option>
            <option value="foo">This option should not exist</option>
        </select>
        <fieldset class="js-ercal-weekdays" style="display: none;">
            <label>
                <input value="1" name="ercal-weekdays" type="checkbox">
                <span>MO</span>
            </label>
            <label>
                <input value="2" name="ercal-weekdays" type="checkbox">
                <span>TU</span>
            </label>
            <label>
                <input value="3" name="ercal-weekdays" type="checkbox">
                <span>WE</span>
            </label>
            <label>
                <input value="4" name="ercal-weekdays" type="checkbox">
                <span>TH</span>
            </label>
            <label>
                <input value="5" name="ercal-weekdays" type="checkbox">
                <span>FR</span>
            </label>
            <label>
                <input value="6" name="ercal-weekdays" type="checkbox">
                <span>SA</span>
            </label>
            <label>
                <input value="7" name="ercal-weekdays" type="checkbox">
                <span>SU</span>
            </label>
        </fieldset>
        <div class="js-event-calendar"></div></body>`).appendTo($html);

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
			eventCalendarWithoutHTML = new EventCalendar();

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

        it('should start the week on a Monday', () => {
            expect($html.find('.header-day:first-of-type').text()).to.equal('M');
        });
    });


    describe('Providing the en-us locale', () => {
        beforeEach(() => {
            eventCalendar.init({
                locale: 'en-us'
            });
        });
    
        it('should start the week on a Sunday in the calendar', () => {
            expect($html.find('.header-day:first-of-type').text()).to.equal('S');
        });

        it('should start the week on a Sunday in the weekday picker', () => {
            expect($html.find('[name="ercal-weekdays"]:first + span').text()).to.equal('SU');
        });
    });


    describe('Providing the en-au locale', () => {
        beforeEach(() => {
            eventCalendar.init({
                locale: 'en-au'
            });
        });
    
        it('should start the week on a Monday', () => {
            expect($html.find('.header-day:first-of-type').text()).to.equal('M');
        });
    });


    describe('when no start date is provided', () => {
        beforeEach(() => {
            eventCalendar.init({
                locale: 'en-gb'
            });
        });

        it('should select the current date (today)', () => {
            let today = moment(new Date()).format('YYYY-MM-DD'),
                selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal(today);
        });

        it('should set the current date to .today', () => {
            expect($html.find('.selected').hasClass('today')).to.be.true;
        });

        it('should add an aria label indicating the start date', () => {
            expect($html.find('.selected > button').attr('aria-label')).to.contain('This is the event start date');
        });

        it('should constrain the available dates to the day before the startDate', () => {
            let yesterday = moment(new Date()).subtract(1, 'day').format('YYYY-MM-DD');
            expect($html.find('.calendar-day-' + yesterday).hasClass('inactive')).to.be.true;
        });

        it('should disable dates in the past to prevent keyboard navigation', () => {
            let date = moment(new Date()).subtract(1, 'day').format('YYYY-MM-DD');

            expect($html.find('[data-day="' + date + '"]').attr('disabled')).to.equal('disabled');
        });

        it('should not disable dates in the future', () => {
            let date = moment(new Date()).add(1, 'day').format('YYYY-MM-DD');

            expect($html.find('[data-day="' + date + '"]').attr('disabled')).to.be.undefined;
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
            eventCalendar.init({startDate: '2018-01-02'});
        });

        it('should select the specified date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2018-01-02');
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should disable dates in the past to prevent keyboard navigation', () => {
            expect($html.find('[data-day="2018-01-01"]').attr('disabled')).to.equal('disabled');
        });

        it('should not disable dates in the future', () => {
            expect($html.find('[data-day="2018-01-03"]').attr('disabled')).to.be.undefined;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (start month)', () => {
            let todayMonthYear = moment('2018-01-02').format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.false;
        });

        it('should have the correct week offset', () => {
            expect($html.find('tbody > tr:first-of-type > td:first-of-type').hasClass('calendar-day-2018-01-01')).to.be.true;
        });

        it('should not have a max value on the start date field', () => {
            expect(typeof $html.find('.js-ercal-start').attr('max')).to.equal('undefined');
        });
    });


    describe('when an end date is provided', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-05',
                endDate: '2018-01-10'
            });
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


    describe('passing events to the init() method', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01',
                events: [{ date: '2018-07-04' }]
            });
        });
        
        it('should add the appropriate styling to the date', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event')).to.be.true;
        });

        it('should add the appropriate aria-label to the date', () => {
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('Selected');
        });
    });


    describe('choosing a previously unselected date', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01'
            });
        });
        
        it('should add the appropriate styling to the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
        });

        it('should add the appropriate aria label the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('Selected. Event will repeat');
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

        it('should update the status in the live region', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('.js-ercal-status').text()).contains('Selected. Event will repeat on');
        });
    });


    describe('choosing multiple previously unselected dates', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01'
            });

            $html.find('[data-day="2018-07-04"]').click();
            $html.find('[data-day="2018-07-05"]').click();
        });
        
        it('should add to target dates the array of datesToAdd', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(2);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('2 days will be added');
        });

        it('should not show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });

        it('should not contain a count in the toDel information', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });
    });


    describe('choosing then unchoosing a previously unselected date', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01'
            });

            $html.find('[data-day="2018-07-04"]').click();
            $html.find('[data-day="2018-07-04"]').click();
        });
        
        it('should remove the ’to add’ styling from the target date', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.false;
        });

        it('the datesToAdd and datesToDel arrays should be empty', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should not show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: none;');
        });

        it('should not show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });

        it('should not contain a count in the toAdd information', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('');
        });

        it('should not contain a count in the toDel information', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });

        it('should update the status in the live region', () => {
            expect($html.find('.js-ercal-status').text()).contains('Unselected. Event will not repeat on 4 July, 2018');
        });
    });


    describe('choosing a previously selected date (one that was passed on init())', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01',
                events: [{ date: '2018-07-04' }]
            });
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

        it('should update the status in the live region', () => {
            $html.find('[data-day="2018-07-04"]').click();

            expect($html.find('.js-ercal-status').text()).contains('Removed. Event will no longer repeat on 4 July, 2018');
        });
    });


    describe('choosing multiple previously selected dates (ones that was passed on init())', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01',
                events: [{ date: '2018-07-04' }, { date: '2018-07-05' }]
            });

            $html.find('[data-day="2018-07-04"]').click();
            $html.find('[data-day="2018-07-05"]').click();
        });
        
        it('should add to target dates the array of datesToDel', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(2);
        });

        it('should show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });

        it('should update the toDel information with the current number', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('2 days will be removed');
        });

        it('should not show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: none;');
        });

        it('should not contain a count in the toAdd information', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('');
        });
    });


    describe('choosing then unchoosing a previously selected date (one that was passed on init())', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01',
                events: [{ date: '2018-07-04' }]
            });

            $html.find('[data-day="2018-07-04"]').click();
            $html.find('[data-day="2018-07-04"]').click();
        });
        
        it('should remove the appropriate styling from the target date', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-del')).to.be.false;
        });
        
        it('should remove the target date from the array of datesToDel', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should not show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });
        
        it('should not contain a count in the toDel information', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });

        it('should not show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: none;');
        });
        
        it('should not contain a count in the toAdd information', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('');
        });
        
        it('should reset the aria label to the ’selected’ state', () => {
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('4 July, 2018. Selected. Event will repeat on this day');
        });
    });


    describe('clicking a date before the startDate', () => {
        beforeEach(() => {
            eventCalendar.init({ startDate: '2018-07-04' });

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
            eventCalendar.init({ startDate: '2018-01-01' });
            $html.find('.clndr-next-button').click();
        });

        it('should show the next month in the header', () => {
            expect($html.find('.month').text()).to.equal('February 2018');
        });
    });


    describe('clicking the previous month arrow', () => {
        beforeEach(() => {
            eventCalendar.init({ startDate: '2018-01-01' });
            $html.find('.clndr-next-button').click();
            $html.find('.clndr-previous-button').click();
        });

        it('should show the previous month in the header', () => {
            expect($html.find('.month').text()).to.equal('January 2018');
        });
    });


    describe('clicking the reset button', () => {
        beforeEach(() => {
            $html.find('.js-ercal-start').val('2018-01-01');
            $html.find('.js-ercal-end').val('2018-01-20');

            eventCalendar.init({
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end',
                events: [{ date: '2018-01-10' }]
            });
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

        it('should clear the stored pattern', () => {
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect(eventCalendar.getRecurPattern()).to.be.null;
        });

        it('should reset the pattern field', () => {
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-repeat').val()).to.equal('1day');
        });

        it('should reset the aria label', () => {
            $html.find('[data-day="2018-01-10"]').click();
            $html.find('.js-ercal-reset').click();

            expect($html.find('[data-day="2018-01-10"]').attr('aria-label')).to.contain('Selected. Event will repeat on');
        });

        it('should reset the selected date', () => {
            $html.find('.js-ercal-start').val('05/01/2018').trigger('change');
            $html.find('.js-ercal-reset').click();

            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2018-01-01');
        });

        it('should reset the start date', () => {
            $html.find('.js-ercal-start').val('05/01/2018').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-start').val()).to.equal('01/01/2018');
        });

        it('should reset the end date', () => {
            $html.find('.js-ercal-end').val('05/01/2018').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-end').val()).to.equal('20/01/2018');
        });

        it('should reset the min value for the start date field', () => {
            expect(typeof $html.find('.js-ercal-start').attr('min')).to.equal('undefined');
        });

        it('should reset the min value for the end date field', () => {
            expect($html.find('.js-ercal-end').attr('min')).to.equal('2018-01-01');
        });
        
    });

    describe('clicking the reset button with no start/end date fields', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-01',
                endDate: '2018-01-20',
                events: [{ date: '2018-01-10' }]
            });
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

        it('should clear the stored pattern', () => {
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect(eventCalendar.getRecurPattern()).to.be.null;
        });

        it('should reset the pattern field', () => {
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-repeat').val()).to.equal('1day');
        });

        it('should reset the aria label', () => {
            $html.find('[data-day="2018-01-10"]').click();
            $html.find('.js-ercal-reset').click();

            expect($html.find('[data-day="2018-01-10"]').attr('aria-label')).to.contain('Selected. Event will repeat on');
        });

        it('should reset the selected date', () => {
            $html.find('.js-ercal-start').val('05/01/2018').trigger('change');
            $html.find('.js-ercal-reset').click();

            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2018-01-01');
        });
    });

    
    describe('clicking the reset button with no start/end values', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end',
                events: [{ date: '2018-01-10' }]
            });
        });

        it('should reset the start date back to today', () => {
            let today = moment(new Date()).format('DD/MM/YYYY');
            $html.find('.js-ercal-start').val(today).trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-start').val()).to.equal(today);
        });

        it('should reset the end date', () => {
            let todayPlus1Day = moment(new Date()).add(1, 'day').format('DD/MM/YYYY');
            $html.find('.js-ercal-end').val(todayPlus1Day).trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-end').val()).to.equal('');
        });

        it('should reset the min value for the start date field', () => {
            expect(typeof $html.find('.js-ercal-start').attr('min')).to.equal('undefined');
        });

        it('should reset the min value for the end date field', () => {
            let today = moment(new Date()).format('YYYY-MM-DD');

            expect($html.find('.js-ercal-end').attr('min')).to.equal(today);
        });
        
    });


    describe('choosing a pattern that doesn’t exist', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });

            $html.find('.js-ercal-repeat').val('foo').trigger('change');
        });
        
        it('should not store a recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern()).to.be.null;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });
    });


    describe('choosing the 1day’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });

            $html.find('.js-ercal-repeat').val('1day').trigger('change');
        });
        
        it('should not apply the repeat styling to any dates', () => {
            $html.find('.day').each(function() {
                expect($(this).hasClass('event-repeat')).to.be.false;
            });
        });

        it('should not store a recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern()).to.be.null;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also not paint anything for the next month', () => {
            $html.find('.clndr-next-button').click();

            $html.find('.day').each(function() {
                expect($(this).hasClass('event-repeat')).to.be.false;
            });
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });
    });


    describe('choosing the ’day’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });

            $html.find('.js-ercal-repeat').val('day').trigger('change');
        });
        
        it('should apply the repeat styling to all dates', () => {
            $html.find('.day:not(.calendar-day-2018-01-01):not(.calendar-day-2018-01-02)').each(function() {
                expect($(this).hasClass('event-repeat')).to.be.true;
            });
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('days');
            expect(eventCalendar.getRecurPattern().rules[0].units['1']).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also repaint the next month', () => {
            $html.find('.clndr-next-button').click();

            $html.find('.day:not(.calendar-day-2018-02-28)').each(function() {
                expect($(this).hasClass('event-repeat')).to.be.true;
            });
        });

        it('should not apply the repeat styling to dates after the endDate', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-28').hasClass('event-repeat')).to.be.false;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should add toDelete styling to an item when clicked', () => {
            let $target = $html.find('[data-day="2018-01-04"]'),
                $parent = $html.find('.calendar-day-2018-01-04');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            let $target = $html.find('[data-day="2018-01-04"]'),
                $parent = $html.find('.calendar-day-2018-01-04');

            $target.click();

            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-04');
        });
    });


    describe('choosing the ’weekly’ pattern without a startDate', () => {
        beforeEach(() => {
            eventCalendar.init();
            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
        });

        it('should select the current weekday in the weekday picker', () => {
            let dow = moment(new Date()).day();

            expect($html.find('[value="' + dow + '"]').prop('checked')).to.be.true;
        });
    });


    describe('choosing the ’weekly’ pattern with a startDate', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                startDateField: '.js-ercal-start',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });
            
            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
        });

        it('should show the weekday picker', () => {
            expect($html.find('.js-ercal-weekdays').attr('style')).to.equal('display: block;');
        });
        
        it('should apply the repeat styling', () => {
            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(5);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-16').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-23').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-30').hasClass('event-repeat')).to.be.true;
        });

        it('should select the weekday in the weekday picker', () => {
            expect($html.find('[value="2"]').prop('checked')).to.be.true;
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('daysOfWeek');
        });

        it('should apply the repeat styling to other specified weekdays', () => {
            $html.find('[value="4"]').prop('checked', true).trigger('change');
            
            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(9);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-16').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-23').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-30').hasClass('event-repeat')).to.be.true;

            expect($html.find('.calendar-day-2018-01-04').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-11').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-18').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-25').hasClass('event-repeat')).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also repaint the next month', () => {
            $html.find('.clndr-next-button').click();

            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(4);
            expect($html.find('.calendar-day-2018-02-06').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-02-13').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-02-20').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-02-27').hasClass('event-repeat')).to.be.true;
        });

        it('should not apply the repeat styling to dates after the endDate', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-28').hasClass('event-repeat')).to.be.false;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should add toDelete styling to an item when clicked', () => {
            let $target = $html.find('[data-day="2018-01-09"]'),
                $parent = $html.find('.calendar-day-2018-01-09');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            let $target = $html.find('[data-day="2018-01-16"]');

            $target.click();

            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-16');
        });

        it('should hide the weekday picker if a different repeat option is chosen', () => {
            $html.find('.js-ercal-repeat').val('day').trigger('change');

            expect($html.find('.js-ercal-weekdays').attr('style')).to.equal('display: none;');
        });

        it('should change the selected weekday in the weekday picker if the start date is changed', () => {
            $html.find('.js-ercal-start').val('03/01/2018').trigger('change');

            expect($html.find('[value="3"]').prop('checked')).to.be.true;
        });
    });


    describe('choosing the ’weekly’ pattern with pre-selected weekdays', () => {
        beforeEach(() => {
            $html.find('.js-ercal-repeat').val('weekly');
            $html.find('[value="2"]').prop('checked', true);
            eventCalendar.init({
                startDate: '2019-02-01',
            });
        });

        it('should select the current weekday in the weekday picker', () => {
            expect($html.find('[value="5"]').prop('checked')).to.be.true;
        });

        it('should select the pre-selected weekdays', () => {
            expect($html.find('.calendar-day-2019-02-05').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-12').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-19').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-26').hasClass('event-repeat')).to.be.true;
        });
    });


    describe('choosing the ’fortnight’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });

            $html.find('.js-ercal-repeat').val('fortnight').trigger('change');
        });
        
        it('should apply the repeat styling', () => {
            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(3);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-16').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-30').hasClass('event-repeat')).to.be.true;
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('weeks');
            expect(eventCalendar.getRecurPattern().rules[0].units['2']).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also repaint the next month', () => {
            $html.find('.clndr-next-button').click();

            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(2);
            expect($html.find('.calendar-day-2018-02-13').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-02-27').hasClass('event-repeat')).to.be.true;
        });

        it('should not apply the repeat styling to dates after the endDate', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-28').hasClass('event-repeat')).to.be.false;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should add toDelete styling to an item when clicked', () => {
            let $target = $html.find('[data-day="2018-01-16"]'),
                $parent = $html.find('.calendar-day-2018-01-16');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            let $target = $html.find('[data-day="2018-01-16"]');

            $target.click();

            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-16');
        });
    });

    describe('choosing the ’monthly on this date’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-10' }]
            });
            
            $html.find('.js-ercal-repeat').val('monthByDate').trigger('change');
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('months');
            expect(eventCalendar.getRecurPattern().rules[0].units['1']).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also repaint the next month', () => {
            $html.find('.clndr-next-button').click();

            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-02-02').hasClass('event-repeat')).to.be.true;
        });

        it('should not apply the repeat styling to dates after the endDate', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-28').hasClass('event-repeat')).to.be.false;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should add toDelete styling to an item when clicked', () => {
            $html.find('.clndr-next-button').click();

            let $target = $html.find('[data-day="2018-02-02"]'),
                $parent = $html.find('.calendar-day-2018-02-02');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            $html.find('.clndr-next-button').click();

            let $target = $html.find('[data-day="2018-02-02"]');

            $target.click();

            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-02-02');
        });
    });


    describe('choosing the ’monthly on this day’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-12',
                endDate: '2018-02-27',
                events: [{ date: '2018-01-14' }]
            });

            $html.find('.js-ercal-repeat').val('monthByDay').trigger('change');
        });
        
        it('should apply the repeat styling to the next occurrence', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-09').hasClass('event-repeat')).to.be.true;
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('daysOfWeek');
            expect(eventCalendar.getRecurPattern().rules[0].units['5']).to.be.true;
            expect(eventCalendar.getRecurPattern().rules[1].measure).to.equal('weeksOfMonthByDay')
            expect(eventCalendar.getRecurPattern().rules[1].units['1']).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-11').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-14').hasClass('event')).to.be.true;
        });

        it('should also repaint the next month', () => {
            $html.find('.clndr-next-button').click();

            let $days = $html.find('.day.event-repeat');

            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-02-09').hasClass('event-repeat')).to.be.true;
        });

        it('should not apply the repeat styling to dates after the endDate', () => {
            $html.find('.clndr-next-button').click();

            expect($html.find('.calendar-day-2018-02-28').hasClass('event-repeat')).to.be.false;
        });

        it('should not add any dates to the datesToAdd and datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should add toDelete styling to an item when clicked', () => {
            $html.find('.clndr-next-button').click();

            let $target = $html.find('[data-day="2018-02-09"]'),
                $parent = $html.find('.calendar-day-2018-02-09');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            $html.find('.clndr-next-button').click();

            let $target = $html.find('[data-day="2018-02-09"]');

            $target.click();

            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-02-09');
        });
    });


    describe('applying a pattern, then making changes to dates affected by that pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2019-02-27'
            });

            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('[data-day="2018-01-10"]').click(); // to add
        });

        it('should add toDel styling to dates being removed from the pattern', () => {
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-del')).to.be.true;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.true;
        });

        it('should add toAdd styling to dates being added outside of the pattern', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-del')).to.be.false;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-add')).to.be.true;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-repeat')).to.be.false;
        });

        it('should add the dates being removed from the pattern to the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-09');
        });

        it('should add the dates being added to the pattern to the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd[0]._i).to.equal('2018-01-10');
        });

        it('should show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('1 day will be added');
        });

        it('should show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });

        it('should update the toDel information with the current number', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('1 day will be removed');
        });
    });

    describe('applying a pattern, making changes to dates affected by that pattern, then reverting those changes', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2019-02-27'
            });

            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('[data-day="2018-01-10"]').click(); // to add

            // revert
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('[data-day="2018-01-10"]').click(); // to add
        });

        it('should remove toDel styling from dates previously being removed from the pattern', () => {
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-del')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.true;
        });

        it('should remove toAdd styling to dates previously being added outside of the pattern', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-del')).to.be.false;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-repeat')).to.be.false;
        });

        it('should remove the dates previously being removed from the pattern from the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should remove the dates previopusly being added to the pattern from the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(0);
        });

        it('should hide the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: none;');
        });

        it('should remove the toAdd information', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('');
        });

        it('should hide the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });

        it('should remove the toDel information', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });
    });


    describe('making date changes, then applying a pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02',
                endDate: '2019-02-27',
                events: [{ date: '2018-01-10' }]
            });

            $html.find('[data-day="2018-01-04"]').click(); // to add
            $html.find('[data-day="2018-01-10"]').click(); // to del
            $html.find('.js-ercal-repeat').val('day').trigger('change');
        });

        it('should replace the toAdd styling with the repeat styling', () => {
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-del')).to.be.false;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-add')).to.be.true;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-repeat')).to.be.true;
        });

        it('should maintain the toDel styling rather than the repeat styling', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-del')).to.be.true;
        });

        it('should not remove the dates from the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd[0]._i).to.equal('2018-01-04');
        });

        it('should not remove the dates from the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-10');
        });

        it('should show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('1 day will be added');
        });

        it('should show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });

        it('should update the toDel information with the current number', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('1 day will be removed');
        });
    });


    describe('making date changes, applying a pattern that affects the same date, then changing the date again', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02', 
                endDate: '2019-02-27', 
                events: [{ date: '2018-01-10' }]
            });

            $html.find('[data-day="2018-01-04"]').click(); // to add
            $html.find('[data-day="2018-01-10"]').click(); // to del
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('[data-day="2018-01-04"]').click();
            $html.find('[data-day="2018-01-10"]').click();
        });

        it('should revert the date to repeat back to dates to del ', () => {
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-del')).to.be.true;
        });

        it('should revert dates to delete back to the dates to repeat', () => {
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-del')).to.be.true;
        });
    });


    describe('making date changes, then applying a pattern, then removing the pattern', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02', 
                endDate: '2019-02-27', 
                events: [{ date: '2018-01-10' }]
            });

            $html.find('[data-day="2018-01-04"]').click(); // to add
            $html.find('[data-day="2018-01-10"]').click(); // to del
            $html.find('.js-ercal-repeat').val('day').trigger('change');
            $html.find('.js-ercal-repeat').val('1day').trigger('change');
        });

        it('should maintain the toAdd styling on dates to add rather than the repeat styling', () => {
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-add')).to.be.true;
            expect($html.find('.calendar-day-2018-01-04').hasClass('event-del')).to.be.false;
        });

        it('should maintain the toDel styling on dates to delete rather than the repeat styling', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-10').hasClass('event-del')).to.be.true;
        });

        it('should not remove the dates from the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd[0]._i).to.equal('2018-01-04');
        });

        it('should not remove the dates from the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel[0]._i).to.equal('2018-01-10');
        });

        it('should show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('1 day will be added');
        });

        it('should show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });

        it('should update the toDel information with the current number', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('1 day will be removed');
        });
    });


    describe('applying a pattern, excluding a date from that pattern, then changing to a pattern which doesn’t hit the same date', () => {
        beforeEach(() => {
            eventCalendar.init({ startDate: '2018-01-02' });

            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('.js-ercal-repeat').val('fortnight').trigger('change');
        });
        
        it('should store the target date in the datesToDel array', () => {
            let dates = eventCalendar.getDates();
            
            expect(dates.datesToDel[0]._i).to.equal('2018-01-09');
        });
        
        it('should show the toDel information in the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: inline;');
        });
        
        it('should update the toDel information with the current number', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('1 day will be removed');
        });

        it('should maintain the toDel styling on the target date', () => {
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-del')).to.be.true;
        });
    });

    describe('applying a pattern, excluding a date from that pattern, then changing to a pattern which doesn’t hit the same date, then clicking the target date again', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-01-02', 
                endDate: '2019-02-27'
            });

            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('.js-ercal-repeat').val('fortnight').trigger('change');
            $html.find('[data-day="2018-01-09"]').click(); // to del
        });

        it('should maintain the toDel styling on the target date', () => {
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-add')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-del')).to.be.false;
        });

        it('should remove the target date from the datesToDel array', () => {
            let dates = eventCalendar.getDates();
            
            expect(dates.datesToDel.length).to.equal(0);
        });

        it('should remove the toDel information from the review panel', () => {
            expect($html.find('.js-dates-to-del').attr('style')).to.equal('display: none;');
        });

        it('should remove the value from the toDel information', () => {
            expect($html.find('.js-dates-to-del').html()).to.equal('');
        });
    });


    describe('when the startDateField is provided without a value', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDateField: '.js-ercal-start' 
            });
        });

        it('should select the current date (today)', () => {
            let today = moment(new Date()).format('YYYY-MM-DD'),
                selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal(today);
        });

        it('should set the current date to .today', () => {
            expect($html.find('.selected').hasClass('today')).to.be.true;
        });

        it('should constrain the max value on the start date field to today + 15 years', () => {
            let startDatePlus15Years = moment(new Date()).add(15, 'years').format('YYYY-MM-DD');
            expect($html.find('.js-ercal-start').attr('max')).to.equal(startDatePlus15Years);
        });
    });


    describe('when the startDate and a startDateField are provided with a value', () => {
        beforeEach(() => {
            let $startDateField = $html.find('.js-ercal-start').val('1981-07-04');
            
            eventCalendar.init({
                startDate: '1981-01-01',
                startDateField: '.js-ercal-start' 
            });
        });

        it('should use the value from startDateField as the startDate', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('1981-07-04');
        });
    });


    describe('when the startDate and a startDateField are provided without a value', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '1981-01-01',
                startDateField: '.js-ercal-start' 
            });
        });

        it('should use the value from startDate as the startDate', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('1981-01-01');
        });
    });


    describe('when the start date field has a value on init', () => {
        beforeEach(() => {
            $html.find('.js-ercal-start').val('1981-07-04');

            eventCalendar.init({ startDateField: '.js-ercal-start' });
        });

        it('should select the specified date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('1981-07-04');
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should disable dates in the past to prevent keyboard navigation', () => {
            expect($html.find('[data-day="1981-07-03"]').attr('disabled')).to.equal('disabled');
        });

        it('should not disable dates in the future', () => {
            expect($html.find('[data-day="1981-07-05"]').attr('disabled')).to.be.undefined;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (start month)', () => {
            let todayMonthYear = moment('1981-07-04').format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.false;
        });
    });


    describe('when the start date field is changed', () => {
        beforeEach(() => {
            eventCalendar.init({ 
                startDate: '01/10/2015',
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end',
                events: [{ date: '2015-10-19' }, { date: '2015-10-24' }]
            });

            $html.find('[data-day="2015-10-20"]').click(); // to add
            $html.find('[data-day="2015-10-22"]').click(); // to add
            $html.find('[data-day="2015-10-19"]').click(); // to del
            $html.find('[data-day="2015-10-24"]').click(); // to del

            $html.find('.js-ercal-start').val('21/10/2015').trigger('change');
        });

        it('should select the specified date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2015-10-21');
        });

        it('should not set the current date to inactive', () => {
            expect($html.find('.selected').hasClass('inactive')).to.be.false;
        });

        it('should disable dates in the past to prevent keyboard navigation', () => {
            expect($html.find('[data-day="2015-10-20"]').attr('disabled')).to.equal('disabled');
        });

        it('should not disable dates in the future', () => {
            expect($html.find('[data-day="2015-10-22"]').attr('disabled')).to.be.undefined;
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
        });

        it('should show the month & year in text form (start month)', () => {
            let todayMonthYear = moment('2015-10-21').format('MMMM YYYY');

            expect($html.find('.month').text()).to.equal(todayMonthYear);
        });

        it('should not show the previous month arrow', () => {
            expect($html.find('.clndr-previous-button').hasClass('inactive')).to.be.true;
        });

        it('should show the next month arrow', () => {
            expect($html.find('.clndr-next-button').hasClass('inactive')).to.be.false;
        });

        it('should remove any out-of-bounds dates from the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(1);
            expect(dates.datesToAdd[0]._i).to.equal('2015-10-22');
        });

        it('should remove any out-of-bounds dates from the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel.length).to.equal(1);
            expect(dates.datesToDel[0]._i).to.equal('2015-10-24');
        });

        it('should revert to the start date when the calendar is reset', () => {
            $html.find('.js-ercal-reset').click();
            
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2015-10-01');
        });

        it('should constrain the min value for the end date field', () => {
            expect($html.find('.js-ercal-end').attr('min')).to.equal('2015-10-21');
        });
    });


    describe('when the start date field is changed, then the end date field is changed', () => {
        beforeEach(() => {
            eventCalendar.init({ 
                startDate: '01/10/2015',
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end'
            });

            $html.find('.js-ercal-start').val('10/10/2015').trigger('change');
            $html.find('.js-ercal-end').val('20/10/2015').trigger('change');
        });

        it('should maintain the selected start date', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2015-10-10');
        });

        it('should constrain the max value for the start date field', () => {
            expect($html.find('.js-ercal-start').attr('max')).to.equal('2015-10-20');
        });

        it('should constrain the min value for the end date field', () => {
            expect($html.find('.js-ercal-end').attr('min')).to.equal('2015-10-10');
        });
    });


    describe('when the endDateField is provided without a value, and no startDate is defined', () => {
        beforeEach(() => {
            eventCalendar.init({
                endDateField: '.js-ercal-end'
            });
        });

        it('should set the end date to today + 15 years', () => {
            let todayPlus15Years = moment(new Date()).add(15, 'years').format('YYYY-MM-DD');

            expect(eventCalendar.clndr.options.constraints.endDate).to.equal(todayPlus15Years);
        });
    });


    describe('when the endDateField is provided without a value, and a startDate is defined', () => {
        beforeEach(() => {
            eventCalendar.init({
                endDateField: '.js-ercal-end',
                startDate: '01/01/2000'
            });
        });

        it('should set the end date to startDate + 15 years', () => {
            let startDatePlus15Years = moment('2000-01-01').add(15, 'years').format('YYYY-MM-DD');

            expect(eventCalendar.clndr.options.constraints.endDate).to.equal(startDatePlus15Years);
        });
    });


    describe('when the startDateField and endDateField are provided with a value', () => {
        beforeEach(() => {
            $html.find('.js-ercal-start').val('1981-07-02');
            $html.find('.js-ercal-end').val('1981-07-04');

            eventCalendar.init({
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end' 
            });
        });

        it('should set the end date to that value', () => {
            expect(eventCalendar.clndr.options.constraints.endDate).to.equal('1981-07-04');
        });

        it('should constrain the min value for the end date field to reflect the start date', () => {
            expect($html.find('.js-ercal-end').attr('min')).to.equal('1981-07-02');
        });

        it('should constrain the max value for the start date field to reflect the emd date', () => {
            expect($html.find('.js-ercal-start').attr('max')).to.equal('1981-07-04');
        });
    });


    describe('when the startDate and endDate option is defined', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '01/07/1981',
                endDate: '04/07/1981' 
            });
        });

        it('should set the end date to that value', () => {
            expect(eventCalendar.clndr.options.constraints.endDate).to.equal('1981-07-04');
        });
    });


    describe('when the end date field is changed', () => {
        beforeEach(() => {
            eventCalendar.init({ 
                startDate: '01/10/2015',
                endDate: '30/10/2015',
                endDateField: '.js-ercal-end',
                events: [{ date: '2015-10-19' }, { date: '2015-10-24' }]
            });

            $html.find('[data-day="2015-10-20"]').click(); // to add
            $html.find('[data-day="2015-10-22"]').click(); // to add
            $html.find('[data-day="2015-10-19"]').click(); // to del
            $html.find('[data-day="2015-10-24"]').click(); // to del

            $html.find('.js-ercal-end').val('21/10/2015').trigger('change');
        });

        it('should keep the startDate selected', () => {
            let selectedDate = $html.find('.selected > .day-contents').data('day');

            expect(selectedDate).to.equal('2015-10-01');
        });


        it('should remove any out-of-bounds dates from the datesToAdd arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToAdd.length).to.equal(1);
            expect(dates.datesToAdd[0]._i).to.equal('2015-10-20');
        });

        it('should remove any out-of-bounds dates from the datesToDel arrays', () => {
            let dates = eventCalendar.getDates();

            expect(dates.datesToDel.length).to.equal(1);
            expect(dates.datesToDel[0]._i).to.equal('2015-10-19');
        });

        it('should refocus the calendar if the end date is before the currently focused month', () => {
            $html.find('.js-ercal-end').val('01/12/2015').trigger('change');
            $html.find('.clndr-next-button').click();
            expect($html.find('.month').text()).to.equal('November 2015');

            $html.find('.js-ercal-end').val('21/10/2015').trigger('change');
            expect($html.find('.month').text()).to.equal('October 2015');
        });
    });

    describe('when the end date field is cleared', () => {
        beforeEach(() => {
            $html.find('.js-ercal-start').val('1981-07-02');
            $html.find('.js-ercal-end').val('1981-07-04');

            eventCalendar.init({
                startDateField: '.js-ercal-start',
                endDateField: '.js-ercal-end' 
            });

            $html.find('.js-ercal-end').val('').trigger('change');
        });

        it('should maintain the start date', () => {
            expect(eventCalendar.clndr.options.constraints.startDate).to.equal('1981-07-02');
        });

        it('should set the end date to startDate + 15 years', () => {
            let todayPlus15Years = moment(new Date()).add(15, 'years').format('YYYY-MM-DD');

            expect(eventCalendar.clndr.options.constraints.endDate).to.equal(todayPlus15Years);
        });

        it('should reset the max value for the start date field', () => {
            let todayPlus15Years = moment(new Date()).add(15, 'years').format('YYYY-MM-DD');

            expect($html.find('.js-ercal-start').attr('max')).to.equal(todayPlus15Years);
        });

        it('should reset the min value for the end date field', () => {
            let todayPlus15Years = moment(new Date()).add(15, 'years').format('YYYY-MM-DD');

            expect($html.find('.js-ercal-start').attr('max')).to.equal(todayPlus15Years);
        });
    });

    describe('Attempting to set an end date that is before the start date', () => {
        it('should throw an error when the values are passed as init options', () => {
            expect(() => {
                eventCalendar.init({
                    startDate: '02/07/1981',
                    endDate: '01/07/1981' 
                });
            }).to.throw('End date can not be before the start date');
        });

        it('should throw an error when the values are passed as date fields', () => {
			expect(() => {
                $html.find('.js-ercal-start').val('02/07/1981');
                $html.find('.js-ercal-end').val('01/07/1981');

                eventCalendar.init({
                    startDateField: '.js-ercal-start',
                    endDateField: '.js-ercal-end' 
                });
            }).to.throw('End date can not be before the start date');
        });
    });

    describe('Selecting a date if the aria live region does not exist in the template', () => {
        beforeEach(() => {
            let templateWithoutAriaStatusContainer = `
            <div class='clndr-controls' role='navigation'>
                <div class='clndr-control-button'>
                    <button class='clndr-previous-button' aria-controls='event-calendar' aria-label='Go to the previous month'>&lsaquo;</button>
                </div>
                <div class='month' id='aria-clndr-title' aria-live='polite'><%= month %> <%= year %></div>
                <div class='clndr-control-button rightalign'>
                    <button class='clndr-next-button' aria-controls='event-calendar' aria-label='Go to the next month'>&rsaquo;</button>
                </div>
            </div>
            <table id='event-calendar' class='clndr-table' border='0' cellspacing='0' cellpadding='0'>
                <thead>
                    <tr class='header-days'>
                    <% for (var i = 0; i < daysOfTheWeek.length; i++) { %>
                        <td class='header-day'><%= daysOfTheWeek[i] %></td>
                    <% } %>
                    </tr>
                </thead>
                <tbody aria-live="polite">
                <% for (var i = 0; i < numberOfRows; i++) { %>
                    <tr>
                    <% for (var j = 0; j < 7; j++){ %>
                    <% var d = j + i * 7; %>
                        <% var daysLeadingZero = days[d].day < 10 ? '0' + days[d].day : days[d].day; %>
                        <td class='<%= days[d].classes %>'>
                        <% if (days[d].day.length != 0) { %>
                            <button 
                                class='day-contents' 
                                data-day="<%= year %>-<%= monthNumerical %>-<%= daysLeadingZero %>" 
                                aria-label="<% if (days[d].classes.indexOf('selected') !== -1) { %><%= ariaStartDate %><% } else if (days[d].classes.indexOf('event') !== -1) { %><%= ariaSelected %><% } %> <%= days[d].day %> <%= month %>, <%= year %>.<% if (days[d].classes.indexOf('selected') === -1 && days[d].classes.indexOf('event') === -1) { %> <%= ariaUnselected %><% } %>"
                                <% 
                                    if (days[d].classes.indexOf('inactive') !== -1 && 
                                    days[d].classes.indexOf('selected') === -1) { 
                                %> disabled<% } %>
                            >
                                <%= days[d].day %>
                            </button>
                        <% } %>
                        </td>
                    <% } %>
                    </tr>
                <% } %>
                </tbody>
            </table>
            <div class="event-calendar-review">
                <ul class="event-calendar-summary">
                    <li><i class="fa fa-repeat icon--success"></i> Repeat pattern</li>
                    <li><i class="fa fa-plus-circle icon--success"></i> Additional repeat
                        <span class="js-dates-to-add label label--success" style="display: none;"></span></li>
                    <li><i class="fa fa-ban icon--danger"></i> Event will <u>not</u> repeat
                        <span class="js-dates-to-del label label--danger" style="display: none;"></span></li>
                </ul>
                <button class="js-ercal-reset">Reset Calendar</button>
            </div>`;

            eventCalendar.init({ 
                startDate: '2015-10-01',
                template: templateWithoutAriaStatusContainer
            });

            $html.find('[data-day="2015-10-02"]').click();
        });
       
        // the code to update the live region lives in the styleToAdd method, if we have successfully got past that and
        // updated the review panel, then the updateLiveRegion method should've correctly returned without an error
        it('should show the toAdd information in the review panel', () => {
            expect($html.find('.js-dates-to-add').attr('style')).to.equal('display: inline;');
        });

        it('should update the toAdd information with the current number', () => {
            expect($html.find('.js-dates-to-add').html()).to.equal('1 day will be added');
        });

    });

    describe('passing datesToAdd to the init() method', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-03',
                endDate: '2018-07-06',
                datesToAdd: [ '2018-07-02', '2018-07-03', '2018-07-04', '2018-07-05', '2018-07-06', '2018-07-07' ]
            });
        });
        
        it('should add the appropriate styling to the dates', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
            expect($html.find('[data-day="2018-07-05"]').parent().hasClass('event-add')).to.be.true;
            expect($html.find('[data-day="2018-07-06"]').parent().hasClass('event-add')).to.be.true;
        });
        
        it('should not style out of bounds dates', () => {
            expect($html.find('[data-day="2018-07-02"]').parent().hasClass('event-add')).to.be.false;
        });

        it('should not style dates after the end date', () => {
            expect($html.find('[data-day="2018-07-07"]').parent().hasClass('event-add')).to.be.false;
        });

        it('should add the appropriate aria-label to the dates', () => {
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('Selected');
            expect($html.find('[data-day="2018-07-05"]').attr('aria-label')).to.contain('Selected');
            expect($html.find('[data-day="2018-07-06"]').attr('aria-label')).to.contain('Selected');
        });

        it('should maintain styling to the dates when reset', () => {
            $html.find('.js-ercal-reset').click();

            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
            expect($html.find('[data-day="2018-07-05"]').parent().hasClass('event-add')).to.be.true;
            expect($html.find('[data-day="2018-07-06"]').parent().hasClass('event-add')).to.be.true;
        });
    });

    describe('passing datesToDel to the init() method', () => {
        beforeEach(() => {
            eventCalendar.init({
                startDate: '2018-07-01',
                endDate: '2018-07-03',
                datesToDel: [ '2018-07-01', '2018-07-02', '2018-07-03', '2018-07-04' ]
            });
        });
        
        it('should add the appropriate styling to the dates', () => {
            expect($html.find('[data-day="2018-07-01"]').parent().hasClass('event-del')).to.be.true;
            expect($html.find('[data-day="2018-07-02"]').parent().hasClass('event-del')).to.be.true;
            expect($html.find('[data-day="2018-07-03"]').parent().hasClass('event-del')).to.be.true;
        });

        it('should not style out of bounds dates', () => {
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-del')).to.be.false;
        });

        it('should add the appropriate aria-label to the dates', () => {
            expect($html.find('[data-day="2018-07-02"]').attr('aria-label')).to.contain('Removed');
            expect($html.find('[data-day="2018-07-03"]').attr('aria-label')).to.contain('Removed');
        });

        it('should maintain styling to the dates when reset', () => {
            $html.find('.js-ercal-reset').click();

            expect($html.find('[data-day="2018-07-02"]').parent().hasClass('event-del')).to.be.true;
            expect($html.find('[data-day="2018-07-03"]').parent().hasClass('event-del')).to.be.true;
        });
    });

    describe('setting weekday checkboxes before init()', () => {
        beforeEach(() => {
            $html.find('[value="2"]').prop('checked', true);
            $html.find('[value="5"]').prop('checked', true);
            $html.find('.js-ercal-repeat').val('weekly');

            eventCalendar.init({
                startDate: '2019-02-01'
            });
        });

        it('should select the appropriate days', () => {
            expect($html.find('.calendar-day-2019-02-05').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-12').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-19').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-26').hasClass('event-repeat')).to.be.true;
            
            expect($html.find('.calendar-day-2019-02-08').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-15').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-22').hasClass('event-repeat')).to.be.true;
        });

        it('should rest to the originally selected days when reset', () => {
            $html.find('.js-ercal-reset').click();

            expect($html.find('.calendar-day-2019-02-05').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-12').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-19').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-26').hasClass('event-repeat')).to.be.true;
            
            expect($html.find('.calendar-day-2019-02-08').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-15').hasClass('event-repeat')).to.be.true;
            expect($html.find('.calendar-day-2019-02-22').hasClass('event-repeat')).to.be.true;
        });
    });
});
