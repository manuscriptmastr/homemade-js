import test from 'ava';
import R from 'ramda';
const { add, divide, multiply } = R;
import Task, { TaskTree } from './index';

const wait = ms => new Promise(res => setTimeout(res, ms));

const task1 = Task((rej, res) => wait(500).then(() => res(1)));
const task2 = Task((rej, res) => wait(1000).then(() => res(2)));
const badTask = Task((rej, res) => wait(750).then(() => rej(new Error('BOOM!'))));

test.cb('Task(fn).fork(reject, resolve) calls resolve when successful', t => {
  task1.fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 1);
      t.end();
    }
  );
});

test.cb('Task(fn).fork(reject, resolve) calls reject when unsuccessful', t => {
  badTask.fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('Task(fn).map(fn) calls resolve when successful', t => {
  task1.map(add(2)).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('Task(fn).map(fn) calls reject when unsuccessful', t => {
  badTask.map(add(2)).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('Task(fn).chain(fnReturnsTask) calls resolve when successful', t => {
  task1.chain(val => Task((rej, res) => res(val + 2))).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('Task(fn).chain(fnReturnsTask) calls reject when original task is unsuccessful', t => {
  badTask.chain(val => Task((rej, res) => res(val + 2))).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('Task(fn).chain(fnReturnsTask) calls reject when chained task is unsuccessful', t => {
  task1.chain(() => badTask).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('Task.of(value) calls resolve when successful', t => {
  Task.of(1).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 1);
      t.end();
    }
  );
});

test.cb('Task.of(value).map(fn) calls resolve when successful', t => {
  Task.of(1).map(add(2)).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('Task.of(fn) calls resolve when successful', t => {
  Task.of(add).map(add => add(1)).map(add => add(2)).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('Task(fn).ap(task) calls resolve when successful', t => {
  Task.of(add).ap(task1).ap(task2).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('Task(fn).ap(task) calls reject when first subtask fails', t => {
  Task.of(add).ap(badTask).ap(task1).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('Task(fn).ap(task) calls reject when second subtask fails', t => {
  Task.of(add).ap(task1).ap(badTask).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('TaskTree(task, subtasks) calls resolve when successful', t => {
  TaskTree(Task.of(add), [task1, task2]).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 3);
      t.end();
    }
  );
});

test.cb('TaskTree(task, subtasks) calls reject when first subtask fails', t => {
  TaskTree(Task.of(add), [task1, badTask]).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('TaskTree(task, subtasks) calls reject when second subtask fails', t => {
  TaskTree(Task.of(add), [badTask, task1]).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});

test.cb('TaskTree(task, subtasks) works with nested subtasks', t => {
  TaskTree(Task.of(add), [
    TaskTree(Task.of(multiply), [Task.of(1), Task.of(2)]),
    TaskTree(Task.of(divide), [Task.of(4), Task.of(2)]),
  ]).fork(
    () => {
      t.fail('Should not throw');
      t.end();
    },
    val => {
      t.deepEqual(val, 4);
      t.end();
    }
  );
});

test.cb('TaskTree(task, subtasks) fails when a nested subtask fails', t => {
  TaskTree(Task.of(add), [
    TaskTree(Task.of(multiply), [badTask, Task.of(2)]),
    TaskTree(Task.of(divide), [Task.of(4), Task.of(2)]),
  ]).fork(
    err => {
      t.deepEqual(err.message, 'BOOM!');
      t.end();
    },
    () => {
      t.fail('Should throw');
      t.end();
    }
  );
});
