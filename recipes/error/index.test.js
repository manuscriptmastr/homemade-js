import test from 'ava';
import { instanceOf, raise, rescue } from './index.js';

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError'
  }
}

class RandomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RandomError'
  }
}

test('instanceOf(Error, error) returns true if error.name equals Error.name', t => {
  t.true(instanceOf(NotFoundError, new NotFoundError('Not found')));
});

test('instanceOf(Error, error) returns false if error.name does not equal Error.name', t => {
  t.false(instanceOf(NotFoundError, new RandomError('Yeet')));
});

test('instanceOf(ErrorString, error) returns true if error.name equals ErrorString', t => {
  t.true(instanceOf('NotFoundError', new NotFoundError('Not found')));
});

test('instanceOf(ErrorString, error) returns false if error.name does not equal ErrorString', t => {
  t.false(instanceOf('NotFoundError', new RandomError('Yeet')));
});

test('rescue(Error, with) rescues error whose instance matches Error', async t => {
  const throwsNotFound = async () => raise(new NotFoundError('Not found'));
  await t.notThrowsAsync(throwsNotFound().catch(rescue(NotFoundError, () => 'Rescued')));
});

test('rescue(Error, with) rethrows error whose instance does not match Error', async t => {
  const throwsRandom = async () => raise(new RandomError('Yeet'));
  await t.throwsAsync(
    throwsRandom().catch(rescue(NotFoundError, () => 'Rescued')),
    { instanceOf: RandomError },
  );
});

test('rescue(Error, with) rethrows error even if its constructor extends Error', async t => {
  const throwsRandom = async () => raise(new RandomError('Yeet'));
  await t.throwsAsync(
    throwsRandom().catch(rescue(Error, () => 'Rescued')),
    { instanceOf: RandomError },
  );
});