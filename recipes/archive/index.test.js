import test from 'ava';
import Archivable from './index.js';

test('Archivable(value) sets .value to initial value', t => {
  t.deepEqual(Archivable('hello').value, 'hello');
});

test('Archivable(value) updates .value to result of .next()', t => {
  t.deepEqual(Archivable('hello').next('bye').value, 'bye');
});

test('Archivable(value) stores all values in ._history', t => {
  t.deepEqual(Archivable('hello').next('bye')._history, ['hello', 'bye']);
});

test('Archivable(value) sets .value to result of .map()', t => {
  t.deepEqual(Archivable('hello').map(x => x.toUpperCase()).value, 'HELLO');
});

test('Archivable(value) sets .value from result of calling .next() and .undo()', t => {
  t.deepEqual(Archivable('hello').next('bye').undo().value, 'hello');
});

test('Archivable(value) allows multiple .undo()', t => {
  t.deepEqual(Archivable('hello').next('bye').undo().undo().value, 'hello');
});

test('Archivable(value) calls .redo() and sets .value', t => {
  t.deepEqual(Archivable('hello').redo().value, 'hello');
});

test('Archivable(value) accepts array of history', t => {
  t.deepEqual(Archivable(['hello', 'bye', 'hi again']).undo().redo()._head, 2);
});

test('Archivable(value) calls .next() and sets value', t => {
  t.deepEqual(Archivable(['hello', 'bye']).undo().next('greeting').value, 'greeting');
});

test('Archivable(value) calls .next() and slices history after head', t => {
  t.deepEqual(Archivable(['hello', 'bye']).undo().next('greeting')._history, ['hello', 'greeting']);
});
