#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ORG = 'TextOps';
const SKILLS_REPO = 'textops-skills';
const SKILLS_DIR = path.join(os.homedir(), '.claude', 'skills');

const [,, , specificSkill] = process.argv;

function get(url) {
  return new Promise((resolve, reject) => {
    const options = { headers: { 'User-Agent': 'textops-cli' } };
    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        return get(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}: ${url}`));
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function getSkillDirs() {
  const apiUrl = `https://api.github.com/repos/${ORG}/${SKILLS_REPO}/contents`;
  const data = JSON.parse(await get(apiUrl));
  return data.filter(item => item.type === 'dir').map(item => item.name);
}

async function getSkillFiles(skillName) {
  const apiUrl = `https://api.github.com/repos/${ORG}/${SKILLS_REPO}/contents/${skillName}`;
  const data = JSON.parse(await get(apiUrl));
  return data.filter(item => item.type === 'file');
}

async function installSkill(skillName) {
  const skillDir = path.join(SKILLS_DIR, skillName);
  fs.mkdirSync(skillDir, { recursive: true });

  const files = await getSkillFiles(skillName);
  for (const file of files) {
    const content = await get(file.download_url);
    fs.writeFileSync(path.join(skillDir, file.name), content);
    console.log(`  ✓ ${file.name}`);
  }
}

async function main() {
  console.log(`\nTextOps Skills Installer\n`);

  fs.mkdirSync(SKILLS_DIR, { recursive: true });

  let skills;
  try {
    skills = await getSkillDirs();
  } catch (err) {
    console.error(`Failed to fetch skills list: ${err.message}`);
    process.exit(1);
  }

  if (specificSkill) {
    if (!skills.includes(specificSkill)) {
      console.error(`Skill "${specificSkill}" not found. Available: ${skills.join(', ')}`);
      process.exit(1);
    }
    skills = [specificSkill];
  }

  console.log(`Installing ${skills.length} skill(s) into ${SKILLS_DIR}\n`);

  for (const skill of skills) {
    console.log(`→ ${skill}`);
    try {
      await installSkill(skill);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log(`\nDone! Restart Claude Code to load the new skills.\n`);
}

main();
