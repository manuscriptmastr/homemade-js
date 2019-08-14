import fetch from 'node-fetch';
import gql, { g } from './graphql-async';

const API = 'https://jsonplaceholder.typicode.com';

const get = (path) => fetch(`${API}${path}`)
  .then(res => res.json());

const query =
  gql(() => get('/posts'), [{
    id: g('id'),
    comments: g(({ id }) => get(`/posts/${id}/comments`).then(d => d.slice(0, 6)), [{
      name: g('name'),
      body: g('body')
    }]),
    author: g(({ userId }) => get(`/users/${userId}`), {
      fullName: g('name'),
      username: g('username'),
      email: g('email')
    })
  }]);

query().then(console.log);