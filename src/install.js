const { execSync } = require('child_process');

const SKILLS = [
  {
    url: 'https://github.com/TextOps/textops-skills/tree/main/transcription-speech-to-text-hebrew',
    name: 'transcription-speech-to-text-hebrew',
  },
  {
    url: 'https://github.com/TextOps/textops-skills/tree/main/media-fixing-and-repair',
    name: 'media-fixing-and-repair',
  },
];

console.log('\nTextOps Skills Installer\n');

for (const skill of SKILLS) {
  console.log(`→ Installing ${skill.name}...`);
  try {
    execSync(`npx skills add ${skill.url} --skill ${skill.name}`, { stdio: 'inherit' });
    console.log(`  ✓ Done\n`);
  } catch {
    console.error(`  ✗ Failed to install ${skill.name}\n`);
  }
}

console.log('Done! Restart Claude Code to load the new skills.\n');
