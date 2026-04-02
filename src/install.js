const { execSync } = require('child_process');

execSync(
  'npx skills add https://github.com/TextOps/transcription-speech-to-text-hebrew --skill transcription-speech-to-text-hebrew',
  { stdio: 'inherit' }
);
