import R from 'ramda';
const { curry } = R;
import test from 'ava';
import { applyN, thru } from './index';

test('applyN(number, fn) positionally applies two arguments', t => {
  const append = curry((prefix, suffix) => `${prefix} ${suffix}`);
  t.deepEqual(applyN(2, append)([1, 'world'])([0, 'hello']), 'hello world');
});

test('applyN(number, fn) positionally applies three or more arguments', t => {
  const appendThree = curry((prefix, infix, suffix) => `${prefix} ${infix} ${suffix}`);
  t.deepEqual(applyN(3, appendThree)([1, 'there'])([0, 'hello'])([2, 'world']), 'hello there world');
});

test('thru(decorate, fetch) decorates fetch while allowing args to be passed into fetch', async t => {
  const fakeFetch = async (...args) => args;
  const call = K => K();
  t.deepEqual(
    await thru(call, fakeFetch)('123.com', { method: 'POST' }),
    ['123.com', { method: 'POST' }]
  );
});
