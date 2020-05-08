import R from 'ramda';
const { curry } = R;

export const thru = curry((decorate, fn) => (...args) => decorate(() => fn(...args)));
