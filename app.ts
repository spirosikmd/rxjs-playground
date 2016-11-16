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

const data: Data = {count: 0};
const inc = (acc: Data): Data => ({count: acc.count + 1});
const reset = (acc: Data): Data => data;

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

timer$
  .takeWhile((data: {count: number}) => data.count <= 3)
  .withLatestFrom(
    input$,
    (timer, input) => ({count: timer.count, text: input})
  )
  .do(x => console.log(x))
  .filter((data: {count: number, text: string}) => data.count === parseInt(data.text))
  .reduce((acc, curr) => acc + 1, 0)
  .repeat()
  .subscribe(
    x => console.log(`Score: ${x}`),
    err => console.log(err),
    () => console.log('complete')
  );
