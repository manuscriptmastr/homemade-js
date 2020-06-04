import R from 'ramda';
const { curry, curryN, pipe, tap } = R;
import test from 'ava';
import { applyN, onceEvery, thru } from './index';

test('applyN(number, fn) positionally applies two arguments', t => {
  const append = curry((prefix, suffix) => `${prefix} ${suffix}`);
  t.deepEqual(applyN(2, append)([1, 'world'])([0, 'hello']), 'hello world');
});

test('applyN(number, fn) positionally applies three or more arguments', t => {
  const appendThree = curry((prefix, infix, suffix) => `${prefix} ${infix} ${suffix}`);
  t.deepEqual(applyN(3, appendThree)([1, 'there'])([0, 'hello'])([2, 'world']), 'hello there world');
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

test('thru(decorate, fetch) decorates fetch while allowing args to be passed into fetch', async t => {
  const fakeFetch = async (...args) => args;
  const call = K => K();
  t.deepEqual(
    await thru(call, fakeFetch)('123.com', { method: 'POST' }),
    ['123.com', { method: 'POST' }]
  );
});
