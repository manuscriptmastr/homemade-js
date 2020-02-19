import test from 'ava';
import gql, { g } from './index.js';

test('gql() works with key different from payload key', t => {
  t.deepEqual(
    gql(
      { handle: g('username') }
    )({ username: 'manuscriptmaster' }),
    { handle: 'manuscriptmaster' }
  );
});

test('gql() works with children resolvers', t => {
  t.deepEqual(
    gql(
      { project: g('board', { identifier: g('id') }) }
    )({ board: { id: 123 } }),
    { project: { identifier: 123 } }
  );
});

test('gql() works with deeply-nested resolvers', t => {
  t.deepEqual(
    gql(
      { project: g('board', { author: g('user', { identifier: g('id') }) }) }
    )({ board: { user: { id: 123 } } }),
    { project: { author: { identifier: 123 } } }
  );
});

test('gql() works with array', t => {
  t.deepEqual(
    gql(
      { stories: g('issues', [{ identifier: g('id') }]) }
    )({ issues: [{ id: 123 }, { id: 456 }] }),
    { stories: [{ identifier: 123 }, { identifier: 456 }] }
  );
});

test('gql() works with hardcoded property', t => {
  t.deepEqual(
    gql(
      { stories: g('issues', [{ identifier: g('id'), hardcoded: 'hello' }]) }
    )({ issues: [{ id: 123 }, { id: 456 }] }),
    { stories: [{ identifier: 123, hardcoded: 'hello' }, { identifier: 456, hardcoded: 'hello' }] }
  );
});

test('gql() works with plain function', t => {
  t.deepEqual(
    gql(
      { stories: p => p.issues }
    )({ issues: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }),
    { stories: [{ id: 123, name: 'Fix' }, { id: 456, name: 'Me' }] }
  );
});

test('gql() works with top-level array', t => {
  t.deepEqual(
    gql(
      [{ identifier: g('id') }]
    )([{ id: 123 }, { id: 456 }]),
    [{ identifier: 123 }, { identifier: 456 }]
  );
});

test('gql() works with top-level array and extract', t => {
  t.deepEqual(
    gql((issues) => issues.filter(issue => issue.boardId === 123), [{
      id: g('id')
    }])([{ id: 456, boardId: 123 }, { id: 789, boardId: 123 }, { id: 321, boardId: 432 }]),
    [{ id: 456 }, { id: 789 }]
  );
});

test('gql() works with top-level object and extract', t => {
  t.deepEqual(
    gql((issues) => issues[0], {
      id: g('id')
    })([{ id: 456 }, { id: 789 }]),
    { id: 456 }
  );
});

test('gql() works with root parameter', t => {
  t.deepEqual(
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
});

test('gql() works when property does not exist or is undefined, set to null', t => {
  t.deepEqual(
    gql(
      { username: g('uname') }
    )({ username: 'manuscriptmaster' }),
    { username: null }
  );
});

test('gql() works when property does not exist or is undefined, set to null and ignore children resolvers', t => {
  t.deepEqual(
    gql({
      user: g('user', {
        id: g('id')
      })
    })({ currentUser: { id: 123 } }),
    { user: null }
  );
});

test('gql() works when plain function returns undefined or null, set to null', t => {
  t.deepEqual(
    gql({ user: g(p => p.user) })({ currentUser: { id: 123 } }),
    { user: null }
  );
});

test('gql() works when plain function returns undefined or null, set to null and ignore children resolvers', t => {
  t.deepEqual(
    gql({
      user: g(p => p.user, {
        id: g('id')
      })
    })({ currentUser: { id: 123 } }),
    { user: null }
  );
});
