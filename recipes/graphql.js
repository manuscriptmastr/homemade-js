import assert from 'assert';
import fromEntries from 'object.fromentries';

// Challenge: given a smorgasbord of resolvers, return the resolved resolvers in the same structure
// TODO:
// 1. Add (parent, ctx) args
// 2. Allow async

const isFunc = (t) => typeof t === 'function';
const isArr = (t) => Array.isArray(t);
const isObj = (t) => typeof t === 'object' && t !== null;

const traverseFunc = (r, next) => next(r());
const traverseArr = (r, next) => r.map(next);
const traverseObj = (r, next) => fromEntries(Object.entries(r).map(([ k, v ]) => [ k, next(v) ]));

export const resolveGraph = (graph) =>
  isFunc(graph) ?
    traverseFunc(graph, resolveGraph)
: isArr(graph) ?
    traverseArr(graph, resolveGraph)
: isObj(graph) ?
    traverseObj(graph, resolveGraph)
: graph;

assert.deepStrictEqual(
  resolveGraph({ name: { firstName: 'Joshua' } }),
  { name: { firstName: 'Joshua' } }
);
assert.deepStrictEqual(
  resolveGraph({ firstName: () => 'Joshua' }),
  { firstName: 'Joshua' }
);
assert.deepStrictEqual(
  resolveGraph([ 'Joshua' ]),
  [ 'Joshua' ]
);
assert.deepStrictEqual(
  resolveGraph([ [ 'Joshua' ] ]),
  [ [ 'Joshua'] ]
);
assert.deepStrictEqual(resolveGraph('1'), '1');
assert.deepStrictEqual(resolveGraph(() => 'hello'), 'hello');
assert.deepStrictEqual(resolveGraph(() => [ '1', '2', '3' ]), [ '1', '2', '3' ]);
assert.deepStrictEqual(resolveGraph(() => 'Joshua'), 'Joshua');
assert.deepStrictEqual(
  resolveGraph([
    () => '1',
    () => '2',
    '3'
  ]),
  [
    '1',
    '2',
    '3'
  ]
);
assert.deepStrictEqual(
  resolveGraph({
    user: () => ({
      firstName: 'Joshua',
      lastName: 'Martin'
    })
  }),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin'
    }
  }
);
assert.deepStrictEqual(
  resolveGraph(() => ({
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      mother: () => ({
        firstName: 'Sharon',
        lastName: 'Martin'
      })
    }
  })),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      mother: {
        firstName: 'Sharon',
        lastName: 'Martin'
      }
    }
  }
);
assert.deepStrictEqual(
  resolveGraph({
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      parents: () => [
        'Sharon',
        'Neal'
      ]
    }
  }),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      parents: [
        'Sharon',
        'Neal'
      ]
    }
  }
);
assert.deepStrictEqual(
  resolveGraph(() => ({
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      parents: () => ([
        'Sharon',
        'Neal'
      ])
    }
  })),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      parents: [
        'Sharon',
        'Neal'
      ]
    }
  }
);
assert.deepStrictEqual(
  resolveGraph({
    user: () => ({
      firstName: 'Joshua',
      lastName: 'Martin',
      devices: () => [
        () => 'iPad',
        'iPhone',
        'MacBook'
      ]
    })
  }),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      devices: [
        'iPad',
        'iPhone',
        'MacBook'
      ]
    }
  }
);
assert.deepStrictEqual(
  resolveGraph({
    user: () => ({
      firstName: 'Joshua',
      lastName: 'Martin',
      bags: () => [
        () => [ () => () => 'apples', 'oranges' ],
        [ 'milk', 'juice' ]
      ],
      devices: () => [
        'iPad',
        'iPhone',
        'MacBook'
      ]
    })
  }),
  {
    user: {
      firstName: 'Joshua',
      lastName: 'Martin',
      bags: [
        [ 'apples', 'oranges' ],
        [ 'milk', 'juice' ]
      ],
      devices: [
        'iPad',
        'iPhone',
        'MacBook'
      ]
    }
  }
);