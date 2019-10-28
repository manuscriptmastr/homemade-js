import assert from 'assert';
const e = assert.deepStrictEqual.bind(assert);

const curry = (fn) => ((len) => {
  const $curry = (...args) =>
    args.length === len
      ? fn(...args)
      : (...newArgs) => $curry(...args, ...newArgs)
  ;
  return $curry;
})(fn.length);

const take = curry((count, arr) => arr.slice(0, count));
const safeHead = curry((arr, currHead, toHead) =>
  toHead >= 0 && toHead <= arr.length - 1
    ? toHead
    : currHead
);

const Archived = (history, head = null) => {
  history = Array.isArray(history) ? history : [history];
  head = head === null ? history.length - 1 : head;
  const value = history[head];
  const safeHd = safeHead(history, head);

  return {
    value,
    next: (val) => Archived([...take(head + 1, history), val]),
    map: (fn) => Archived([...take(head + 1, history), fn(value)]),
    undo: () => Archived(history, safeHd(head - 1)),
    redo: () => Archived(history, safeHd(head + 1)),
    _history: history,
    _head: head,
    toString: () => `Archived(${value})`
  };
};

e(Archived('hello').value, 'hello');

e(Archived('hello').next('bye').value, 'bye');
e(Archived('hello').next('bye')._history, ['hello', 'bye']);
e(Archived('hello').map(x => x.toUpperCase()).value, 'HELLO');

e(Archived('hello').next('bye').undo().value, 'hello');
e(Archived('hello').next('bye').undo().undo().value, 'hello');

e(Archived('hello').redo().value, 'hello');

e(Archived(['hello', 'bye', 'hi again']).undo().redo()._head, 2);
e(Archived(['hello', 'bye']).undo().next('greeting').value, 'greeting');
e(Archived(['hello', 'bye']).undo().next('greeting')._history, ['hello', 'greeting']);