import ramda from 'ramda';
const { curry, take } = ramda;

const safeHead = curry((arr, currHead, toHead) =>
  toHead >= 0 && toHead <= arr.length - 1
    ? toHead
    : currHead
);

const Archivable = (history, head = null) => {
  history = Array.isArray(history) ? history : [history];
  head = head === null ? history.length - 1 : head;
  const value = history[head];
  const safeHd = safeHead(history, head);

  return {
    value,
    next: (val) => Archivable([...take(head + 1, history), val]),
    map: (fn) => Archivable([...take(head + 1, history), fn(value)]),
    undo: () => Archivable(history, safeHd(head - 1)),
    redo: () => Archivable(history, safeHd(head + 1)),
    _history: history,
    _head: head,
    toString: () => `Archived(${value})`
  };
};

export default Archivable;