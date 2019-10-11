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

// Thoughts to refactor modifier methods?
// updateState = (updater) => (state) => updater(state);
// updateProp('foregroundColor')(state, color)

const Text = (child, modifiers = {}) => {
  const wrapped = (thing) => `<Text>${thing}</Text>`;
  const props = { foregroundColor: Color.black, backgroundColor: Color.white, ...modifiers };
  const render = () => wrapped(child);

  return {
    render,
    props,
    foregroundColor: (color) => Text(child, { ...props, foregroundColor: color }),
    backgroundColor: (color) => Text(child, { ...props, backgroundColor: color })
  };
};

// Starts off the render chain. TODO add second arg for props.
// Every .render should accept args
const render = (Component) => Component.render();

// Test Text functional component
e(render(Text('')), '<Text></Text>');
e(render(Text('Hi')), '<Text>Hi</Text>')
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
  const wrapped = (thing) => `<VStack>${thing}</VStack>`;
  const props = { height: 0, width: 0, ...modifiers };
  const render = () => wrapped(children.map(child => child.render()).join(''));

  return {
    render,
    props,
    height: (pixels) => VStack(children, { ...props, height: pixels }),
    width: (pixels) => VStack(children, { ...props, width: pixels })
  };
};

e(render(VStack([])), '<VStack></VStack>');
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
  '<VStack><Text>Hi</Text></VStack>'
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
  '<VStack><Text>Hello</Text><Text>world</Text></VStack>'
);