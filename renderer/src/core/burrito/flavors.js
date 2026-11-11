// Scripture Burrito v1.0.0 names the sign language video flavor 'signLanguageVideoTranslation'.
// The app has always used 'videoTranslation' as its own key (the `project.videoTranslation`
// entry in ag-settings.json, editor routing, and so on). Metadata read from disk can carry
// either name, so map it once, at the point where it is read.
export const VIDEO_BURRITO_FLAVOR = 'signLanguageVideoTranslation';
export const VIDEO_INTERNAL_FLAVOR = 'videoTranslation';

/**
 * Maps a flavor name from metadata.json to the key used inside the app.
 * Every flavor other than the burrito video flavor is returned unchanged.
 * @param {string|undefined} name flavor name from metadata.type.flavorType.flavor.name
 * @returns {string|undefined}
 */
export const flavorKey = (name) => (name === VIDEO_BURRITO_FLAVOR ? VIDEO_INTERNAL_FLAVOR : name);
