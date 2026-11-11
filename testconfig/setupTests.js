import '@testing-library/jest-dom/extend-expect';

/*
 * jsdom does not always expose window/global under this project's jest config,
 * and user-event's clipboard stub needs them. Provide them here so component
 * tests (e.g. SearchForm) can run regardless of the test environment.
 */
if (typeof global.window === 'undefined') {
  global.window = {};
}
if (typeof global.navigator === 'undefined') {
  global.navigator = {
    clipboard: {
      read: () => Promise.resolve([]),
      write: () => Promise.resolve(),
    },
    getUserMedia: () => Promise.reject(new Error('not implemented')),
  };
}
if (typeof global.window !== 'undefined' && typeof global.window.navigator === 'undefined') {
  global.window.navigator = global.navigator;
}

process.env.NODE_ENV = 'test';
