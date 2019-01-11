# Event Calendar

## Dependencies

[jQuery](http://jquery.com/download/), [CLNDR](https://github.com/kylestetz/CLNDR) and [Moment.js](http://momentjs.com/) are required, the default calendar template provided by the component uses [Underscore.js](http://underscorejs.org/) but other templating options are available (see CLNDR documentation).

## Installation

Install via NPM.

```
npm install pulsar-event-calendar --save
```

### Tests

Run the test suite to check expected functionality.

```
npm test
```

Generate a code coverage report, which can be viewed by opening `/coverage/lcov-report/index.html`

```
npm run coverage
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

### Start date as an init() option (optional)

The initial date which will be selected within the calendar can be passed as an initialisation option.

```javascript
$(function () {
    const clndr = new EventCalendar($('html'));

    clndr.init({
        startDate: '2019-07-04'
    });
});
```

If no start date is supplied, or the value is `null`, the calendar will default to `today`.

```javascript
$(function () {
    const clndr = new EventCalendar($('html'));

    clndr.init();
});
```

### Start date field

You can allow the user to choose and change the start date by providing a date field within the user interface. Change events will be bound to this field.

```html
<div class="form__group">
    <label for="ercal-start" class="control__label">Event date</label>
    <div class="controls">
        <input type="date" id="ercal-start" class="js-ercal-start" />
    </div>
</div>
```

```javascript
$(function () {
    const clndr = new EventCalendar($('html'));

    clndr.init({
        startDateField: '.js-ercal-start'
    });
});
```

The following behaviour will be observed:

* If `startDateField` has a value, this will be used as the start date
* If `startDateField` does not have a value, and `startDate` is provided, this will populate the value for `startDateField`
* If `startDateField` has no value, and `startDate` is not provided, the calendar will default to `today`

When you choose a start date, the end date field (if supplied) will be constrained to prevent the user from choosing an end date that occurs before the start date.

## Selected events

To automatically populate a list of already selected events you can pass an array of dates formatted as `YYYY-MM-DD`.

```javascript
$(function () {
    let myEvents = [
        { date: '2019-07-25' },
        { date: '2019-07-26' },
        { date: '2019-08-01' }
    ];

    const clndr = new EventCalendar($('html'));

    clndr.init({
        events: myEvents
    });
});
```

## End Date as an init() option (optional)

The Event Calendar can be constrained to not allow the user to navigate past a certain date. This defaults to `today + 15 years`.

Pass a Moment compatible date (like `YYYY-MM-DD`) as the `endDate` option.

```javascript
$(function () {
    const clndr = new EventCalendar($('html'));

    clndr.init({
        startDate: '2019-07-04',
        endDate: '2020-12-31'
    });
});
```

### End repeat on date field

You can allow the user to choose and change the end date by providing a date field within the user interface. Change events will be bound to this field.

This field should be hidden on page load, and will be shown if the user chooses a repeat pattern.

```html
<div class="form__group" style="display: none;">
    <label for="ercal-end" class="control__label">End repeat on</label>
    <div class="controls">
        <input type="date" id="ercal-end" class="js-ercal-end" disabled />
    </div>
</div>
```

```javascript
$(function () {
    const clndr = new EventCalendar($('html'));

    clndr.init({
        endDateField: '.js-ercal-start'
    });
});
```

The following behaviour will be observed:

* If the `endDateField` has a value, this will be used as the end date
* If the `endDateField` does not have a value, and `endDate` is provided, this will populate the value for `endDateField`
* If the `endDateField` has no value, and `endDate` is not provided, the calendar will default to `startDate + 15 years`

When you choose an end date, the start date field (if supplied) will be constrained to prevent the user from choosing a start date that occurs after the end date.

# Repeat pattern

An event can be set to reoccur on specific dates based on a repeat pattern, these patterns will be based on the `startDate` if defined (or the current day if it isn't).

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

## Daily

Will create a recur pattern covering all dates between the `startDate` and the `endDate`.

![daily](https://user-images.githubusercontent.com/18653/50346323-ef69d800-0529-11e9-946c-b7d7897ce591.gif)

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

## Weekly

Will create a pattern covering all dates occurring on the same weekday as the startDate. It will also show the weekday picker allowing the user to add additional weekdays.

![weekdays](https://user-images.githubusercontent.com/18653/50346543-99e1fb00-052a-11e9-8bb0-a9111b56031c.gif)

## Every two weeks

Will create a pattern covering all dates occurring on the same day of the week in two-weekly intervals.

![two-weekly](https://user-images.githubusercontent.com/18653/50346661-eb8a8580-052a-11e9-90e5-51dc7dd2a1d6.gif)

## Monthly, on this day of the month

Will create a pattern covering all dates occurring on the same day of the month (e.g. the first Thursday).

![monthly-day](https://user-images.githubusercontent.com/18653/50346717-1ffe4180-052b-11e9-944e-d420222c692a.gif)

## Montly, on this date

Will create a pattern covering all dates occurring on the same date of the month (e.g. The 10th of the month).

![monthly-date](https://user-images.githubusercontent.com/18653/50346781-605dbf80-052b-11e9-86b1-703e8dbab36f.gif)

## Every year

Will create a pattern covering all dates occurring on the same date each year.

![annually](https://user-images.githubusercontent.com/18653/50346848-8edb9a80-052b-11e9-83e5-ac9ef1339eee.gif)

# Weekday choice

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

## Saving the data

As the user interacts with the calendar they will either add new dates to the list of upcoming occurences, or dates that should be removed from the list of upcoming occurences.

The following data structures hold the date information which will need to be saved.

### Recur pattern

`clndr.recurPattern`

The recur pattern  defines which dates should be added, because the pattern can potentially select thousands of dates we don't store a list of dates this pattern will hit for performance reasons. Those can be calculated by applying the recur pattern to the `startDate`.

The [getRecurPattern()](https://github.com/jadu/pulsar-event-calendar/blob/initial-build/src/EventCalendar.js#L623) getter will return the current recur pattern object.

### Dates to add

`clndr.options.extras.datesToAdd`

An array of Moment objects referencing specific dates which the event should recur on, these are based on user-choice rather than the recur pattern.

The [getDates()](https://github.com/jadu/pulsar-event-calendar/blob/initial-build/src/EventCalendar.js#L615) getter will return both the `datesToAdd` and `datesToDel` arrays.

### Dates to delete

`clndr.options.extras.datesToDel`

An array of Moment objects referencing dates which already exist in the calendar (defined by the Selected Events) but which the user would like to remove from the list of selected events.

The [getDates()](https://github.com/jadu/pulsar-event-calendar/blob/initial-build/src/EventCalendar.js#L615) getter will return both the `datesToAdd` and `datesToDel` arrays.
