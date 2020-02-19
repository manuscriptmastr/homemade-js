class EnumError extends Error {
  constructor(message) {
    super(message);
    this.name = 'EnumError';
  }
};

const lookup = (Enum, string) => Enum[string] || null;

const makeEnum = (name, keys, invokedOp = lookup) => {
  const Enum = (string) => {
    const result = invokedOp(Enum, string);
    if (result === null || result === undefined) {
      throw new EnumError(`${name} does not have property '${string}'.`);
    } else {
      return result;
    }
  };

  keys.forEach(key => {
    Enum[key] = key;
  });
  return Enum;
};

export const Color = makeEnum('Color', ['white', 'black', 'blue', 'charcoal']);

const withWrapper = (ComponentName, props = {}) => (children) =>
  `<${ComponentName} ${Object.entries(props).map(([k, v]) => `${k}="${v}"`).join(' ')}>${children}</${ComponentName}>`;
export const render = (Component) => Component.render();
export const sanitize = (string) => string.replace(/>[\s]+</gi, '><').trim();
const updateProp = (key) => (value, props = {}) => ({ ...props, [key]: value });

// All Components, be it Text, VStack, List, etc have child/children, props, render, map.
// How can we refactor these into a Component factory?
export const Text = (children, modifiers = {}) => {
  const props = { foregroundColor: Color.black, backgroundColor: Color.white, ...modifiers };
  const render = () => withWrapper('Text', props)(children);
  const map = (update) => (...args) => Text(children, update(...args, props));

  return {
    render,
    props,
    foregroundColor: map(updateProp('foregroundColor')),
    backgroundColor: map(updateProp('backgroundColor'))
  };
};

export const VStack = (children, modifiers = {}) => {
  const props = { height: 0, width: 0, ...modifiers };
  const render = () => withWrapper('VStack', props)(children.map(child => child.render()).join(''));
  const map = (update) => (...args) => VStack(children, update(...args, props));

  return {
    render,
    props,
    height: map(updateProp('height')),
    width: map(updateProp('width'))
  };
};

const K = k => k;

export const List = (list, children = K, modifiers = {}) => {
  const props = { orientation: 'vertical', ...modifiers };
  const render = () => withWrapper('List', props)(list.map(element => children(element).render()).join(''));
  const map = (update) => (...args) => List(list, children, update(...args, props));

  return {
    render,
    props,
    orientation: map(updateProp('orientation'))
  };
};
