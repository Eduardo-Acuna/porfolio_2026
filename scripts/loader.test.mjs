import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../js/theme.js', import.meta.url), 'utf8');

function setup({heroComplete = false, mobile = false, saveData = false, reducedMotion = false} = {}) {
  const listeners = new Map();
  const timers = new Map();
  const classes = new Set();
  const video = {
    dataset: {desktopSrc: 'desktop.mp4', mobileSrc: 'mobile.mp4'},
    play: () => Promise.resolve(), pause() {}, load() {},
    removeAttribute(name) { delete this[name]; },
  };
  const loader = {hidden: true, querySelector: () => video};
  const hero = {complete: heroComplete, addEventListener: (event, callback) => listeners.set(`hero:${event}`, callback)};
  let nextTimer = 0;
  const listen = (event, callback) => listeners.set(event, callback);
  runInNewContext(source, {
    document: {
      readyState: 'loading',
      documentElement: {dataset: {}, classList: {add: name => classes.add(name), remove: name => classes.delete(name)}},
      getElementById: () => loader,
      querySelector: () => hero,
      addEventListener: listen,
    },
    window: {
      matchMedia: query => ({matches: query.includes('max-width') ? mobile : query.includes('reduced-motion') ? reducedMotion : false}),
      navigator: {connection: {saveData}}, addEventListener: listen,
    },
    localStorage: {getItem: () => 'light'},
    setTimeout: (callback, delay) => { timers.set(++nextTimer, {callback, delay}); return nextTimer; },
    clearTimeout: id => timers.delete(id),
  });
  return {
    loader, video, classes, timers,
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
  assert.equal(page.video.src, undefined);
});

test('slow loads show the loader and release scrolling after load', () => {
  const page = setup();
  page.emit('DOMContentLoaded');
  page.run(180);
  assert.equal(page.loader.hidden, false);
  assert(page.classes.has('page-is-loading'));
  assert.equal(page.video.src, 'desktop.mp4');
  page.emit('load');
  assert.equal(page.loader.hidden, true);
  assert.equal(page.classes.size, 0);
  assert.equal(page.video.src, undefined);
});

test('timeout, Escape and cached-page restoration dismiss the loader', () => {
  for (const finish of [page => page.run(1500), page => page.emit('keydown', {key: 'Escape'}),
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

test('cached hero reveals content without waiting for secondary resources', () => {
  const page = setup({heroComplete: true});
  page.emit('DOMContentLoaded');
  page.run(180);
  assert.equal(page.loader.hidden, true);
  assert.equal(page.video.src, undefined);
  assert.equal(page.timers.size, 0);
});

test('hero completion dismisses loading before the whole page finishes', () => {
  const page = setup();
  page.emit('DOMContentLoaded');
  page.run(180);
  page.emit('hero:load');
  assert.equal(page.loader.hidden, true);
  assert.equal(page.video.src, undefined);
  assert.equal(page.timers.size, 0);
});

test('mobile only requests the mobile loading animation', () => {
  const page = setup({mobile: true});
  page.emit('DOMContentLoaded');
  page.run(180);
  assert.equal(page.video.src, 'mobile.mp4');
});

test('data saving and reduced motion avoid downloading loading animations', () => {
  for (const preferences of [{saveData: true}, {reducedMotion: true}]) {
    const page = setup(preferences);
    page.emit('DOMContentLoaded');
    page.run(180);
    assert.equal(page.video.src, undefined);
    page.run(1500);
    assert.equal(page.loader.hidden, true);
  }
});
