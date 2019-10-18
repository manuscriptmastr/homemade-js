import assert from 'assert';
const e = assert.deepStrictEqual.bind(assert);
const tap = (thing) => (console.log(thing), thing);

const dit = '.';
const dah = '---';
const interSym = ' ';
const interChar = '   ';
const interWord = '       ';

const charArray = (chars) => chars.split();
const wordArray = (words) => words.split(' ');

const char = (symbols) => symbols.join(interSym);
const word = (chars) => chars.join(interChar);
const sentence = (words) => words.join(interWord);

const dict = {
  'E': char([dit]),
  'H': char([dit, dit, dit, dit]),
  ' ': interWord
};

const morse;

e(morse('H'), '. . . .       ');
// toCharArray = string => string.split()
// 'HELLO' -> ['H', 'E', 'L', 'L', 'O']
// toWordArray = string => string.split(' ').map(toCharArray)
// 'HI THERE' -> [['H', 'I'], ['T', 'H', 'E', 'R', 'E']]