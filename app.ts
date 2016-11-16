import {Observable} from 'rxjs/Rx';

interface Data {
  count: number;
}

const startButton = document.querySelector('#start');
const halfButton = document.querySelector('#half');
const quarterButton = document.querySelector('#quarter');

const stopButton = document.querySelector('#stop');
const resetButton = document.querySelector('#reset');

const start$ = Observable.fromEvent(startButton, 'click');
const half$ = Observable.fromEvent(halfButton, 'click');
const quarter$ = Observable.fromEvent(quarterButton, 'click');

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

const starters$ = Observable.merge(
  start$.mapTo(1000),
  half$.mapTo(500),
  quarter$.mapTo(250)
);

const intervalActions = (time: number) => Observable.merge(
  Observable.interval(time)
    .takeUntil(stop$)
    .mapTo(inc),
  reset$.mapTo(reset)
);

const timer$ = starters$
  .switchMap(intervalActions)
  .startWith(data)
  .scan((acc, curr: (acc: Data) => Data) => curr(acc));

interface InputEvent {
  target: HTMLInputElement;
}

const input = document.querySelector('#input');
const input$ = Observable.fromEvent(input, 'input')
  .map((event: InputEvent) => event.target.value);

Observable.combineLatest(
  timer$,
  input$,
  (timer, input) => ({count: timer.count, text: input})
  )
  .takeWhile((data: {count: number}) => data.count <= 3)
  .filter((data: {count: number, text: string}) => data.count === parseInt(data.text))
  .subscribe(
    x => console.log(x),
    err => console.log(err),
    () => console.log('complete')
  );
