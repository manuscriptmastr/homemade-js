import R from 'ramda';
const { identity, pipe, pipeWith } = R;

const ap = (f, res) => res.ap(f);

const Task = task => {
  const chain = fnTask => Task((rej, res) => task(rej, r => fnTask(r).fork(rej, res)));
  return {
    ap: other => chain(other.map),
    chain,
    fork: task,
    join: () => chain(identity),
    map: fn => Task((rej, res) => task(rej, pipe(fn, res))),
  }
};

Task.of = val => Task((rej, res) => res(val));

export const TaskTree = (f, functors) => pipeWith(ap, [() => f, ...functors])();

export default Task;
