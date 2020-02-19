import ramda from 'ramda';
const {
  is,
  map,
  pipe,
  when,
} = ramda;

const promisify = fn => async (...args) => fn(...args);

// createHandler(handleFnOrObj) returns a handler object
// { handle: function, ...preparsers: function, hash: boolean }
export const createHandler = pipe(
  when(is(Function), h => ({ handle: h })),
  map(when(is(Function), promisify))
);