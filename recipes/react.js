const uid = () => {
  let _id = 0;
  return () => {
    const id = _id;
    _id++;
    return id;
  };
};

// We want to generate one cell per component instance
const cell = [
  // One element per useState reference
  [ 1, 'Text input' ],
  [ 2, true ],
  [ 3, null ]
];

const cells = [
  [ 1, cell ]
];

const memory = (() => {
  const map = new Map();
  const register = (key, value) => {
    map.set(key, value);
    return value;
  };

  const retrieve = (key) => map.get(key);
  const unregister = (key) => map.delete(key);

  return {
    register,
    retrieve,
    unregister
  }
})();


const useState = (initial) => {
  const id = uid();
  memory.register(id, initial);
  const setState = (updater) => {
    state = updater(state);
    memory.register(id, state);
    return state;
  };
  return [ state, setState ];
};

const Component = () => {
  const hooks = [];
  return render;
};