import test from 'ava';
import Archive from './index.js';

test('Archive(value) sets .value to initial value', t => {
  t.deepEqual(Archive('hello').value, 'hello');
});

test('Archive(value) updates .value to result of .next()', t => {
  t.deepEqual(Archive('hello').next('bye').value, 'bye');
});

test('Archive(value) stores all values in ._history', t => {
  t.deepEqual(Archive('hello').next('bye')._history, ['hello', 'bye']);
});

test('Archive(value) sets .value to result of .map()', t => {
  t.deepEqual(Archive('hello').map(x => x.toUpperCase()).value, 'HELLO');
});

test('Archive(value) sets .value from result of calling .next() and .undo()', t => {
  t.deepEqual(Archive('hello').next('bye').undo().value, 'hello');
});

test('Archive(value) allows multiple .undo()', t => {
  t.deepEqual(Archive('hello').next('bye').undo().undo().value, 'hello');
});

test('Archive(value) calls .redo() and sets .value', t => {
  t.deepEqual(Archive('hello').redo().value, 'hello');
});

test('Archive(value) accepts array of history', t => {
  t.deepEqual(Archive(['hello', 'bye', 'hi again']).undo().redo()._head, 2);
});

test('Archive(value) calls .next() and sets value', t => {
  t.deepEqual(Archive(['hello', 'bye']).undo().next('greeting').value, 'greeting');
});

test('Archive(value) calls .next() and slices history after head', t => {
  t.deepEqual(Archive(['hello', 'bye']).undo().next('greeting')._history, ['hello', 'greeting']);
});
