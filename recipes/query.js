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

const get = (key) => (data) => data[key];

const toGetter = (extract) =>
  typeof extract === 'string'
    ? get(extract)
    : extract;

const toResolver = (valueOrFunc) =>
  typeof valueOrFunc === 'function'
    ? valueOrFunc
    : () => valueOrFunc;

export const g = (extract, children) =>
  ((extract) => (data, self) =>
      children === undefined ?
        extract(data, self)
    : Array.isArray(children) ?
        extract(data, self).map(d => g(d => d, children[0])(d, self))
    : mapValues(children, child => toResolver(child)(extract(data, self), self))
  )(toGetter(extract));

const query = (resolvers) => (data) => g(data => data, resolvers)(data, data);
export default query;

e(
  query(
    { handle: g('username') }
  )({ username: 'manuscriptmaster' }),
  { handle: 'manuscriptmaster' }
);

e(
  query(
    { name: g('firstName') }
  )({ firstName: 'joshua' }),
  { name: 'joshua' }
);

e(
  query(
    { project: g('board', { identifier: g('id') }) }
  )({ board: { id: 123 } }),
  { project: { identifier: 123 } }
);

e(
  query(
    { project: g('board', { author: g('user', { identifier: g('id') }) }) }
  )({ board: { user: { id: 123 } } }),
  { project: { author: { identifier: 123 } } }
);

e(
  query(
    { stories: g('issues', [{ identifier: g('id') }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123 }, { identifier: 456 }] }
);

e(
  query(
    { stories: g('issues', [{ identifier: g('id'), hardcoded: 'hello' }]) }
  )({ issues: [{ id: 123 }, { id: 456 }] }),
  { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
);

e(
  query(
    { stories: p => p.issues }
  )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
  { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
);

e(
  query(
    [{ identifier: g('id') }]
  )([{ id: 123 }, { id: 456 }]),
  [{ identifier: 123 }, { identifier: 456 }]
);

e(
  query({
    project: g('project', {
      issues: g('issues', [{
        id: g('id'),
        board: g((issue, self) => self.boards.find(board => board.id === issue.boardId))
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