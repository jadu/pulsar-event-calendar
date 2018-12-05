'use strict';

import $ from 'jquery';
import EventCalendar from '../../src/EventCalendar';

var moment = require('moment');

describe('EventCalendar', () => {
    const clickEvent = $.Event('click');
    let $html;
    let $body;
    let eventCalendar;
    let eventCalendarWithoutHTML;

    beforeEach(() => {
        $html = $('<div></div>');
        $body = $('<body><div class="js-event-calendar"></div></body>').appendTo($html);

        eventCalendar = new EventCalendar($html);
    });

    afterEach(() => {
        $body.empty();
    });

    describe('init()', () => {
		it('should throw an error if $html isn’t passed to the component', () => {
			eventCalendarWithoutHTML = new EventCalendar(undefined);

			expect(() => {
                eventCalendarWithoutHTML.init();
            }).to.throw('$html must be passed to EventCalendar');
        });

        it('should throw an error if .js-event-calendar container isn’t present', () => {
            let $htmlWithoutContainer = $('<div></div>');

            let eventCalendarWithoutContainer = new EventCalendar($htmlWithoutContainer);
            
			expect(() => {
                eventCalendarWithoutContainer.init();
            }).to.throw('EventCalendar requires a .js-event-calendar element present in the DOM');
        });

        it('should default to the current date if no startDate is passed', () => {
            

            let today = moment(new Date());
            console.log(today);
            console.log(eventCalendar);

            expect(eventCalendar.options.startWithMonth.month).to.equal(today);
        });
    });

});

