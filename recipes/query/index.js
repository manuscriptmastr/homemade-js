import ramda from 'ramda';
const { curry, curryN, map, toPairs } = ramda;

const raise = (err) => { throw err };

const query = curry((operations, object) => {
  const [[key, value]] = toPairs(object);
  const operation = operations[key];
  const type = operation._type;

  return type === 'operator' ?
      operation(...value)
  : type === 'modifier' ?
      operation(value)
  : type === 'composer' ?
      operation(map(query(operations), value))
  :   value;
});

// operator: (k, v) => string
export const o = (fn) => {
  const func = curryN(2, fn);
  func._type = 'operator';
  return func;
};

// modifier: (q) => string
export const m = (fn) => {
  const func = curryN(1, fn);
  func._type = 'modifier';
  return func;
};

// composer: (qs) => string
export const c = (fn) => {
  const reducedFn = (qs) =>
    qs.length < 2
      ? raise(new Error('Need minimum of two strings'))
      : qs.reduce(fn);
  const func = curryN(1, reducedFn);
  func._type = 'composer';
  return func;
};

export default query;