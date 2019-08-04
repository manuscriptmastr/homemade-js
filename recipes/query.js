import assert from 'assert';
import fromEntries from 'object.fromentries';
const e = assert.deepStrictEqual.bind(assert);

// query uses a declarative syntax to map json-like data to only the data you are interested in

const mapValues = (object, transform) =>
  fromEntries(Object.entries(object)
    .map(([key, value]) => [key, transform(value)]));

e(
  mapValues({ a: 1, b: 2, c: 3 }, num => num * 2),
  { a: 2, b: 4, c: 6 }
);

const get = (key) => (data) =>
  typeof data === 'object' && data !== null && data.hasOwnProperty(key)
    ? data[key]
    : null;

const toGetter = (extract) =>
  typeof extract === 'string'
    ? get(extract)
    : extract;

const toResolver = (valueOrFunc) =>
  typeof valueOrFunc === 'function'
    ? valueOrFunc
    : () => valueOrFunc;

export const g = (extract, children) => (data, root) => {
  const newData = toGetter(extract)(data, root);
  return (newData === undefined || newData === null) ?
      null
  : children === undefined ?
      newData
  : Array.isArray(children) ?
      newData.map(d => g(d => d, children[0])(d, root))
  :
      mapValues(children, child => toResolver(child)(newData, root));
  };

const query = (resolvers) => (data) => g(data => data, resolvers)(data, data);
export default query;

// with key different from payload key
e(
  query(
    { handle: g('username') }
  )({ username: 'manuscriptmaster' }),
  { handle: 'manuscriptmaster' }
);

// with children resolvers
e(
  query(
    { project: g('board', { identifier: g('id') }) }
  )({ board: { id: 123 } }),
  { project: { identifier: 123 } }
);

// with deeply-nested resolvers
e(
  query(
    { project: g('board', { author: g('user', { identifier: g('id') }) }) }
  )({ board: { user: { id: 123 } } }),
  { project: { author: { identifier: 123 } } }
);

// with array
e(
  query(
    { stories: g('issues', [{ identifier: g('id') }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123 }, { identifier: 456 }] }
);

// with hardcoded property
e(
  query(
    { stories: g('issues', [{ identifier: g('id'), hardcoded: 'hello' }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
);

// with plain function
e(
  query(
    { stories: p => p.issues }
  )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
  { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
);

// with top-level array
e(
  query(
    [{ identifier: g('id') }]
  )([{ id: 123 }, { id: 456 }]),
  [{ identifier: 123 }, { identifier: 456 }]
);

// with root parameter
e(
  query({
    project: g('project', {
      issues: g('issues', [{
        id: g('id'),
        board: g((issue, root) => root.boards.find(board => board.id === issue.boardId), {
          id: g('id')
        })
      }])
    })
  })({
    project: {
      id: 123,
      issues: [
        { id: 456, boardId: 654 },
        { id: 789, boardId: 987 }
      ]
    },
    boards: [
      { id: 654 },
      { id: 987 }
    ]
  }),
  {
    project: {
      issues: [
        { id: 456, board: { id: 654 } },
        { id: 789, board: { id: 987 } }
      ]
    }
  }
);

// when property does not exist or is undefined, set to null
e(
  query(
    { username: g('uname') }
  )({ username: 'manuscriptmaster' }),
  { username: null }
);

// when property does not exist or is undefined, set to null and ignore children resolvers
e(
  query({
    user: g('user', {
      id: g('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null
e(
  query({ user: g(p => p.user) })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null and ignore children resolvers
e(
  query({
    user: g(p => p.user, {
      id: g('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);
