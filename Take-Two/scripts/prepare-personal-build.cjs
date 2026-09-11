/* global __dirname */
const fs = require('node:fs');
const path = require('node:path');

function preparePersonalBuild(env = process.env, writeFile = fs.writeFileSync) {
  if (env.EAS_BUILD_PROFILE !== 'personal') return false;
  if (env.EAS_BUILD !== 'true' || env.EAS_BUILD_PLATFORM !== 'android') {
    throw new Error('Personal credentials may only be injected on the EAS Android builder.');
  }
  const key = env.TAKE_TWO_PERSONAL_GEMINI_KEY?.trim();
  if (!key || !/^AIza[\w-]{35}$/.test(key)) {
    throw new Error('The personal build requires a valid Gemini credential in EAS secrets.');
  }
  writeFile(
    path.join(__dirname, '../src/services/security/personal-build-key.ts'),
    `// Generated only on the private EAS builder. Never commit or publish this file.\nexport const personalBuildKey: string | null = ${JSON.stringify(key)};\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
  return true;
}

module.exports = { preparePersonalBuild };
if (require.main === module && preparePersonalBuild()) {
  console.log('Personal Android credential configured. Value omitted.');
}
