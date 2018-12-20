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
        eventCalendarWithoutHTML;

    beforeEach(() => {
        $html = $('<div></div>');
        $body = $(`<body>
        <select class="js-ercal-repeat">
            <option value="no-repeat">No repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="two-weekly">Every two weeks</option>
            <option value="monthly-day">Monthly, on this day of the month</option>
            <option value="monthly-date">Monthly, on this date</option>
            <option value="annually">Every year</option>
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

        it('should start the week on a Monday', () => {
            expect($html.find('.header-day:first-of-type').text()).to.equal('M');
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

        it('should set the current date to .today', () => {
            expect($html.find('.selected').hasClass('today')).to.be.true;
        });

        it('should add an aria label indicating the start date', () => {
            expect($html.find('.selected > button').attr('aria-label')).to.contain('This is the event start date');
        });

        it('should constrain the available dates to the day before the startDate', () => {
            expect($html.find('.selected').prev().hasClass('inactive')).to.be.true;
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
            eventCalendar.init('2018-01-02');
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
            console.log($html.find('tbody td:first-of-type').attr('class'));
            expect($html.find('tbody > tr:first-of-type > td:first-of-type').hasClass('calendar-day-2018-01-01')).to.be.true;
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


    describe('passing events to the init() method', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01', null, [{ date: '2018-07-04' }]);
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
            eventCalendar.init('2018-07-01');
        });
        
        it('should add the appropriate styling to the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').parent().hasClass('event-add')).to.be.true;
        });

        it('should add the appropriate aria label the target date', () => {
            $html.find('[data-day="2018-07-04"]').click();
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('Selected. Event will repeat on this day');
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


    describe('choosing multiple previously unselected dates', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01');
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
            eventCalendar.init('2018-07-01');
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


    describe('choosing multiple previously selected dates (ones that was passed on init())', () => {
        beforeEach(() => {
            eventCalendar.init('2018-07-01', null, [{ date: '2018-07-04' }, { date: '2018-07-05' }]);
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
            eventCalendar.init('2018-07-01', null, [{ date: '2018-07-04' }]);
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
            expect($html.find('[data-day="2018-07-04"]').attr('aria-label')).to.contain('Selected. Event will repeat on this day');
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

        it('should clear the stored pattern', () => {
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect(eventCalendar.getRecurPattern()).to.be.null;
        });

        it('should reset the pattern field', () => {
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
            $html.find('.js-ercal-reset').click();

            expect($html.find('.js-ercal-repeat').val()).to.equal('no-repeat');
        });

        it('should reset the aria label', () => {
            $html.find('[data-day="2018-01-10"]').click();
            $html.find('.js-ercal-reset').click();
            expect($html.find('[data-day="2018-01-10"]').attr('aria-label')).to.contain('Selected. Event will repeat on this day');
        });
    });


    describe('choosing a pattern that doesn’t exist', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
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


    describe('choosing the no-repeat’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('no-repeat').trigger('change');
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


    describe('choosing the ’daily’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
        });
        
        it('should apply the repeat styling to all dates', () => {
            $html.find('.day:not(.calendar-day-2018-01-01)').each(function() {
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
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
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
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('weeks');
            expect(eventCalendar.getRecurPattern().rules[0].units['1']).to.be.true;
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
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
            expect($html.find('.js-ercal-weekdays').attr('style')).to.equal('display: none;');
        });
    });


    describe('choosing the ’two-weekly’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('two-weekly').trigger('change');
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
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('monthly-date').trigger('change');
        });
        
        it('should apply the repeat styling', () => {
            let $days = $html.find('.day.event-repeat');
            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
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
            eventCalendar.init('2018-01-02', '2018-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('monthly-day').trigger('change');
        });
        
        it('should apply the repeat styling', () => {
            let $days = $html.find('.day.event-repeat');
            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('daysOfWeek');
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
            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-02-06').hasClass('event-repeat')).to.be.true;
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

            let $target = $html.find('[data-day="2018-02-06"]'),
                $parent = $html.find('.calendar-day-2018-02-06');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            $html.find('.clndr-next-button').click();

            let $target = $html.find('[data-day="2018-02-06"]');

            $target.click();

            let dates = eventCalendar.getDates();
            expect(dates.datesToDel[0]._i).to.equal('2018-02-06');
        });
    });


    describe('choosing the ’annually’ pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2019-02-27', [{ date: '2018-01-10' }]);
            $html.find('.js-ercal-repeat').val('annually').trigger('change');
        });
        
        it('should apply the repeat styling', () => {
            let $days = $html.find('.day.event-repeat');
            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2018-01-02').hasClass('event-repeat')).to.be.true;
        });

        it('should store the recur pattern in the clndr instance', () => {
            expect(eventCalendar.getRecurPattern().rules[0].measure).to.equal('years');
            expect(eventCalendar.getRecurPattern().rules[0].units['1']).to.be.true;
        });

        it('should not apply the repeat styling to dates before the startDate', () => {
            expect($html.find('.calendar-day-2018-01-01').hasClass('event-repeat')).to.be.false;
        });

        it('should not remove the event class from preexisting events', () => {
            expect($html.find('.calendar-day-2018-01-10').hasClass('event')).to.be.true;
        });

        it('should also repaint the next year', () => {
            for (var i = 0; i < 12; i++) {
                $html.find('.clndr-next-button').click();
            }
            let $days = $html.find('.day.event-repeat');
            expect($days.length).to.equal(1);
            expect($html.find('.calendar-day-2019-01-02').hasClass('event-repeat')).to.be.true;
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
            for (var i = 0; i < 12; i++) {
                $html.find('.clndr-next-button').click();
            }

            let $target = $html.find('[data-day="2019-01-02"]'),
                $parent = $html.find('.calendar-day-2019-01-02');

            $target.click();

            expect($parent.hasClass('event-del')).to.be.true;
        });

        it('should add clicked dates to the list of dates to delete', () => {
            for (var i = 0; i < 12; i++) {
                $html.find('.clndr-next-button').click();
            }

            let $target = $html.find('[data-day="2019-01-02"]');

            $target.click();

            let dates = eventCalendar.getDates();
            expect(dates.datesToDel[0]._i).to.equal('2019-01-02');
        });
    });


    describe('applying a pattern, then making changes to dates affected by that pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2019-02-27');
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
            eventCalendar.init('2018-01-02', '2019-02-27');
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
            eventCalendar.init('2018-01-02', '2019-02-27', [{ date: '2018-01-10' }]);
            $html.find('[data-day="2018-01-04"]').click(); // to add
            $html.find('[data-day="2018-01-10"]').click(); // to del
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
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

    describe('making date changes, then applying a pattern, then removing the pattern', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2019-02-27', [{ date: '2018-01-10' }]);
            $html.find('[data-day="2018-01-04"]').click(); // to add
            $html.find('[data-day="2018-01-10"]').click(); // to del
            $html.find('.js-ercal-repeat').val('daily').trigger('change');
            $html.find('.js-ercal-repeat').val('no-repeat').trigger('change');
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
            eventCalendar.init('2018-01-02');
            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('.js-ercal-repeat').val('two-weekly').trigger('change');
        });

        it('should maintain the toDel styling on the target date', () => {
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-repeat')).to.be.false;
            expect($html.find('.calendar-day-2018-01-09').hasClass('event-del')).to.be.true;
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
    });

    describe('applying a pattern, excluding a date from that pattern, then changing to a pattern which doesn’t hit the same date, then clicking the target date again', () => {
        beforeEach(() => {
            eventCalendar.init('2018-01-02', '2019-02-27');
            $html.find('.js-ercal-repeat').val('weekly').trigger('change');
            $html.find('[data-day="2018-01-09"]').click(); // to del
            $html.find('.js-ercal-repeat').val('two-weekly').trigger('change');
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

});

