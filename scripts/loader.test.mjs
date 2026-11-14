import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../js/theme.js', import.meta.url), 'utf8');

function setup() {
  const listeners = new Map();
  const timers = new Map();
  const classes = new Set();
  const loader = {hidden: true};
  let nextTimer = 0;
  const listen = (event, callback) => listeners.set(event, callback);
  runInNewContext(source, {
    document: {
      readyState: 'loading',
      documentElement: {dataset: {}, classList: {add: name => classes.add(name), remove: name => classes.delete(name)}},
      getElementById: () => loader,
      addEventListener: listen,
    },
    window: {matchMedia: () => ({matches: false}), addEventListener: listen},
    localStorage: {getItem: () => 'light'},
    setTimeout: (callback, delay) => { timers.set(++nextTimer, {callback, delay}); return nextTimer; },
    clearTimeout: id => timers.delete(id),
  });
  return {
    loader, classes, timers,
    emit: (event, data = {}) => listeners.get(event)?.(data),
    run: delay => {
      for (const [id, timer] of [...timers]) {
        if (timer.delay === delay) { timers.delete(id); timer.callback(); }
      }
    },
  };
}

test('fast page loads never show the loader', () => {
  const page = setup();
  page.emit('DOMContentLoaded');
  page.emit('load');
  page.run(180);
  assert.equal(page.loader.hidden, true);
  assert.equal(page.timers.size, 0);
});

test('slow loads show the loader and release scrolling after load', () => {
  const page = setup();
  page.emit('DOMContentLoaded');
  page.run(180);
  assert.equal(page.loader.hidden, false);
  assert(page.classes.has('page-is-loading'));
  page.emit('load');
  assert.equal(page.loader.hidden, true);
  assert.equal(page.classes.size, 0);
});

test('timeout, Escape and cached-page restoration dismiss the loader', () => {
  for (const finish of [page => page.run(10000), page => page.emit('keydown', {key: 'Escape'}),
    page => page.emit('pageshow', {persisted: true})]) {
    const page = setup();
    page.emit('DOMContentLoaded');
    page.run(180);
    finish(page);
    assert.equal(page.loader.hidden, true);
    assert.equal(page.classes.size, 0);
    assert.equal(page.timers.size, 0);
  }
});
