#!/usr/bin/env node

const [,, command, ...args] = process.argv;

const commands = {
  install: () => require('../src/install'),
  help: () => {
    console.log(`
textops - Install TextOps Claude Code skills

Usage:
  npx textops install          Install all skills
  npx textops install <skill>  Install a specific skill
  npx textops help             Show this help
`);
  }
};

if (!command || command === 'help' || command === '--help' || command === '-h') {
  commands.help();
  process.exit(0);
}

if (!commands[command]) {
  console.error(`Unknown command: ${command}`);
  commands.help();
  process.exit(1);
}

commands[command]();
