const renderer = require('./renderer')
const process  = require('process')
const cp       = require('child_process')
const path     = require('path')
const fs       = require('fs')

test('no regexp', () => {
  const data = renderer.render('no regexp', new RegExp())
  expect(data).toEqual('no regexp')
});

test('no exp throws', () => {
  expect(() => {renderer.render('no regexp', new RegExp(), true)}).toThrowError(`'0' is not present in env. '' will not be replaced.`)
});

test('no matcher', () => {
  const data = renderer.render('no matcher string', /\$\{([A-Z_-]+)\}/gm)
  expect(data).toEqual('no matcher string')
});

test('no matcher throws', () => {
  const data = renderer.render('no matcher string', /\$\{([A-Z_-]+)\}/gm, true)
  expect(data).toEqual('no matcher string')
});

test('match no var', () => {
  const data = renderer.render('hello ${WORLD}', /\$\{([A-Z_-]+)\}/gm)
  expect(data).toEqual('hello ${WORLD}')
});

test('match no var throws', () => {
  expect(() => {renderer.render('hello ${WORLD}', /\$\{([A-Z_-]+)\}/gm, true)}).toThrowError(`'WORLD' is not present in env. '\${WORLD}' will not be replaced.`)
});

test('match with var', () => {
  process.env['WORLD'] = 500;
  const data = renderer.render('hello ${WORLD}', /\$\{([A-Z_-]+)\}/gm)
  expect(data === 'hello 500')
});

test('match with var multiple time', () => {
  process.env['WORLD'] = 'github';
  const data = renderer.render('hello ${WORLD} ${WORLD} ${WORLD}', /\$\{([A-Z_-]+)\}/gm)
  expect(data === 'hello github github github')
});

test('multiline match with var multiple time', () => {
  process.env['WORLD'] = 'github';
  const data = renderer.render('hello ${WORLD}\n${WORLD}\n${WORLD}', /\$\{([A-Z_-]+)\}/gm)
  expect(data === 'hello github\ngithub\ngithub')
});

test('match with several var', () => {
  process.env['HELLO'] = 'hello';
  process.env['WORLD'] = 'github';
  const data = renderer.render('${HELLO} ${WORLD} ${WORLD} ${WORLD}', /\$\{([A-Z_-]+)\}/gm)
  expect(data === 'hello github github github')
});

test('multiline match with several var', () => {
  process.env['HELLO'] = 'hello';
  process.env['WORLD'] = 'github';
  const data = renderer.render('${HELLO} ${WORLD}\n${WORLD} ${HELLO}', /\$\{([A-Z_-]+)\}/gm)
  expect(data === 'hello github\ngithub hello')
});

function verifyFile(path, expected) {
  const actual = fs.readFileSync(path, 'utf8')
  expect(expected).toEqual(actual)
}

test('test runs one file', () => {
  process.env['INPUT_INPUT'] = './test-files/simple.txt';
  process.env['INPUT_OUTPUT'] = './test-output-one';
  process.env['INPUT_HARD_FAIL'] = true;
  process.env['TEST_VAR'] = 'hello word';
  const ip = path.join(__dirname, 'index.js');
  console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString());

  verifyFile('./test-output-one/simple.txt', 'hello word')
})

test('test runs glob file', () => {
  process.env['INPUT_INPUT'] = './test-files/**';
  process.env['INPUT_OUTPUT'] = './test-output';
  process.env['INPUT_HARD_FAIL'] = true;
  process.env['TEST_VAR'] = 'hello word';
  const ip = path.join(__dirname, 'index.js');
  console.log(cp.execSync(`node ${ip}`, {env: process.env}).toString());

  verifyFile('./test-output/simple.txt', 'hello word')
  verifyFile('./test-output/several.txt', 'hello word hello word')
  verifyFile('./test-output/multiline.txt', 'hello word\nhello word')
  verifyFile('./test-output/multiline_several.txt', 'hello word hello word\nhello word hello word')
  verifyFile('./test-output/text.txt', 'This is a test: hello word with hello word\nhello word and hello word')
})
