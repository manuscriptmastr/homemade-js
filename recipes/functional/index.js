import R from 'ramda';
const { adjust, curry } = R;

// const safeFetch = thru(retry(3), fetch);
// safeFetch('123.com', { method: 'GET' });
// => Response
export const thru = curry((decorate, fn) => (...args) => decorate(() => fn(...args)));

// const appendThree = curry((prefix, infix, suffix) => `${prefix} ${infix} ${suffix}`);
// const apThree = applyN(3, appendThree);
// apThree([0, 'hello'])([2, 'world'])([1, 'there']);
// => 'hello there world'
export const applyN = (num, fn) => {
  const arrayOf = (val, num) => new Array(num).fill(val);
  const isFilled = arr => arr.every(item => item !== null);
  const run = ([pos, arg], args) => {
    const newArgs = adjust(pos, () => arg, args);
    return isFilled(newArgs)
      ? fn(...newArgs)
      : ([pos, arg]) => run([pos, arg], newArgs);
  };
  return ([pos, arg]) => run([pos, arg], arrayOf(null, num));
};
