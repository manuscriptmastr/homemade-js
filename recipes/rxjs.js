// Implements:
// Observable
// fromEvent
// .pipe method
// .subscribe returns individual .unsubscribe method
// pipe operators

const nothing = (...args) => {};
const maybe = (transform) => (value) => value === undefined ? value : transform(value);
const pipe = (...transforms) => (value) => transforms.reduce((prev, transform) => maybe(transform)(prev), value);

const withHistory = (scan) => (operator) => {
  const history = [];

  return (value) => {
    const artifact = scan(history);
    history.push(value);
    const passThrough = operator(artifact, value);
    return passThrough;
  };
};

const analyze = withHistory(archives => archives[archives.length - 1]);

const map = (transform) => (value) => transform(value);
const tap = (transform) => (value) => (transform(value), value);
const growth = (prev = 0, curr) => curr - prev;
const accumulate = (transform) => withHistory(archives => archives)(values => values.reduce(transform, 0));

const uid = () => {
  let id = 0;
  return () => {
    id++;
    return id;
  };
};

const suid = (() => {
  generateId = uid();
  return () => `s${generateId()}`;
})();

const subject = (initial) => {
  let __curr__ = initial;
  let __subs__ = [];
  const getValue = () => __curr__;
  const getSubscribers = () => __subs__.map(([ __, subscriber ]) => subscriber);
  const next = (value) => {
    __curr__ = value;
    __subs__.forEach(([ __, subscriber ]) => subscriber(__curr__));
  };
  const subscribe = (subscriber) => {
    const identifier = suid();
    __subs__ = [ ...__subs__, [ identifier, subscriber ] ];
    return {
      unsubscribe: () => {
        __subs__ = __subs__.filter(([ id ]) => identifier !== id);
      }
    };
  };
  const unsubscribe = () => {
    __subs__ = [];
  };
  const _pipe = (...transforms) => {
    const transformValue = (value) => pipe(...transforms)(value);
    const observer = subject(transformValue(getValue()));
    subscribe(value => observer.next(transformValue(value)));
    return observer;
  };

  return {
    getValue,
    getSubscribers,
    next,
    pipe: _pipe,
    subscribe,
    unsubscribe,
  };
};

const fromEvent = (element, event) => {
  const { next, unsubscribe, ...rest } = subject();
  element.addEventListener(event, next);
  const _unsubscribe = () => {
    element.removeEventListener(event, next);
    unsubscribe();
  };

  return {
    next,
    unsubscribe: _unsubscribe,
    ...rest
  };
};

const clock = fromEvent(document.querySelector('#main-view > div.apps.show-apps > div.center > div.app-container.clock'), 'click');
const alarm = clock.subscribe(() => console.log('Wake up!'));
const hello = clock.subscribe(() => console.log('Hello!'));

const newClock = clock.pipe((e) => e.target.className);
const className = newClock.subscribe(i => console.log(i));

const numbers = subject();
const analytics = numbers.pipe(
  map(num => num * 2),
  map(num => num / 2),
  analyze(growth),
  accumulate((prev, curr) => prev + curr),
  tap((num) => console.log(`Overall growth is: ${num}`))
);
const numbersToDate = analytics.subscribe(num => console.log(num));
