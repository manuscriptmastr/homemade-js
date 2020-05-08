import test from 'ava';
import { thru } from './index';

test('thru(decorate, fetch) decorates fetch while allowing args to be passed into fetch', async t => {
  const fakeFetch = async (...args) => args;
  const call = K => K();
  t.deepEqual(
    await thru(call, fakeFetch)('123.com', { method: 'POST' }),
    ['123.com', { method: 'POST' }]
  );
});
