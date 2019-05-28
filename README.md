# HomemadeJS

Web developers use a lot of tools, and especially for career switchers like myself, adding a new library or building with a new framework is a daunting task. We're told that using these black boxes will help our codebase, but we're also left wondering whether to use `Observable.pipe()` or `Observable.subscribe()`.

In many cases, we need to understand how the black box works before we understand how to use it.

This tiny repo is my own attempt to understand how tools I already use might work under the hood. By building my own solution, I better understand the problem.

I encourage you to build your own version of tools you already interact with. You might be surprised how short they are! (Rewriting Express.js or Koa.js could take you fewer than 100 lines of code.)

## Current implementations:
### GraphQL
Given a deeply nested "thing", unwrap the "thing" until it contains only objects, arrays, and values:
```js
assert.deepStrictEqual(
  resolveGraph(() => ({
    firstName: 'Joshua',
    lastName: 'Martin',
    nationalParksVisited: () => [
      'Yosemite',
      'Crater Lake',
      'Shenandoah'
    ]
  })),
  {
    firstName: 'Joshua',
    lastName: 'Martin',
    nationalParksVisited: [
      'Yosemite',
      'Crater Lake',
      'Shenandoah'
    ]
  }
);
```

### RxJS
Return an `Observable`/`Subject` interface from `fromEvent(DOMElement, event)` with standard methods like:
- `subscribe()`
- `unsubscribe()`
- `next(value)`
- `getValue()`
- `pipe(...operator: value => value)` given operators like
  - `tap(console.log)`
  - `map(value => double(value))`
  - `withHistory(archives => getLastValue(archives))((prev, curr) => prev + curr)`
