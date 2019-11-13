import assert from 'assert';
import { mapValues } from 'lodash/fp';
const eq = assert.deepStrictEqual;

// gql uses a declarative syntax to map json-like data to only the data you are interested in

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
      mapValues(child => toResolver(child)(newData, root), children);
};

const gql = (...args) => (data) => {
  let extract;
  let resolvers;

  if (args.length === 2) {
    extract = args[0];
    resolvers = args[1];
  } else {
    extract = data => data;
    resolvers = args[0];
  }

  return g(extract, resolvers)(data, data);
};

export default gql;

// with key different from payload key
eq(
  gql(
    { handle: g('username') }
  )({ username: 'manuscriptmaster' }),
  { handle: 'manuscriptmaster' }
);

// with children resolvers
eq(
  gql(
    { project: g('board', { identifier: g('id') }) }
  )({ board: { id: 123 } }),
  { project: { identifier: 123 } }
);

// with deeply-nested resolvers
eq(
  gql(
    { project: g('board', { author: g('user', { identifier: g('id') }) }) }
  )({ board: { user: { id: 123 } } }),
  { project: { author: { identifier: 123 } } }
);

// with array
eq(
  gql(
    { stories: g('issues', [{ identifier: g('id') }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123 }, { identifier: 456 }] }
);

// with hardcoded property
eq(
  gql(
    { stories: g('issues', [{ identifier: g('id'), hardcoded: 'hello' }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
);

// with plain function
eq(
  gql(
    { stories: p => p.issues }
  )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
  { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
);

// with top-level array
eq(
  gql(
    [{ identifier: g('id') }]
  )([{ id: 123 }, { id: 456 }]),
  [{ identifier: 123 }, { identifier: 456 }]
);

// with top-level array and extract
eq(
  gql((issues) => issues.filter(issue => issue.boardId === 123), [{
    id: g('id')
  }])([{ id: 456, boardId: 123 }, { id: 789, boardId: 123 }, { id: 321, boardId: 432 }]),
  [{ id: 456 }, { id: 789 }]
);

// with top-level object and extract
eq(
  gql((issues) => issues[0], {
    id: g('id')
  })([{ id: 456 }, { id: 789 }]),
  { id: 456 }
);

// with root parameter
eq(
  gql({
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
eq(
  gql(
    { username: g('uname') }
  )({ username: 'manuscriptmaster' }),
  { username: null }
);

// when property does not exist or is undefined, set to null and ignore children resolvers
eq(
  gql({
    user: g('user', {
      id: g('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null
eq(
  gql({ user: g(p => p.user) })({ currentUser: { id: 123 } }),
  { user: null }
);

// when plain function returns undefined or null, set to null and ignore children resolvers
eq(
  gql({
    user: g(p => p.user, {
      id: g('id')
    })
  })({ currentUser: { id: 123 } }),
  { user: null }
);
