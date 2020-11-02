import R from 'ramda';
const { curry, curryN, pipe, tap } = R;
import test from 'ava';
import { applyN, chainRec, previous, onceEvery, onceUnless, thru } from './index';

test('applyN(number, fn) positionally applies two arguments', t => {
  const append = curry((prefix, suffix) => `${prefix} ${suffix}`);
  t.deepEqual(applyN(2, append)([1, 'world'])([0, 'hello']), 'hello world');
});

test('applyN(number, fn) positionally applies three or more arguments', t => {
  const appendThree = curry((prefix, infix, suffix) => `${prefix} ${infix} ${suffix}`);
  t.deepEqual(applyN(3, appendThree)([1, 'there'])([0, 'hello'])([2, 'world']), 'hello there world');
});

test('chainRec(fn) runs only once when fn calls done', t => {
  let timesCalled = 0;
  t.deepEqual(
    chainRec((next, done, value) => {
      timesCalled += 1;
      return done(value.concat([1]));
    }, []),
    [1]
  );
  t.deepEqual(timesCalled, 1);
});

test('chainRec(fn) runs as long as fn calls next', t => {
  let timesCalled = 0;
  t.deepEqual(
    chainRec((next, done, value) => {
      timesCalled += 1;
      return value.length === 3
        ? done(value)
        : next(value.concat([value.length + 1]));
    }, []),
    [1, 2, 3]
  );
  t.deepEqual(timesCalled, 4);
});

test('chainRec(fn) works with pagination', t => {
  let timesCalled = 0;
  const pages = [
    { cursor: 1, data: [1] },
    { cursor: 2, data: [2] },
    { cursor: null, data: [3] }
  ];
  const getPage = num => pages[num];

  t.deepEqual(
    chainRec((next, done, { data, cursor }) => {
      timesCalled += 1;
      return cursor === null
        ? done(data)
        : next({ ...getPage(cursor), data: data.concat(getPage(cursor).data) });
    }, { data: [], cursor: 0 }),
    [1, 2, 3]
  );
  t.deepEqual(timesCalled, 4);
});

test('previous(fn, initial) passes initial as first previous value', t => {
  const add = (a, b) => a + b;
  t.deepEqual(previous(add, 0)(1), 1);
});

test('previous(fn, initial) passes previous value along', t => {
  const add = (a, b) => a + b;
  const addToLast = previous(add, 0);
  t.deepEqual(addToLast(1), 1);
  t.deepEqual(addToLast(2), 3);
  t.deepEqual(addToLast(3), 6);
});

test('onceEvery(ms, fn) returns result of fn', t => {
  const add = (a, b) => a + b;
  t.deepEqual(onceEvery(1000, add)(1, 2), 3);
});

test('onceEvery(ms, fn) returns old result when fn is called before ms elapsed', t => {
  let times = 0;
  const add = pipe((...args) => args, tap(() => times += 1), ([a, b]) => a + b);
  const lazyAdd = onceEvery(1000, add);
  t.deepEqual(lazyAdd(1, 2), 3);
  t.deepEqual(lazyAdd(1, 3), 3);
  t.deepEqual(times, 1);
});

test('onceEvery(ms, fn) returns new result when fn is called after ms elapsed', async t => {
  let times = 0;
  const wait = ms => new Promise(res => setTimeout(res, ms));
  const add = curryN(2, pipe((...args) => args, tap(() => times += 1), ([a, b]) => a + b));
  const lazyAdd = onceEvery(500, add);
  t.deepEqual(lazyAdd(1, 2), 3);
  await wait(1000);
  t.deepEqual(lazyAdd(1, 3), 4);
  t.deepEqual(times, 2);
});

test('onceUnless(pred, fn) returns result of fn', t => {
  const add = (a, b) => a + b;
  const shouldRefresh = () => false;
  t.deepEqual(onceUnless(shouldRefresh, add)(1, 2), 3);
});

test('onceUnless(pred, fn) returns last result of fn if predicate returns false', t => {
  let times = 0;
  const add = curryN(2, pipe((...args) => args, tap(() => times += 1), ([a, b]) => a + b));
  const shouldRefresh = () => false;
  const lazyAdd = onceUnless(shouldRefresh, add);
  t.deepEqual(lazyAdd(1, 2), 3);
  t.deepEqual(lazyAdd(1, 3), 3);
  t.deepEqual(times, 1);
});

test('onceUnless(pred, fn) returns new result of fn if predicate returns true', t => {
  let times = 0;
  let refresh = false;
  const add = curryN(2, pipe((...args) => args, tap(() => times += 1), ([a, b]) => a + b));
  const shouldRefresh = () => refresh;
  const lazyAdd = onceUnless(shouldRefresh, add);
  t.deepEqual(lazyAdd(1, 2), 3);
  t.deepEqual(lazyAdd(1, 3), 3);
  refresh = true;
  t.deepEqual(lazyAdd(1, 4), 5);
  t.deepEqual(times, 2);
});

test('onceUnless(pred, fn) passes fn arguments to predicate', t => {
  let times = 0;
  const add = curryN(2, pipe((...args) => args, tap(() => times += 1), ([a, b]) => a + b));
  const addsUpToThree = curry((one, two) => one + two === 3);
  const lazyAdd = onceUnless(addsUpToThree, add);
  t.deepEqual(lazyAdd(1, 1), 2);
  t.deepEqual(lazyAdd(1, 3), 2);
  t.deepEqual(lazyAdd(1, 2), 3);
});

test('thru(decorate, fetch) decorates fetch while allowing args to be passed into fetch', async t => {
  const fakeFetch = async (...args) => args;
  const call = K => K();
  t.deepEqual(
    await thru(call, fakeFetch)('123.com', { method: 'POST' }),
    ['123.com', { method: 'POST' }]
  );
});
