import ramda from 'ramda';
const { curry, map } = ramda;

const query = curry((operations, object) => {
  if (object.eq) {
    return operations.eq(...object.eq);
  }

  if (object.gt) {
    return operations.gt(...object.gt);
  }

  if (object.and) {
    const subs = map(query(operations), object.and);
    return subs.reduce(operations.and);
  }

  throw new Error('You messed up!');
});

export default query;