import test from 'ava';
import query, { o, m, c } from './index.js';
import Joi from '@hapi/joi';

const JQL = {
  eq: o((k, v) => `${k} = "${v}"`),
  gt: o((k, v) => `${k} > ${v}`),
  not: m(q => `NOT ${q}`),
  and: c(qs => qs.join(' AND ')),
  or: c(qs => qs.join(' OR ')),
};

test('o(), m(), and c() can be called directly', t => {
  const { and, eq, gt, not } = JQL;
  t.deepEqual(
    and([eq('project', 'TEST'), not(gt('created', 'endOfDay("-1")'))]),
    'project = "TEST" AND NOT created > endOfDay("-1")'
  );
});

test('o(), m(), and c() throw when arguments are invalid', t => {
  const { and, eq, gt, not } = JQL;
  t.throws(
    () => and([eq('project', {}), not(gt('created', 'endOfDay("-1")'))]),
    { instanceOf: Joi.ValidationError, message: '"value" must be one of [string, number]' }
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
