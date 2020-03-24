import ramda from 'ramda';
import Joi from '@hapi/joi';
const { curry, map, toPairs, useWith } = ramda;

const type = (string, fn) => {
  fn._type = string;
  return fn;
};

const validate = curry((schema, arg) => Joi.attempt(arg, schema));

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
export const o = fn => type('operator', useWith(fn, [
  validate(Joi.string().required()),
  validate(Joi.alternatives(Joi.string(), Joi.number()).required())
]));

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
export const m = fn => type('modifier', useWith(fn, [
  validate(Joi.string().required())
]));

/**
 * Creates a composer
 * @typedef {function(string[]): string} Composer
 * 
 * @param {Composer} fn
 * @returns {Composer}
 * @example
 *   const commaSeparated = c(strings => strings.join(', '));
 *   commaSeparated(['bread', 'milk', 'blackberries']);
 *   // => 'bread, milk, blackberries'
 */
export const c = fn => type('composer', useWith(fn, [
  validate(Joi.array().min(2).items(Joi.string()).required())
]));

export default useWith(query, [
  validate(Joi.object().min(1).required()),
  validate(Joi.object().min(1).required())
]);
