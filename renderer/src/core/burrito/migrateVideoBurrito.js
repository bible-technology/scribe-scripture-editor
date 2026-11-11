import template from '../../lib/VideoBurritoTemplate.json';
import { VIDEO_BURRITO_FLAVOR, VIDEO_INTERNAL_FLAVOR, flavorKey } from './flavors';

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

/**
 * Brings the metadata of a video project written by an older version of Scribe up to the
 * Scripture Burrito v1.0.0 signLanguageVideoTranslation flavor. Mutates `metadata`.
 * Projects of any other flavor are left alone.
 * @param {object} metadata parsed metadata.json
 * @returns {boolean} true when something was changed
 */
const migrateVideoBurrito = (metadata) => {
  const flavorType = metadata?.type?.flavorType;
  if (!flavorType?.flavor || flavorKey(flavorType.flavor.name) !== VIDEO_INTERNAL_FLAVOR) {
    return false;
  }
  let changed = false;

  // 1. The old flavor block was copied from audio and is not valid for the video flavor.
  if (flavorType.flavor.name !== VIDEO_BURRITO_FLAVOR) {
    flavorType.flavor = JSON.parse(JSON.stringify(template.type.flavorType.flavor));
    changed = true;
  }

  // 2. Empty placeholders from the old template are invalid. Real values are kept.
  if (Array.isArray(metadata.agencies)
    && metadata.agencies.every((agency) => !agency || Object.keys(agency).length === 0)) {
    delete metadata.agencies;
    changed = true;
  }
  if (Array.isArray(metadata.targetAreas)
    && metadata.targetAreas.every((area) => isBlank(area?.code))) {
    delete metadata.targetAreas;
    changed = true;
  }
  const description = metadata.identification?.description;
  if (description && Object.values(description).every(isBlank)) {
    delete metadata.identification.description;
    changed = true;
  }

  // 3. Ingredient keys are paths delimited by forward slashes. Older Windows builds wrote backslashes.
  const { ingredients } = metadata;
  if (ingredients) {
    Object.keys(ingredients).forEach((key) => {
      const normalized = key.replace(/\\/g, '/');
      if (normalized !== key) {
        if (!Object.prototype.hasOwnProperty.call(ingredients, normalized)) {
          ingredients[normalized] = ingredients[key];
        }
        delete ingredients[key];
        changed = true;
      }
    });
  }

  return changed;
};

export default migrateVideoBurrito;
