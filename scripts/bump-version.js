import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, '../src/constants/version.js');
const packageJsonPath = path.join(__dirname, '../package.json');

// Read current version from src/constants/version.js
const versionFileContent = fs.readFileSync(versionFilePath, 'utf8');
const match = versionFileContent.match(/APP_VERSION\s*=\s*['"]v?(\d+)\.(\d+)\.(\d+)['"]/);

if (!match) {
  console.error('Could not parse version from', versionFilePath);
  process.exit(1);
}

let major = parseInt(match[1], 10);
let minor = parseInt(match[2], 10);
let patch = parseInt(match[3], 10);

// Increment rule: patch 0..9, next after 9 resets patch to 0 and increments minor
patch += 1;
if (patch > 9) {
  patch = 0;
  minor += 1;
  if (minor > 9) {
    minor = 0;
    major += 1;
  }
}

const newVersionStr = `${major}.${minor}.${patch}`;
const newFullVersion = `v${newVersionStr}`;

// Update src/constants/version.js
const newVersionFileContent = `export const APP_VERSION = '${newFullVersion}';\n`;
fs.writeFileSync(versionFilePath, newVersionFileContent, 'utf8');

// Update package.json
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  pkg.version = newVersionStr;
  fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
}

// Update index.html
const indexHtmlPath = path.join(__dirname, '../index.html');
if (fs.existsSync(indexHtmlPath)) {
  let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
  indexHtml = indexHtml.replace(/<title>.*?<\/title>/, `<title>人事異動案作成アプリ ${newFullVersion}</title>`);
  fs.writeFileSync(indexHtmlPath, indexHtml, 'utf8');
}

console.log(`Version bumped: v${match[1]}.${match[2]}.${match[3]} -> ${newFullVersion}`);
