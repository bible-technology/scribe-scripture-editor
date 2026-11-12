import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import template from '../../lib/VideoBurritoTemplate.json';
import { validate } from '../../util/validate';
import createVideoSB from './createVideoSB';
import migrateVideoBurrito from './migrateVideoBurrito';
import syncVideoIngredients from './syncVideoIngredients';
import { describeVideoFile, isVideoFile, toBurritoPath } from './videoIngredientUtils';

jest.mock('./updateTranslationSB', () => ({ updateVersion: (json) => json }));

const FAKE_MD5 = 'a'.repeat(32);
const md5 = (data) => crypto.createHash('md5').update(data).digest('hex');
const isValid = (metadata) => validate('metadata', 'test', JSON.stringify(metadata), '1.0.0');

// The generated metadata has no ingredients yet: the caller adds them. Add one so it can be validated.
const withIngredients = (metadata) => ({
  ...metadata,
  ingredients: {
    'video/ingredients/versification.json': {
      checksum: { md5: FAKE_MD5 }, mimeType: 'application/json', size: 2, role: 'x-versification',
    },
  },
});

const newProjectMetadata = (projectFields = {}) => createVideoSB(
  'tester',
  { projectName: 'Test video', abbreviation: 'TV', ...projectFields },
  ['JHN'],
  'English',
  'en',
  'LTR',
  { licence: 'licence text' },
  'abc123',
  {},
  'new',
  false,
);

// What an older version of Scribe wrote: legacy flavor, empty placeholders, backslash keys.
const legacyMetadata = async () => {
  const metadata = withIngredients(await newProjectMetadata());
  metadata.type.flavorType.flavor = {
    name: 'videoTranslation',
    performance: ['singleVoice', 'drama'],
    formats: {
      format1: {
        compression: 'mp4', trackConfiguration: '1/0 (Mono)', bitRate: 64000, bitDepth: 16, samplingRate: 22050,
      },
    },
  };
  metadata.agencies = [{}];
  metadata.targetAreas = [{ code: '', name: { en: '' } }];
  metadata.identification.description = { en: '' };
  metadata.ingredients = {
    'video\\ingredients\\versification.json': metadata.ingredients['video/ingredients/versification.json'],
  };
  return metadata;
};

describe('video burrito template', () => {
  it('uses the Scripture Burrito flavor name', () => {
    expect(template.type.flavorType.flavor.name).toBe('signLanguageVideoTranslation');
  });
});

describe('createVideoSB', () => {
  it('creates metadata that passes Scripture Burrito v1.0.0 validation', async () => {
    const metadata = withIngredients(await newProjectMetadata());
    expect(metadata.type.flavorType.flavor.name).toBe('signLanguageVideoTranslation');
    expect(metadata.agencies).toBeUndefined();
    expect(metadata.targetAreas).toBeUndefined();
    expect(metadata.identification.description).toBeUndefined();
    expect(isValid(metadata)).toBe(true);
  });

  it('adds the description only when it is text', async () => {
    const typed = withIngredients(await newProjectMetadata({ description: '  A video project  ' }));
    expect(typed.identification.description).toEqual({ en: 'A video project' });
    expect(isValid(typed)).toBe(true);

    // The project form starts with description set to {}
    const blanks = await Promise.all(['', '   ', {}, undefined].map((description) => newProjectMetadata({ description })));
    blanks.forEach((metadata) => expect(metadata.identification.description).toBeUndefined());
  });

  it('brings an old project up to date when it is edited', async () => {
    const old = await legacyMetadata();
    const edited = await createVideoSB(
      'tester',
      { projectName: 'Test video', abbreviation: 'TV' },
      ['JHN'],
      'English',
      'en',
      'LTR',
      { licence: 'licence text' },
      'abc123',
      { ...old, project: { videoTranslation: {} } },
      'edit',
      false,
    );
    expect(edited.project).toBeUndefined();
    expect(edited.type.flavorType.flavor.name).toBe('signLanguageVideoTranslation');
    expect(isValid(edited)).toBe(true);
  });
});

