# Event Calendar

## Dependencies

[jQuery](http://jquery.com/download/), [CLNDR](https://github.com/kylestetz/CLNDR) and [Moment.js](http://momentjs.com/) are required, the default calendar template provided by the component uses [Underscore.js](http://underscorejs.org/) but other templating options are available (see CLNDR documentation).

## Installation

Install via NPM.

```
npm install pulsar-event-calendar --save
```

### HTML

The Event Calendar requires an element with the `.js-event-calendar` class to be present in the DOM.

```html
<div class="js-event-calendar"></div>
```

### JavaScript

You will need to initialise the Event Calendar from a file within your Browserify bundle.

```javascript
const $ = require('jquery');
const EventCalendar = require('./src/EventCalendar');

$(function () {
    const clndr = new EventCalendar($('html'));
    clndr.init();
});
```

### Styles

Include the Event Calendar styles into your existing Sass bundle.

```scss
@import '/path/to/pulsar-event-calendar/src/scss/event-calendar.scss
```

## Usage

### Start date

The initial date which will be selected within the calendar can be passed as an initialisation option.

```javascript
$(function () {
    let startDate = '2019-07-04';

    const clndr = new EventCalendar($('html'));
    clndr.init(startDate);
});
```

Usually you would want to let the user choose a start date from a date field withn the user interface, you can bind a change event to this field.

## Selected events

To automatically populate a list of already selected events you can pass an array of dates formatted as `YYYY-MM-DD`.

```javascript
$(function () {
    let events = [
        { date: '2019-07-25' },
        { date: '2019-07-26' },
        { date: '2019-08-01' }
    ];

    const clndr = new EventCalendar($('html'));
    clndr.init(null, null, events);
});
```

## End Date

The Event Calendar can be constrained to not allow the user to navigate past a certain date. This defaults to `today + 15 years`.

Pass a Moment compatible date (like `YYYY-MM-DD`) as the second option to the `init()` method.

```javascript
$(function () {
    let startDate = '2019-07-04',
        endDate = '2020-12-31';

    const clndr = new EventCalendar($('html'));
    clndr.init(startDate, endDate);
});
```

# Repeat pattern

| Option | Value |
| ------ | ----- |
| No repeat | `no-repeat` |
| Daily | `daily` |
| Weekly | `weekly` |
| Every two weeks | `two-weekly` |
| Monthly, on this day of the month | `monthly-day` |
| Monthly, on this date | `monthly-date` |
| Every year | `annually` |

Event Calendar will look for a select field with the `js-ercal-repeat` class and update the calendar when the value of this field changes.

```html
<label for="repeat">Repeat</legend>

<select id="repeat" class="js-ercal-repeat">
    <option value="no-repeat">No repeat</option>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="two-weekly">Every two weeks</option>
    <option value="monthly-day">Monthly, on this day of the month</option>
    <option value="monthly-date">Monthly, on this date</option>
    <option value="annually">Every year</option>
</select>
```

## Weekday choice

The `weekly` option can allow the user to choose which days of the week the event should occur. Event Calendar will look for a `.js-ercal-weekdays` element containing checkboxes for each weekday, which require the `name="ercal-weekdays"` attribute. 

This set of fields will be hidden until the `weekday` option is chosen.

```html
<fieldset class="js-ercal-weekdays" style="display: none;">
    <legend>Repeat on</legend>

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
```