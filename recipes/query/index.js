import ramda from 'ramda';
const { curry, curryN, map, toPairs } = ramda;

const raise = (err) => { throw err };

/**
 * Transforms an object into a query
 * @typedef {Object} Transforms
 * @typedef {Object} QueryObject
 * 
 * @param {Transforms} transforms
 * @param {QueryObject} object
 * @returns {string}
 * @example
 *   const jqlQuery = query(
 *     {
 *       and: c((a, b) => `${a} AND ${b}`),
 *       eq: o((k, v) => `${k} = "${v}"`),
 *       gt: o((k, v) => `${k} > ${v}`)
 *     },
 *     { and: [{ eq: ['project', 'Apollo'] }, { gt: ['done', 'yesterday'] }] }
 *   );
 *   // => 'project = "Apollo" AND done > yesterday'
 */
const query = curry((transforms, object) => {
  const [[key, value]] = toPairs(object);
  const transform = transforms[key];
  const type = transform._type;

  return type === 'operator' ?
      transform(...value)
  : type === 'modifier' ?
      transform(value)
  : type === 'composer' ?
      transform(map(query(transforms), value))
  :   value;
});

/**
 * Creates an operator
 * @typedef {function(string, string | number): string} Operator
 * 
 * @param {Operator} fn
 * @returns {Operator}
 * @example
 *   const set = o((key, value) => `${key} is ${value}`);
 *   set('mood', 'good');
 *   // => 'mood is good'
 */
export const o = (fn) => {
  const withValidation = (k, v) =>
    typeof k === 'string' && (typeof v === 'string' || typeof v === 'number')
      ? fn(k, v)
      : raise(new Error('An operator requires two arguments'));
  const func = curryN(2, withValidation);
  func._type = 'operator';
  return func;
};

/**
 * Creates a modifier
 * @typedef {function(string): string} Modifier
 * 
 * @param {Modifier} fn
 * @returns {Modifier}
 * @example
 *   const negate = m((string) => `not ${string}`);
 *   negate('bad');
 *   // => 'not bad'
 */
export const m = (fn) => {
  const withValidation = (v) =>
    typeof v === 'string'
      ? fn(v)
      : raise(new Error('A modifier requires a single string argument'));
  const func = curryN(1, withValidation);
  func._type = 'modifier';
  return func;
};

/**
 * Creates a composer
 * @typedef {function(string[]): string} Composer
 * 
 * @param {Composer} fn
 * @returns {Composer}
 * @example
 *   const commaSeparated = m(strings => strings.join(', '));
 *   commaSeparated(['bread', 'milk', 'blackberries']);
 *   // => 'bread, milk, blackberries'
 */
export const c = (fn) => {
  const withValidation = (qs) =>
    qs.length >= 2
      ? fn(qs)
      : raise(new Error('A composer requires an array of at least two strings'));
  const func = curryN(1, withValidation);
  func._type = 'composer';
  return func;
};

export default query;