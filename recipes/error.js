import ramda from 'ramda';
const {
  both,
  curryN,
  eqProps,
  ifElse,
  is,
  propEq
} = ramda;

export const isClass = both(is(Function), (Err) => /^class\s/.test(Function.prototype.toString.call(Err)));
export const instanceOf = curryN(2, ifElse(isClass, eqProps('name'), propEq('name')));
export const raise = (error) => { throw error; };
export const rescue = (Err, swallow) => ifElse(instanceOf(Err), swallow, raise);