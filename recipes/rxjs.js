// Implements:
// Observable
// fromEvent
// .pipe method
// .subscribe returns individual .unsubscribe method
// pipe operators

const nothing = (...args) => {};
const maybe = (transform) => (value) => value === undefined ? value : transform(value);
const pipe = (...transforms) => (value) => transforms.reduce((prev, transform) => maybe(transform)(prev), value);

// Initialized per transform
const memoized = (operator) => {
  let prev;
  let curr;
  const withMemo = (newValue) => {
    prev = curr;
    curr = newValue;
    return newValue;
  };

  return (...values) => {
    if (values.length === 2) {
      const [ p, c ] = values;
      return withMemo(operator(p, c));
    } else if (values.length === 1) {
      const [ c ] = values;
      return withMemo(operator(c))
    } else {
      return withMemo(operator());
    }
  }
};

const memoizedPipe = (...transforms) => pipe(...transforms.map(memoized));

const map = (transform) => (value) => transform(value);
const reduce = (transform) => (prev, curr) => transform(prev, curr);
// BUGGY, fix
const accumulate = reduce((prev = 0, curr) => prev + curr);

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
  const pipe = (...transforms) => {
    const memoizedPipes = memoizedPipe(...transforms);
    const transformValue = (value) => memoizedPipes(value);
    const observer = subject(transformValue(getValue()));
    subscribe(value => observer.next(transformValue(value)));
    return observer;
  };

  return {
    getValue,
    getSubscribers,
    next,
    pipe,
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

const analytics = newClock.pipe(
  map(string => string.length),
  accumulate
);
const numbersToDate = analytics.subscribe(num => console.log(num));
