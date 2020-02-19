import test from 'ava';
import { createHandler } from './index.js';

const GET_USERS = async () => [
  { name: 'Joshua' },
  { name: 'Jonathan' }
];

const GET_USERS_SYNC = () => [
  { name: 'Joshua' },
  { name: 'Jonathan' }
];

test('createHandler(handleObj) returns handleObj as is', t => {
  t.deepEqual(createHandler({ handle: GET_USERS }), { handle: GET_USERS });
});

test('createHandler(handleFn) returns object with { handle: handleFn }', t => {
  t.deepEqual(createHandler(GET_USERS), { handle: GET_USERS });
});

test('createHandler(handleObjOrFn) promisifies synchronous handle', t => {
  const userHandler = createHandler(GET_USERS_SYNC);
  t.deepEqual(userHandler.handle() instanceof Promise, true);
});

test('createHandler(handleObjOrFn) promisifies all methods', t => {
  const userHandler = createHandler({ handle: GET_USERS_SYNC, json: JSON.stringify });
  t.deepEqual(userHandler.json() instanceof Promise, true);
});
