import test from 'ava';
import query from './index.js';

// Add operators (eq), composers (and), or qualifiers (not)
const JQL = {
  eq: (k, v) => `${k} = "${v}"`,
  gt: (k, v) => `${k} > ${v}`,
  and: (q1, q2) => `${q1} AND ${q2}`,
  or: (q1, q2) => `${q1} OR ${q2}`,
  not: (q) => `NOT ${q}`
};

test('JQL definitions can be called directly to return JQL string', t => {
  const { and, eq, gt } = JQL;
  t.deepEqual(
    and(eq('project', 'TEST'), gt('created', 'endOfDay("-1")')),
    'project = "TEST" AND created > endOfDay("-1")'
  )
});

test('query(operations, object) returns equals operation', t => {
  t.deepEqual(query(JQL, { eq: ['project', 'TEST'] }), 'project = "TEST"');
});

test('query(operations, object) returns greater than operation', t => {
  t.deepEqual(query(JQL, { gt: ['created', 'endOfDay("-1")'] }), 'created > endOfDay("-1")');
});

test('query(operations, object) returns and of two operations', t => {
  t.deepEqual(query(JQL,
    {
      and: [
        { eq: ['project', 'TEST'] },
        { gt: ['created', 'endOfDay("-1")'] }
      ]
    }),
    'project = "TEST" AND created > endOfDay("-1")'
  );
});

test('query(operations, object) returns and of operations > 2', t => {
  t.deepEqual(query(JQL,
    {
      and: [
        { eq: ['project', 'TEST'] },
        { gt: ['created', 'endOfDay("-1")'] },
        { eq: ['type', 'Purchase Request'] }
      ]
    }),
    'project = "TEST" AND created > endOfDay("-1") AND type = "Purchase Request"'
  );
});