describe('migrateVideoBurrito', () => {
  it('turns legacy metadata into valid metadata, and a second run changes nothing', async () => {
    const metadata = await legacyMetadata();
    expect(isValid(metadata)).toBe(false);
    expect(migrateVideoBurrito(metadata)).toBe(true);
    expect(isValid(metadata)).toBe(true);
    expect(Object.keys(metadata.ingredients)).toEqual(['video/ingredients/versification.json']);
    expect(migrateVideoBurrito(metadata)).toBe(false);
  });

  it('keeps values the user filled in', () => {
    const metadata = {
      type: { flavorType: { flavor: { name: 'videoTranslation' } } },
      agencies: [{ id: 'x', name: { en: 'Agency' }, roles: ['rightsHolder'] }],
      targetAreas: [{ code: 'IN', name: { en: 'India' } }],
      identification: { description: { en: 'Real description' } },
    };
    migrateVideoBurrito(metadata);
    expect(metadata.agencies).toHaveLength(1);
    expect(metadata.targetAreas).toHaveLength(1);
    expect(metadata.identification.description.en).toBe('Real description');
  });

  it('leaves other flavors alone', () => {
    const metadata = { type: { flavorType: { flavor: { name: 'audioTranslation' } } }, agencies: [{}] };
    expect(migrateVideoBurrito(metadata)).toBe(false);
    expect(metadata.agencies).toHaveLength(1);
  });
});

describe('videoIngredientUtils', () => {
  it('describes takes by file name', () => {
    expect(describeVideoFile('JHN', '1_2.mp4')).toEqual({ mimeType: 'video/mp4', scope: { JHN: ['1:2'] } });
    expect(describeVideoFile('JHN', '1_3-4.webm')).toEqual({ mimeType: 'video/webm', scope: { JHN: ['1:3-4'] } });
    expect(describeVideoFile('JHN', '1_1_2.webm')).toEqual({ mimeType: 'video/webm', role: 'x-scribe' });
    expect(describeVideoFile('JHN', 'intro.webm')).toEqual({ mimeType: 'video/webm' });
  });

  it('recognizes video files and builds forward-slash paths', () => {
    expect(isVideoFile('1_1.webm')).toBe(true);
    expect(isVideoFile('.1_1.webm.123.tmp')).toBe(false);
    expect(isVideoFile('notes.txt')).toBe(false);
    expect(toBurritoPath('video', 'ingredients\\JHN', '1_1.webm')).toBe('video/ingredients/JHN/1_1.webm');
  });
});

