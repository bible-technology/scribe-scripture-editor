import { flavorKey, VIDEO_BURRITO_FLAVOR, VIDEO_INTERNAL_FLAVOR } from './flavors';

describe('flavorKey', () => {
  it('maps the burrito video flavor to the internal key', () => {
    expect(flavorKey(VIDEO_BURRITO_FLAVOR)).toBe(VIDEO_INTERNAL_FLAVOR);
  });

  it('returns every other flavor unchanged', () => {
    ['textTranslation', 'audioTranslation', 'textStories', 'x-juxtalinear', VIDEO_INTERNAL_FLAVOR, undefined]
      .forEach((name) => expect(flavorKey(name)).toBe(name));
  });
});
