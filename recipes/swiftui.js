import assert from 'assert';
import fromEntries from 'object.fromentries';
Object.fromEntries = fromEntries;
const e = assert.deepStrictEqual.bind(assert);
const tap = (thing) => (console.log(thing), thing);

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

const Color = makeEnum('Color', ['white', 'black', 'blue', 'charcoal']);

// Test different ways to find a color
e(Color.blue, 'blue');
e(Color('blue'), 'blue');

const withWrapper = (ComponentName, props = {}) => (children) =>
  `<${ComponentName} ${Object.entries(props).map(([k, v]) => `${k}="${v}"`).join(' ')}>${children}</${ComponentName}>`;
const render = (Component) => Component.render();
const sanitize = (string) => string.replace(/>[\s]+</gi, '><').trim();
const updateProp = (key) => (value, props = {}) => ({ ...props, [key]: value });

// All Components, be it Text, VStack, List, etc have child/children, props, render, map.
// How can we refactor these into a Component factory?
const Text = (children, modifiers = {}) => {
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

// Test Text component
e(render(Text('')), '<Text foregroundColor="black" backgroundColor="white"></Text>');
e(render(Text('Hi')), '<Text foregroundColor="black" backgroundColor="white">Hi</Text>');
e(Text('').props.foregroundColor, 'black');
e(Text('').foregroundColor('blue').props.foregroundColor, 'blue');
e(
  Text('')
    .foregroundColor('blue')
    .backgroundColor('charcoal')
    .props,
  { foregroundColor: 'blue', backgroundColor: 'charcoal' }
);

const VStack = (children, modifiers = {}) => {
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

// Test empty VStack
e(render(VStack([])), '<VStack height="0" width="0"></VStack>');
e(VStack([]).height(10).props.height, 10);
e(
  VStack([]).height(10).width(10).props,
  { height: 10, width: 10 }
);

// Test VStack with nested children
e(
  render(
    VStack([
      Text('Hi')
    ])
  ),
  sanitize(`
    <VStack height="0" width="0">
      <Text foregroundColor="black" backgroundColor="white">Hi</Text>
    </VStack>
  `)
);

e(
  render(
    VStack([
      Text('Hello')
        .foregroundColor(Color.blue)
        .backgroundColor(Color.black),
      Text('world')
    ])
  ),
  sanitize(`
    <VStack height="0" width="0">
      <Text foregroundColor="blue" backgroundColor="black">Hello</Text>
      <Text foregroundColor="black" backgroundColor="white">world</Text>
    </VStack>
  `)
);

const K = k => k;

const List = (list, children = K, modifiers = {}) => {
  const props = { orientation: 'vertical', ...modifiers };
  const render = () => withWrapper('List', props)(list.map(element => children(element).render()).join(''));
  const map = (update) => (...args) => List(list, children, update(...args, props));

  return {
    render,
    props,
    orientation: map(updateProp('orientation'))
  };
};

// Test empty List
e(render(List([])), '<List orientation="vertical"></List>');
e(render(List([], () => Text('Hi'))), '<List orientation="vertical"></List>');

// Test List with children
e(
  render(
    List([
      Text('Hi')
    ])
  ),
  sanitize(`
    <List orientation="vertical">
      <Text foregroundColor="black" backgroundColor="white">Hi</Text>
    </List>
  `)
);

e(
  render(
    List(['hello', 'world'], ([ firstChar ]) =>
      Text(firstChar)
        .backgroundColor(Color.blue)
    )
  ),
  sanitize(`
    <List orientation="vertical">
      <Text foregroundColor="black" backgroundColor="blue">h</Text>
      <Text foregroundColor="black" backgroundColor="blue">w</Text>
    </List>
  `)
);