describe('syncVideoIngredients', () => {
  let projectPath;
  const chapterFolder = () => path.join(projectPath, 'video', 'ingredients', 'JHN', '1');
  const readMetadata = () => JSON.parse(fs.readFileSync(path.join(projectPath, 'metadata.json'), 'utf8'));

  beforeAll(() => {
    window.require = require; // the app gets Node modules this way in Electron
  });

  beforeEach(async () => {
    projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'video-burrito-'));
    fs.mkdirSync(chapterFolder(), { recursive: true });
    fs.writeFileSync(path.join(projectPath, 'video', 'ingredients', 'versification.json'), '{"maxVerses":{}}');
    fs.writeFileSync(path.join(projectPath, 'video', 'ingredients', 'JHN', 'jhn.json'), '{}');
    fs.writeFileSync(path.join(chapterFolder(), '1_1.webm'), crypto.randomBytes(2048));
    fs.writeFileSync(path.join(chapterFolder(), '1_3-4.mp4'), crypto.randomBytes(1024));
    fs.writeFileSync(path.join(chapterFolder(), '1_1_1.webm'), crypto.randomBytes(512));
    fs.writeFileSync(path.join(chapterFolder(), '.1_1.webm.1700000000.tmp'), 'temp');
    fs.writeFileSync(
      path.join(projectPath, 'metadata.json'),
      JSON.stringify(withIngredients(await newProjectMetadata())),
    );
  });

  afterEach(() => {
    fs.rmSync(projectPath, { recursive: true, force: true });
  });

  it('registers every take with its real checksum, size and scope', async () => {
    expect(await syncVideoIngredients(projectPath)).toBe(true);
    const metadata = readMetadata();
    expect(isValid(metadata)).toBe(true);
    expect(Object.keys(metadata.ingredients).sort()).toEqual([
      'video/ingredients/JHN/1/1_1.webm',
      'video/ingredients/JHN/1/1_1_1.webm',
      'video/ingredients/JHN/1/1_3-4.mp4',
      'video/ingredients/JHN/jhn.json',
      'video/ingredients/versification.json',
    ]);
    Object.entries(metadata.ingredients).forEach(([key, ingredient]) => {
      const bytes = fs.readFileSync(path.join(projectPath, key));
      expect(ingredient.checksum.md5).toBe(md5(bytes));
      expect(ingredient.size).toBe(bytes.length);
    });
    expect(metadata.ingredients['video/ingredients/JHN/1/1_3-4.mp4'].scope).toEqual({ JHN: ['1:3-4'] });
    expect(metadata.ingredients['video/ingredients/JHN/1/1_1_1.webm'].role).toBe('x-scribe');
  });

  it('changes nothing on a second run', async () => {
    await syncVideoIngredients(projectPath);
    const written = fs.readFileSync(path.join(projectPath, 'metadata.json'), 'utf8');
    expect(await syncVideoIngredients(projectPath)).toBe(false);
    expect(fs.readFileSync(path.join(projectPath, 'metadata.json'), 'utf8')).toBe(written);
  });

  it('follows added, deleted and replaced takes', async () => {
    await syncVideoIngredients(projectPath);
    fs.unlinkSync(path.join(chapterFolder(), '1_3-4.mp4'));
    fs.writeFileSync(path.join(chapterFolder(), '1_3-4.webm'), crypto.randomBytes(300));
    fs.writeFileSync(path.join(chapterFolder(), '1_5.webm'), crypto.randomBytes(100));
    await syncVideoIngredients(projectPath);
    const keys = Object.keys(readMetadata().ingredients);
    expect(keys).not.toContain('video/ingredients/JHN/1/1_3-4.mp4');
    expect(keys).toContain('video/ingredients/JHN/1/1_3-4.webm');
    expect(keys).toContain('video/ingredients/JHN/1/1_5.webm');
    expect(isValid(readMetadata())).toBe(true);
  });

  it('re-reads a take of unchanged size only when told to', async () => {
    await syncVideoIngredients(projectPath);
    const file = path.join(chapterFolder(), '1_1.webm');
    const changed = crypto.randomBytes(2048);
    fs.writeFileSync(file, changed);
    const key = 'video/ingredients/JHN/1/1_1.webm';
    await syncVideoIngredients(projectPath);
    expect(readMetadata().ingredients[key].checksum.md5).not.toBe(md5(changed));
    await syncVideoIngredients(projectPath, { changedFile: file });
    expect(readMetadata().ingredients[key].checksum.md5).toBe(md5(changed));
  });

  it('upgrades an old project on disk', async () => {
    fs.writeFileSync(path.join(projectPath, 'metadata.json'), JSON.stringify(await legacyMetadata()));
    await syncVideoIngredients(projectPath);
    const metadata = readMetadata();
    expect(metadata.type.flavorType.flavor.name).toBe('signLanguageVideoTranslation');
    expect(isValid(metadata)).toBe(true);
  });

  it('does not touch other flavors, and never throws', async () => {
    const audio = { type: { flavorType: { flavor: { name: 'audioTranslation' } } } };
    fs.writeFileSync(path.join(projectPath, 'metadata.json'), JSON.stringify(audio));
    expect(await syncVideoIngredients(projectPath)).toBe(false);
    expect(readMetadata()).toEqual(audio);
    expect(await syncVideoIngredients(path.join(projectPath, 'missing'))).toBe(false);
    fs.writeFileSync(path.join(projectPath, 'metadata.json'), '{ not json');
    expect(await syncVideoIngredients(projectPath)).toBe(false);
  });
});