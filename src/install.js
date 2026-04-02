const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

const SKILLS = [
  'transcription-speech-to-text-hebrew',
  'media-fixing-and-repair',
];

const FILES = ['SKILL.md', 'AGENTS.md'];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'textops-cli' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('\nTextOps Skills Installer\n');
  fs.mkdirSync(SKILLS_DIR, { recursive: true });

  for (const skill of SKILLS) {
    console.log(`→ ${skill}`);
    const skillDir = path.join(SKILLS_DIR, skill);
    fs.mkdirSync(skillDir, { recursive: true });

    for (const file of FILES) {
      const url = `https://raw.githubusercontent.com/TextOps/textops-skills/main/${skill}/${file}`;
      try {
        const content = await get(url);
        fs.writeFileSync(path.join(skillDir, file), content);
        console.log(`  ✓ ${file}`);
      } catch {
        console.log(`  - ${file} (not found, skipping)`);
      }
    }
  }

  console.log('\nDone! Restart Claude Code to load the skills.\n');
}

main();
