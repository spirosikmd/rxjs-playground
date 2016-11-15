import {Observable} from 'rxjs/Rx';

interface Data {
  count: number;
}

const startButton = document.querySelector('#start');
const stopButton = document.querySelector('#stop');
const resetButton = document.querySelector('#reset');

const start$ = Observable.fromEvent(startButton, 'click');
const stop$ = Observable.fromEvent(stopButton, 'click');
const reset$ = Observable.fromEvent(resetButton, 'click');
const interval$ = Observable.interval(1000);

const data: Data = {count: 0};
const inc = (acc: Data): Data => ({count: acc.count + 1});
const reset = (acc: Data): Data => data;

const intervalThatStops$ = interval$
  .takeUntil(stop$);

const incOrReset$ = Observable.merge(
  intervalThatStops$.mapTo(inc),
  reset$.mapTo(reset)
);

start$
  .switchMapTo(incOrReset$)
  .startWith(data)
  .scan((acc, curr: (acc: Data) => Data) => curr(acc))
  .subscribe((x) => console.log(x));
