import _fetch from 'node-fetch';
import { limit } from 'semaphorejs';
import retry from 'min-retry';
import {
  bearerAuthHeader,
  decorate,
  headers,
  timeout
} from '.'

export default decorate(_fetch, [
  headers(bearerAuthHeader('sometoken123')),
  timeout(5000),
  retry(3),
  limit(10)
]);
