import test from 'ava';
import { Color, Text, VStack, List, render, sanitize } from './index.js';

test('Color enum allows different ways to find a color', t => {
  t.deepEqual(Color.blue, 'blue');
  t.deepEqual(Color('blue'), 'blue');
});

test('Text(string) works', t => {
  t.deepEqual(render(Text('')), '<Text foregroundColor="black" backgroundColor="white"></Text>');
  t.deepEqual(render(Text('Hi')), '<Text foregroundColor="black" backgroundColor="white">Hi</Text>');
  t.deepEqual(Text('').props.foregroundColor, 'black');
  t.deepEqual(Text('').foregroundColor('blue').props.foregroundColor, 'blue');
  t.deepEqual(
    Text('')
      .foregroundColor('blue')
      .backgroundColor('charcoal')
      .props,
    { foregroundColor: 'blue', backgroundColor: 'charcoal' }
  );
});

test('VStack(children) works without children', t => {
  t.deepEqual(render(VStack([])), '<VStack height="0" width="0"></VStack>');
  t.deepEqual(VStack([]).height(10).props.height, 10);
  t.deepEqual(
    VStack([]).height(10).width(10).props,
    { height: 10, width: 10 }
  );
});

test('VStack(children) works with children', t => {
  t.deepEqual(
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
});

test('VStack(children) works with children and modifiers', t => {
  t.deepEqual(
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
});

test('List(children) works without children', t => {
  t.deepEqual(render(List([])), '<List orientation="vertical"></List>');
  t.deepEqual(render(List([], () => Text('Hi'))), '<List orientation="vertical"></List>');
});

test('List(children) works with children', t => {
  t.deepEqual(
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
});

test('List(children) works with children and modifiers', t => {
  t.deepEqual(
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
});
