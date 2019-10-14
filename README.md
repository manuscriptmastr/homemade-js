# HomemadeJS

Web developers use a lot of tools, and especially for career switchers like myself, adding a new library or building with a new framework is a daunting task. We're told that using these black boxes will help our codebase, but we're also left wondering whether to use `Observable.pipe()` or `Observable.subscribe()`.

We need to understand how the black box works before we understand how to use it, and what better way to understand them by recreating them?

This tiny repo is my own attempt to understand how tools I already use might work under the hood. By building my own solution, I now understand the problem.

I encourage you to build your own version of tools you already interact with. You might be surprised how short they are! (Rewriting Express.js or Koa.js could take you fewer than 100 lines of code.)

## Current implementations:
### GraphQL: The Resolver Pattern
Given a deeply nested resolver and a json-like payload, return a new payload that looks identical to the structure of my resolver:
```js
import gql, { g } from './recipes/graphql';
import truncate from './somewhere/over/the/rainbow';

const worksByAuthor = gql({
  author: g('user', {
    name: g('fullName'),
    pseudonym: g('username'),
    works: g('books', [{
      title: g('title'),
      summary: g(book => truncate(book.text, 1, 'sentence'))
    }])
  })
});

fetch('/api/books/tolkien')
  .then(data => data.json())
  .then(worksByAuthor);

// returns:

// {
//   author: {
//     name: 'J. R. R. Tolkien',
//     pseudonym: 'Oxymore',
//     works: [
//       {
//         title: 'The Hobbit',
//         summary: 'In a hole in the ground there lived a hobbit.'
//       },
//       ...
//     ]
//   }
// }
```
The original payload `root` is passed as a second argument in case you need to refer to information elsewhere in the tree structure:

```js
gql({
  author: g(data => data.authors.find(a => a.username === 'Oxymore'), {
    name: g('fullName'),
    group: g((author, root) => root.groups.find(g => g.id === author.groupId), {
      name: g('name')
    })
  })
});

// returns:

// {
//   author: {
//     name: 'J. R. R. Tolkien',
//     group: {
//       name: 'Inklings'
//     }
//   }
// }
```
An async version of `gql` is available for kicks and grins. Whether this is a good idea is entirely up to you.

### SwiftUI
Given a SwiftUI-like tree structure, render raw XML:

```js
render(
  VStack([
    Text('Hello')
      .foregroundColor(Color.blue)
      .backgroundColor(Color.black),
    Text('world')
  ])
);

// returns:

// <VStack height="0" width="0">
//   <Text foregroundColor="blue" backgroundColor="black">Hello</Text>
//   <Text foregroundColor="black" backgroundColor="white">world</Text>
// </VStack>
```

### RxJS: The Observer Pattern
Return an `Observable`/`Subject` interface from `fromEvent(DOMElement, event)` with standard methods like:
- `subscribe()`
- `unsubscribe()`
- `next(value)`
- `getValue()`
- `pipe(...operator: value => value)` given operators like
  - `tap(console.log)`
  - `map(value => double(value))`
  - `withHistory(archives => getLastValue(archives))((prev, curr) => prev + curr)`