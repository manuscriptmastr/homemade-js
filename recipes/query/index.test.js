import test from 'ava';
import query, { o, m, c } from './index.js';

const JQL = {
  eq: o((k, v) => `${k} = "${v}"`),
  gt: o((k, v) => `${k} > ${v}`),
  not: m((q) => `NOT ${q}`),
  and: c((q1, q2) => `${q1} AND ${q2}`),
  or: c((q1, q2) => `${q1} OR ${q2}`),
};

test('Transforms (operators, modifiers, composers) can be called directly', t => {
  const { and, eq, gt } = JQL;
  t.deepEqual(
    and([eq('project')('TEST'), gt('created', 'endOfDay("-1")')]),
    'project = "TEST" AND created > endOfDay("-1")'
  );
});

test('Transforms (operators, modifiers, composers) throw when arguments are invalid', t => {
  const { and, eq, gt } = JQL;
  t.throws(
    () => and([eq('project', {}), gt('created', 'endOfDay("-1")')]),
    { instanceOf: Error, message: 'An operator requires two arguments' }
  );
});

test('query(transforms, object) returns equals operation', t => {
  const jql = query(JQL);
  t.deepEqual(jql({ eq: ['project', 'TEST'] }), 'project = "TEST"');
});

test('query(transforms, object) returns greater than operation', t => {
  const jql = query(JQL);
  t.deepEqual(jql({ gt: ['created', 'endOfDay("-1")'] }), 'created > endOfDay("-1")');
});

test('query(transforms, object) returns and of two operations', t => {
  const jql = query(JQL);
  t.deepEqual(
    jql({
      and: [
        { eq: ['project', 'TEST'] },
        { gt: ['created', 'endOfDay("-1")'] }
      ]
    }),
    'project = "TEST" AND created > endOfDay("-1")'
  );
});

test('query(transforms, object) returns and of operations > 2', t => {
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
