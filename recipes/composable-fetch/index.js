import { raise } from '../error';
import R from 'ramda';
import AbortController from 'abort-controller';
const {
  andThen,
  apply,
  pipe,
  compose,
  curry,
  is,
  mergeDeepLeft
} = R;

// fetch utils
export const json = res => res.json();
export const rejectIfNotOkay = res => res.ok ? res : raise(new Error(res.statusText));
export const basicAuthHeader = (username, password) =>
  ({ 'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`});
export const bearerAuthHeader = (token) =>
  ({ 'Authorization' : `Bearer ${token}` });

// fetch decorators
export const options = curry((decorate, fetch) => pipe(async (url, opts = {}) => [url, mergeDeepLeft(opts, is(Function, decorate) ? await decorate(opts) : decorate)], andThen(apply(fetch))));
export const option = curry((key, value, fetch) => options({ [key]: value }, fetch));
export const headers = curry((hdrs, fn) => options(async () => ({ headers: is(Function, hdrs) ? await hdrs() : hdrs }), fn));
export const method = option('method');
export const body = fetch => (json, url, opts = {}) => options({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(json)
}, fetch)(url, opts);
export const timeout = curry((ms, fetch) => options(() => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal };
})(fetch));

// applies multiple decorators to fetch
export const decorate = (fn, decorators) => compose(...decorators)(fn);
