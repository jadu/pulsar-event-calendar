'use strict';

import $ from 'jquery';
import EventCalendar from '../../src/EventCalendar';

describe('EventCalendar', () => {
    const clickEvent = $.Event('click');
    let $html;
    let $body;
    let $container;
    let eventCalendar;
    let eventCalendarWithoutHTML;

    beforeEach(() => {
        $html = $('<div></div>');
        $body = $('<body></body>').appendTo($html);

        $container = $('<div id="qa-container"></div>').appendTo($body);

        eventCalendar = new EventCalendar($html);
    });

    afterEach(() => {
        $body.empty();
    });

    describe('init()', () => {
		it('should throw an error if $html isn’t passed to the component', () => {
			eventCalendarWithoutHTML = new EventCalendar(undefined);

			expect(() => {
                eventCalendarWithoutHTML.init($body);
            }).to.throw('$html must be passed to EventCalendar');
        });
    });

});

