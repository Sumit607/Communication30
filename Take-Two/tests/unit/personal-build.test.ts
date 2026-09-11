import { DEFAULT_MODEL, resolveModel } from '@/services/gemini/model';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { preparePersonalBuild } = require('../../scripts/prepare-personal-build.cjs');

test('ordinary builds never inject credentials even when an environment variable exists', () => {
  const write = jest.fn();
  expect(
    preparePersonalBuild(
      { EAS_BUILD_PROFILE: 'preview', TAKE_TWO_PERSONAL_GEMINI_KEY: 'unused' },
      write,
    ),
  ).toBe(false);
  expect(write).not.toHaveBeenCalled();
});

test('personal builds fail closed outside the Android builder or without a valid key', () => {
  const write = jest.fn();
  expect(() => preparePersonalBuild({ EAS_BUILD_PROFILE: 'personal' }, write)).toThrow(
    /EAS Android/,
  );
  expect(() =>
    preparePersonalBuild(
      { EAS_BUILD_PROFILE: 'personal', EAS_BUILD: 'true', EAS_BUILD_PLATFORM: 'android' },
      write,
    ),
  ).toThrow(/requires/);
  expect(write).not.toHaveBeenCalled();
});

test('the EAS-only hook writes the credential module without putting it in app config', () => {
  const write = jest.fn();
  const synthetic = 'AIza' + 'x'.repeat(35);
  expect(
    preparePersonalBuild(
      {
        EAS_BUILD_PROFILE: 'personal',
        EAS_BUILD: 'true',
        EAS_BUILD_PLATFORM: 'android',
        TAKE_TWO_PERSONAL_GEMINI_KEY: synthetic,
      },
      write,
    ),
  ).toBe(true);
  expect(write).toHaveBeenCalledWith(
    expect.stringMatching(/personal-build-key\.ts$/),
    expect.stringContaining(JSON.stringify(synthetic)),
    { encoding: 'utf8', mode: 0o600 },
  );
});

test('new installs and the retired default use the tested model, preserving explicit alternatives', () => {
  expect(resolveModel(null)).toBe(DEFAULT_MODEL);
  expect(resolveModel('gemini-2.5-flash')).toBe(DEFAULT_MODEL);
  expect(resolveModel('gemini-explicit-user-choice')).toBe('gemini-explicit-user-choice');
});
